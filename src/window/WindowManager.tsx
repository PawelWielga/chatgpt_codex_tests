import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import "./window.css";

export type WindowSpec = {
  id: string;
  title: string;
  content: React.ReactNode;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

export type WindowHandle = {
  id: string;
  title: string;
  minimized: boolean;
};

type WindowState = WindowSpec & { z: number; minimized: boolean; };

type Ctx = {
  windows: WindowState[];
  handles: WindowHandle[];
  open: (spec: WindowSpec) => void;
  close: (id: string) => void;
  minimize: (id: string) => void;
  maximizeToggle: (id: string) => void;
  focus: (id: string) => void;
};

const WindowCtx = createContext<Ctx | undefined>(undefined);

export function useWindowManager() {
  const ctx = useContext(WindowCtx);
  if (!ctx) throw new Error("useWindowManager must be used within WindowManager");
  return ctx;
}

export function WindowManager({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const zCounter = useRef(1500);

  const open = useCallback((spec: WindowSpec) => {
    setWindows(prev => {
      const exist = prev.find(w => w.id === spec.id);
      if (exist) {
        // unminimize and focus
        return prev.map(w => w.id === spec.id ? { ...w, minimized: false, z: ++zCounter.current } : w);
      }
      const next: WindowState = {
        ...spec,
        x: spec.x ?? 100 + Math.floor(Math.random() * 80),
        y: spec.y ?? 60 + Math.floor(Math.random() * 60),
        width: spec.width ?? 960,
        height: spec.height ?? 720,
        z: ++zCounter.current,
        minimized: false,
      };
      return [...prev, next];
    });
  }, []);

  const close = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  const minimize = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: true } : w));
  }, []);

  const maximizeToggle = useCallback((id: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w;
      const isMax = (w as any).max === 1;
      if (isMax) {
        const saved = (w as any).savedRect as { x: number; y: number; width: number; height: number; };
        return { ...w, x: saved.x, y: saved.y, width: saved.width, height: saved.height, ...( { max: 0 } as any) };
      } else {
        const savedRect = { x: w.x!, y: w.y!, width: w.width!, height: w.height! };
        // Use full viewport height when maximized so full game boards fit
        return { ...w, x: 0, y: 0, width: window.innerWidth, height: window.innerHeight, ...( { max: 1, savedRect } as any) };
      }
    }));
  }, []);

  const focus = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, z: ++zCounter.current, minimized: false } : w));
  }, []);

  const ctx = useMemo<Ctx>(() => ({
    windows,
    handles: windows.map(w => ({ id: w.id, title: w.title, minimized: w.minimized })),
    open, close, minimize, maximizeToggle, focus
  }), [windows, open, close, minimize, maximizeToggle, focus]);

  return (
    <WindowCtx.Provider value={ctx}>
      {children}
      <div className="wm-root" aria-live="polite">
        {windows.map(w => (
          <WindowFrame key={w.id} state={w} onClose={close} onMinimize={minimize} onMaximize={maximizeToggle} onFocus={focus} onUpdate={(patch) => {
            setWindows(prev => prev.map(x => x.id === w.id ? { ...x, ...patch } as WindowState : x));
          }} />
        ))}
      </div>
    </WindowCtx.Provider>
  );
}

function WindowFrame(props: {
  state: WindowState;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  onUpdate: (patch: Partial<WindowState>) => void;
}) {
  const { state: w } = props;
  const dragging = useRef<{ dx: number; dy: number } | null>(null);
  const resizing = useRef<{ rx: number; ry: number; rw: number; rh: number } | null>(null);

  const onHeaderDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".window-controls")) return;
    props.onFocus(w.id);
    dragging.current = { dx: e.clientX - (w.x || 0), dy: e.clientY - (w.y || 0) };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    e.preventDefault();
  };

  const onMove = (e: MouseEvent) => {
    if (dragging.current) {
      const maxW = window.innerWidth;
      // Allow windows to use full viewport height so tall content isn't clipped
      const maxH = window.innerHeight;
      const nx = Math.max(0, Math.min(e.clientX - dragging.current.dx, maxW - (w.width || 0)));
      const ny = Math.max(0, Math.min(e.clientY - dragging.current.dy, maxH - (w.height || 0)));
      props.onUpdate({ x: nx, y: ny });
    } else if (resizing.current) {
      const nx = Math.max(520, e.clientX - resizing.current.rx + resizing.current.rw);
      const ny = Math.max(640, e.clientY - resizing.current.ry + resizing.current.rh);
      props.onUpdate({ width: nx, height: ny });
    }
  };

  const onUp = () => {
    dragging.current = null;
    resizing.current = null;
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };

  const onResizeDown = (e: React.MouseEvent) => {
    props.onFocus(w.id);
    resizing.current = { rx: e.clientX, ry: e.clientY, rw: w.width || 960, rh: w.height || 720 };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    e.preventDefault();
  };

  if (w.minimized) return null;

  const style: React.CSSProperties = {
    left: w.x, top: w.y, width: w.width, height: w.height, zIndex: w.z,
  };

  return (
    <div className="window" style={style} role="dialog" aria-label={w.title}>
      <div className="window-header" onMouseDown={onHeaderDown} onDoubleClick={() => props.onMaximize(w.id)}>
        <div className="window-title">{w.title}</div>
        <div className="window-controls">
          <button className="window-control" title="Minimalizuj" onClick={() => props.onMinimize(w.id)}>−</button>
          <button className="window-control" title="Maksymalizuj" onClick={() => props.onMaximize(w.id)}>□</button>
          <button className="window-control close" title="Zamknij" onClick={() => props.onClose(w.id)}>×</button>
        </div>
      </div>
      <div className="window-content">
        {w.content}
      </div>
      <div className="window-resizer" onMouseDown={onResizeDown} />
    </div>
  );
}