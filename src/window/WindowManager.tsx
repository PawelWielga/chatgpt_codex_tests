import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import "./window.css";
import { useWindowResize } from "./hooks/useWindowResize";
import { getWindowDefaults } from "./registry";
import { useWindowDrag } from "./hooks/useWindowDrag";
import { useSettings } from "@/settings/SettingsContext";

/** Public spec for opening a window */
export type WindowSpec = {
  id: string;
  title?: string;
  content: React.ReactNode;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
};

/** Handle summary for taskbar */
export type WindowHandle = {
  id: string;
  title: string;
  minimized: boolean;
};

export type SavedRect = { x: number; y: number; width: number; height: number };

type WindowState = Required<Pick<WindowSpec, "id" | "content">> &
  Omit<WindowSpec, "id" | "content"> & {
    title: string;
    x: number;
    y: number;
    width: number;
    height: number;
    z: number;
    minimized: boolean;
    maximized: boolean;
    savedRect?: SavedRect;
  };

type Ctx = {
  windows: WindowState[];
  handles: WindowHandle[];
  open: (spec: WindowSpec) => void;
  close: (id: string) => void;
  minimize: (id: string) => void;
  maximizeToggle: (id: string) => void;
  focus: (id: string) => void;
};

const MIN_WIDTH_DEFAULT = 520;
const MIN_HEIGHT_DEFAULT = 640;
const KEY_NUDGE_STEP = 10;

// Stable context for devtools; avoid redundant redefinition
const WindowCtx = createContext<Ctx | undefined>(undefined);
(WindowCtx as unknown as { displayName?: string }).displayName = "WindowCtx";

/**
 * Custom hook to access WindowManager context.
 * Keep as a stable named function (not reassigned) for Fast Refresh.
 */
export function useWindowManager(): Ctx {
  const ctx = useContext(WindowCtx);
  if (!ctx) throw new Error("useWindowManager must be used within WindowManager");
  return ctx;
}

/**
 * Provider component for window management.
 * Keep as a stable named function export for Fast Refresh.
 */
