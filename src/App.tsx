import React, { useEffect } from "react";
import { SettingsProvider } from "@/settings/SettingsContext";
import Desktop from "@/desktop/Desktop";
import { WindowManager, useWindowManager } from "@/window/WindowManager";
import FullscreenPrompt from "@/components/FullscreenPrompt";
import { isFullscreen, onFullscreenChange } from "@/utils/fullscreen";

function useClock() {
  useEffect(() => {
    const el = document.getElementById("clock");
    const tick = () => {
      const now = new Date();
      const time = now.toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      if (el) el.textContent = time;
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
}

/* FullscreenPromptOpener temporarily disabled */

export default function App() {
  useClock();
  return (
    <SettingsProvider>
      <WindowManager>
        {/* Fullscreen prompt disabled for now */}
        {/* <FullscreenPromptOpener /> */}
        <Desktop />
      </WindowManager>
    </SettingsProvider>
  );
}
