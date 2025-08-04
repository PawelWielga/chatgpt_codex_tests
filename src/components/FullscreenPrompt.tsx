import React, { useEffect, useMemo, useState } from "react";
import { isFullscreen, requestAppFullscreen, onFullscreenChange } from "@/utils/fullscreen";

/**
 * FullscreenPrompt can render either as an overlay modal (standalone) or as embedded
 * content inside a WindowManager window (embed mode).
 */
type Props = {
  rootElementId?: string;
  /**
   * If true, we will NOT persist the dismissal. The prompt will reappear on next page load.
   * Default: false (persist for session).
   */
  noSessionPersist?: boolean;
  /**
   * Called when user dismisses the overlay.
   */
  onDismiss?: () => void;
  /**
   * Called after successful enter to fullscreen.
   */
  onEntered?: () => void;
};

const SESSION_KEY = "fullscreenPromptDismissed";

export default function FullscreenPrompt({
  rootElementId,
  noSessionPersist = false,
  onDismiss,
  onEntered,
}: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetEl = useMemo(() => {
    if (rootElementId) {
      return document.getElementById(rootElementId) ?? document.documentElement;
    }
    return document.documentElement;
  }, [rootElementId]);

  // Auto-open overlay when not fullscreen (unless dismissed this session)
  useEffect(() => {
    const dismissed = sessionStorage.getItem(SESSION_KEY) === "1";
    if (!isFullscreen() && !(dismissed && !noSessionPersist)) {
      const id = setTimeout(() => setOpen(true), 300);
      return () => clearTimeout(id);
    }
  }, [noSessionPersist]);

  useEffect(() => {
    return onFullscreenChange(() => {
      if (isFullscreen()) {
        setOpen(false);
        onEntered?.();
      }
    });
  }, [onEntered]);

  const handleEnter = async () => {
    setError(null);
    try {
      await requestAppFullscreen(targetEl as HTMLElement);
      setOpen(false);
      onEntered?.();
    } catch (e: any) {
      setError(e?.message ?? "Nie udało się przejść w tryb pełnoekranowy.");
    }
  };

  const handleDismiss = () => {
    if (!noSessionPersist) {
      sessionStorage.setItem(SESSION_KEY, "1");
    }
    setOpen(false);
    onDismiss?.();
  };


  // Overlay rendering
  if (!open) return null;

  return (
    <div className="fs-modal-overlay" role="dialog" aria-modal="true">
      <div className="fs-dialog" role="document">
        <div className="fs-dialog-header">
          <div className="fs-dialog-title">Tryb pełnoekranowy</div>
          <button className="fs-dialog-close" title="Zamknij" onClick={handleDismiss}>×</button>
        </div>

        <div className="fs-dialog-content">
          <div className="fs-icon" aria-hidden="true">ℹ️</div>
          <div className="fs-text">
            <div className="fs-title">Tryb pełnoekranowy</div>
            <div className="fs-desc">
              Dla lepszej imersji możesz uruchomić aplikację w trybie pełnoekranowym.
            </div>
            {error && <div className="fs-error">{error}</div>}
          </div>

          <div className="fs-actions">
            <button className="fs-secondary" onClick={handleDismiss}>Nie teraz</button>
            <button className="fs-primary" onClick={handleEnter}>Przejdź do pełnego ekranu</button>
          </div>
        </div>
      </div>
    </div>
  );
}