export function WindowManager({ children }: { children: React.ReactNode }): React.ReactElement {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const zCounter = useRef(1500);
  const { settings } = useSettings();

  const open = useCallback((spec: WindowSpec) => {
    setWindows((prev) => {
      const exist = prev.find((w) => w.id === spec.id);
      if (exist) {
        // unminimize and focus
        return prev.map((w) =>
          w.id === spec.id ? { ...w, minimized: false, z: ++zCounter.current } : w
        );
      }

      // Resolve defaults from registry if present
      const defaults = getWindowDefaults(spec.id);

      const width = spec.width ?? defaults?.width ?? 960;
      const height = spec.height ?? defaults?.height ?? 720;
      const minWidth = spec.minWidth ?? defaults?.minWidth ?? MIN_WIDTH_DEFAULT;
      const minHeight = spec.minHeight ?? defaults?.minHeight ?? MIN_HEIGHT_DEFAULT;

      const next: WindowState = {
        id: spec.id,
        content: spec.content,
        title: spec.title ?? defaults?.title ?? spec.id,
        x: (() => {
          // Load persisted position if enabled
          if (settings.windowDrag.persistPositions) {
            try {
              const raw = localStorage.getItem(`wm:pos:${spec.id}`);
              if (raw) {
                const parsed = JSON.parse(raw);
                if (typeof parsed?.x === "number") return parsed.x as number;
              }
            } catch {}
          }
          return spec.x ?? defaults?.x ?? 100 + Math.floor(Math.random() * 80);
        })(),
        y: (() => {
          if (settings.windowDrag.persistPositions) {
            try {
              const raw = localStorage.getItem(`wm:pos:${spec.id}`);
              if (raw) {
                const parsed = JSON.parse(raw);
                if (typeof parsed?.y === "number") return parsed.y as number;
              }
            } catch {}
          }
          return spec.y ?? defaults?.y ?? 60 + Math.floor(Math.random() * 60);
        })(),
        width,
        height,
        minWidth,
        minHeight,
        maxWidth: spec.maxWidth ?? defaults?.maxWidth ?? undefined,
        maxHeight: spec.maxHeight ?? defaults?.maxHeight ?? undefined,
        z: ++zCounter.current,
        minimized: false,
        maximized: false,
      };
      return [...prev, next];
    });
  }, [settings.windowDrag.persistPositions]);

  const close = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const minimize = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, minimized: true } : w))
    );
  }, []);

  const maximizeToggle = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        if (w.maximized) {
          const saved = w.savedRect;
          if (saved) {
            return {
              ...w,
              x: saved.x,
              y: saved.y,
              width: saved.width,
              height: saved.height,
              maximized: false,
              savedRect: undefined,
            };
          }
          return { ...w, maximized: false, savedRect: undefined };
        } else {
          const savedRect: SavedRect = {
            x: w.x,
            y: w.y,
            width: w.width,
            height: w.height,
          };
          // Full viewport
          return {
            ...w,
            x: 0,
            y: 0,
            width: window.innerWidth,
            height: window.innerHeight,
            maximized: true,
            savedRect,
          };
        }
      })
    );
  }, []);

  const focus = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, z: ++zCounter.current, minimized: false } : w
      )
    );
  }, []);

  const ctx = useMemo<Ctx>(
    () => ({
      windows,
      handles: windows.map((w) => ({
        id: w.id,
        title: w.title,
        minimized: w.minimized,
      })),
      open,
      close,
      minimize,
      maximizeToggle,
      focus,
    }),
    [windows, open, close, minimize, maximizeToggle, focus]
  );

  // Global keyboard shortcuts for focused window
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Determine top-most non-minimized window as active
      const active = [...windows].filter((w) => !w.minimized).sort((a, b) => b.z - a.z)[0];
      if (!active) return;

      // ESC minimize
      if (e.key === "Escape") {
        minimize(active.id);
        return;
      }
      // Alt+Enter toggle maximize
      if (e.key === "Enter" && e.altKey) {
        e.preventDefault();
        maximizeToggle(active.id);
        return;
      }
      // Shift+Arrow nudge
      if (e.shiftKey && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        setWindows((prev) =>
          prev.map((w) => {
            if (w.id !== active.id || w.maximized) return w;
            const dx =
              e.key === "ArrowRight" ? KEY_NUDGE_STEP : e.key === "ArrowLeft" ? -KEY_NUDGE_STEP : 0;
            const dy =
              e.key === "ArrowDown" ? KEY_NUDGE_STEP : e.key === "ArrowUp" ? -KEY_NUDGE_STEP : 0;
            const nx = Math.max(
              0,
              Math.min(w.x + dx, Math.max(0, window.innerWidth - w.width)) // remove redundant nullish checks
            );
            const ny = Math.max(
              0,
              Math.min(w.y + dy, Math.max(0, window.innerHeight - w.height))
            );
            return { ...w, x: nx, y: ny };
          })
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [windows, minimize, maximizeToggle]);

  return (
    <WindowCtx.Provider value={ctx}>
      {children}
      <div className="wm-root" aria-live="polite">
        {windows.map((w, _i, arr) => (
          <WindowFrame
            key={w.id}
            state={w}
            topMostId={[...arr].filter((x) => !x.minimized).sort((a, b) => b.z - a.z)[0]?.id}
            onClose={close}
            onMinimize={minimize}
            onMaximize={maximizeToggle}
            onFocus={focus}
            onPatch={(patch) => {
              // DIAG: log every position patch
              if ("x" in patch || "y" in patch) {
                // eslint-disable-next-line no-console
                console.debug("[WM][patch] id=%s ->", w.id, { x: patch.x, y: patch.y });
              }
              setWindows((prev) =>
                prev.map((x) => (x.id === w.id ? { ...x, ...patch } : x))
              );

              // Persist position if enabled (always attempt; storage errors ignored)
              try {
                if (("x" in patch || "y" in patch)) {
                  const key = `wm:pos:${w.id}`;
                  const nx = ("x" in patch && typeof patch.x === "number") ? patch.x : w.x;
                  const ny = ("y" in patch && typeof patch.y === "number") ? patch.y : w.y;
                  localStorage.setItem(key, JSON.stringify({ x: nx, y: ny }));
                }
              } catch {}

              // Force immediate style sync for the active window to bypass any render delay
              if (("x" in patch || "y" in patch)) {
                const el = document.querySelector<HTMLElement>(`.window[aria-label="${w.title}"]`);
                if (el) {
                  if (typeof patch.x === "number") el.style.left = `${patch.x}px`;
                  if (typeof patch.y === "number") el.style.top = `${patch.y}px`;
                }
              }
            }}
          />
        ))}
      </div>
    </WindowCtx.Provider>
  );
}

