export function isFullscreen(): boolean {
  return !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement);
}

export async function requestAppFullscreen(root?: HTMLElement): Promise<void> {
  const el = root ?? document.documentElement;
  const anyEl: any = el as any;

  if (anyEl.requestFullscreen) {
    await anyEl.requestFullscreen();
    return;
  }
  if (anyEl.webkitRequestFullscreen) {
    await anyEl.webkitRequestFullscreen();
    return;
  }
  if (anyEl.msRequestFullscreen) {
    await anyEl.msRequestFullscreen();
    return;
  }
  throw new Error("Fullscreen API is not supported");
}

export async function exitAppFullscreen(): Promise<void> {
  const doc: any = document as any;

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

export function onFullscreenChange(cb: () => void): () => void {
  const handler = () => cb();
  document.addEventListener("fullscreenchange", handler);
  document.addEventListener("webkitfullscreenchange", handler as any);
  document.addEventListener("msfullscreenchange", handler as any);
  return () => {
    document.removeEventListener("fullscreenchange", handler);
    document.removeEventListener("webkitfullscreenchange", handler as any);
    document.removeEventListener("msfullscreenchange", handler as any);
  };
}