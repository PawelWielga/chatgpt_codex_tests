/**
 * Strongly-typed Fullscreen utilities with graceful vendor-prefixed fallbacks.
 * Public API preserved: isFullscreen, requestAppFullscreen, exitAppFullscreen, onFullscreenChange.
 * Added helpers: isFullscreenSupported, getFullscreenElement, canRequestFullscreen.
 */

// Minimal vendor-augmented interfaces
type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
};

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

// Detection helpers
export function getFullscreenElement(): Element | null {
  const doc = document as FullscreenDocument;
  return (
    document.fullscreenElement ??
    doc.webkitFullscreenElement ??
    doc.msFullscreenElement ??
    null
  );
}

export function isFullscreenSupported(): boolean {
  const el = document.documentElement as FullscreenElement;
  return !!(
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.msRequestFullscreen
  );
}

export function canRequestFullscreen(el?: HTMLElement): boolean {
  const anyEl = (el ?? document.documentElement) as FullscreenElement;
  return !!(
    anyEl.requestFullscreen ||
    anyEl.webkitRequestFullscreen ||
    anyEl.msRequestFullscreen
  );
}

// Existing API (kept)
export function isFullscreen(): boolean {
  return getFullscreenElement() != null;
}

export async function requestAppFullscreen(root?: HTMLElement): Promise<void> {
  const el = (root ?? document.documentElement) as FullscreenElement;

  if (el.requestFullscreen) {
    await el.requestFullscreen();
    return;
  }
  if (el.webkitRequestFullscreen) {
    await el.webkitRequestFullscreen();
    return;
  }
  if (el.msRequestFullscreen) {
    await el.msRequestFullscreen();
    return;
  }
  throw new Error("Fullscreen API is not supported");
}

export async function exitAppFullscreen(): Promise<void> {
  const doc = document as FullscreenDocument;

  if (document.exitFullscreen) {
    await document.exitFullscreen();
    return;
  }
  if (doc.webkitExitFullscreen) {
    await doc.webkitExitFullscreen();
    return;
  }
  if (doc.msExitFullscreen) {
    await doc.msExitFullscreen();
    return;
  }
}

/**
 * Subscribe to fullscreenchange events (including vendor-prefixed).
 * Returns an unsubscribe function.
 */
export function onFullscreenChange(cb: () => void): () => void {
  const handler = () => cb();

  document.addEventListener("fullscreenchange", handler, { passive: true } as AddEventListenerOptions);
  // Prefixed events fallback
  document.addEventListener("webkitfullscreenchange", handler as any, { passive: true } as AddEventListenerOptions);
  document.addEventListener("msfullscreenchange", handler as any, { passive: true } as AddEventListenerOptions);

  return () => {
    document.removeEventListener("fullscreenchange", handler);
    document.removeEventListener("webkitfullscreenchange", handler as any);
    document.removeEventListener("msfullscreenchange", handler as any);
  };
}