/**
 * Internal presentational component for a single window frame.
 * Declared as a function to keep export surface consistent.
 */
function WindowFrame(props: {
  state: WindowState;
  topMostId?: string;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  onPatch: (patch: Partial<WindowState>) => void;
}): React.ReactElement | null {
  const { state: w } = props;

  // Derive constraints
  const minWidth = w.minWidth ?? MIN_WIDTH_DEFAULT;
  const minHeight = w.minHeight ?? MIN_HEIGHT_DEFAULT;

  // Resize hook (kept)
  const resize = useWindowResize(
    (patch) => props.onPatch(patch),
    { minWidth, minHeight, maxWidth: w.maxWidth, maxHeight: w.maxHeight }
  );

  useEffect(() => () => resize.onCleanup(), [resize]);

  // Dragging
  const headerRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  // Bind drag behavior
  useWindowDrag(
    (p) => props.onPatch(p),
    () => ({
      id: w.id,
      x: w.x,
      y: w.y,
      width: w.width,
      height: w.height,
      maximized: w.maximized,
    }),
    { headerEl: headerRef.current, contentEl: contentRef.current }
  );

  const onResizeDown = (e: React.MouseEvent) => {
    props.onFocus(w.id);
    resize.onMouseDown(e, { width: w.width, height: w.height });
    e.preventDefault();
  };

  if (w.minimized) return null;

  const style: React.CSSProperties = {
    left: w.x,
    top: w.y,
    width: w.width,
    height: w.height,
    zIndex: w.z,
    position: "absolute",
    transform: "translateZ(0)",
    pointerEvents: "auto"
  };

  const ariaModal = props.topMostId === w.id && w.maximized;

  return (
    <div
      className="window"
      style={style}
      role="dialog"
      aria-label={w.title}
      aria-modal={ariaModal || undefined}
      data-maximized={w.maximized ? "1" : undefined}
    >
      <div
        className="window-header"
        ref={headerRef}
        onDoubleClick={() => props.onMaximize(w.id)}
        tabIndex={0}
        aria-roledescription="Window title bar. Drag to move, double click to maximize."
        title="Drag to move, double click to maximize"
        onPointerDown={(e) => {
          // Ensure window is focused before drag so z-index and style sync apply to the active window
          props.onFocus(w.id);
        }}
      >
        <div className="window-title">{w.title}</div>
        {/* Prevent drags starting on control buttons from bubbling to header */}
        <div
          className="window-controls"
          onPointerDown={(e) => {
            // Stop header drag initiation when pressing buttons
            e.stopPropagation();
          }}
        >
          <button
            className="window-control"
            type="button"
            title="Minimalizuj"
            onClick={() => props.onMinimize(w.id)}
            aria-label={`Minimalizuj ${w.title}`}
          >
            −
          </button>
          <button
            className="window-control"
            type="button"
            title="Maksymalizuj"
            onClick={() => props.onMaximize(w.id)}
            aria-pressed={w.maximized}
            aria-label={`${w.maximized ? "Przywróć" : "Maksymalizuj"} ${w.title}`}
          >
            □
          </button>
          <button
            className="window-control close"
            type="button"
            title="Zamknij"
            onClick={() => props.onClose(w.id)}
            aria-label={`Zamknij ${w.title}`}
          >
            ×
          </button>
        </div>
      </div>
      <div
        className="window-content"
        ref={contentRef}
        onPointerDown={() => {
          // Also focus when starting content-modifier drags on first interaction
          props.onFocus(w.id);
        }}
      >
        {w.content}
      </div>
      {
        !w.maximized && (
          <div
            className="window-resizer"
            onMouseDown={onResizeDown}
            aria-label="Resize window"
            role="separator"
            title="Resize window"
          />
        )
      }
    </div>
  );
}

// Utility placeholder retained intentionally for future feature work
function isTopMost(_w: WindowState): boolean {
  return false;
}