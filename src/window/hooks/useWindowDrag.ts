import { useRef } from "react";

export type DragState = {
  dx: number;
  dy: number;
};

export type DragHandlers = {
  onMouseDown: (e: React.MouseEvent, start: { x: number; y: number }) => void;
  onCleanup: () => void;
};

/**
 * useWindowDrag
 * Encapsulates window header dragging logic with viewport clamping and cleanup.
 * The caller provides current top-left (x,y) and dimensions (width,height) plus viewport size,
 * and receives onMouseDown to start drag and a cleanup handler.
 */
export function useWindowDrag(
  onUpdate: (patch: { x: number; y: number }) => void,
  getCurrentRect: () => { x: number; y: number; width: number; height: number },
  getViewport: () => { width: number; height: number }
): DragHandlers {
  const dragging = useRef<DragState | null>(null);

  const onMove = (e: MouseEvent) => {
    if (!dragging.current) return;
    const vp = getViewport();
    const rect = getCurrentRect();
    const maxX = Math.max(0, vp.width - rect.width);
    const maxY = Math.max(0, vp.height - rect.height);
    const nx = Math.max(0, Math.min(e.clientX - dragging.current.dx, maxX));
    const ny = Math.max(0, Math.min(e.clientY - dragging.current.dy, maxY));
    onUpdate({ x: Math.round(nx), y: Math.round(ny) });
  };

  const onUp = () => {
    dragging.current = null;
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };

  const onMouseDown = (e: React.MouseEvent, start: { x: number; y: number }) => {
    // Only start drag with primary button
    if (e.button !== 0) return;
    dragging.current = { dx: e.clientX - (start.x || 0), dy: e.clientY - (start.y || 0) };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp, { once: true });
  };

  const onCleanup = () => {
    dragging.current = null;
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };

  return { onMouseDown, onCleanup };
}