import { useRef } from "react";

export type ResizeState = {
  rx: number; // mouse start x
  ry: number; // mouse start y
  rw: number; // rect width at start
  rh: number; // rect height at start
};

export type ResizeConstraints = {
  minWidth: number;
  minHeight: number;
  maxWidth?: number;
  maxHeight?: number;
};

export type ResizeHandlers = {
  onMouseDown: (e: React.MouseEvent, start: { width: number; height: number }) => void;
  onCleanup: () => void;
};

/**
 * useWindowResize
 * Encapsulates bottom-right corner resizing with constraints and cleanup.
 * The caller supplies constraints and receives onMouseDown to start a resize interaction.
 */
export function useWindowResize(
  onUpdate: (patch: { width: number; height: number }) => void,
  constraints: ResizeConstraints
): ResizeHandlers {
  const resizing = useRef<ResizeState | null>(null);

  const clamp = (val: number, min: number, max?: number) => {
    const lo = Math.max(val, min);
    return typeof max === "number" ? Math.min(lo, max) : lo;
  };

  const onMove = (e: MouseEvent) => {
    const st = resizing.current;
    if (!st) return;
    const nextW = clamp(e.clientX - st.rx + st.rw, constraints.minWidth, constraints.maxWidth);
    const nextH = clamp(e.clientY - st.ry + st.rh, constraints.minHeight, constraints.maxHeight);
    onUpdate({ width: Math.round(nextW), height: Math.round(nextH) });
  };

  const onUp = () => {
    resizing.current = null;
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };

  const onMouseDown = (e: React.MouseEvent, start: { width: number; height: number }) => {
    // Only start with primary button
    if (e.button !== 0) return;
    resizing.current = { rx: e.clientX, ry: e.clientY, rw: start.width, rh: start.height };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp, { once: true });
  };

  const onCleanup = () => {
    resizing.current = null;
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };

  return { onMouseDown, onCleanup };
}