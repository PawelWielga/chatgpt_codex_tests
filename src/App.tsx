import React, { useEffect } from "react";
import { SettingsProvider } from "@/settings/SettingsContext";
import Desktop from "@/desktop/Desktop";
import { WindowManager } from "@/window/WindowManager";

/**
 * Hook: Updates the #clock element textContent every second.
 * Side-effect is isolated and cleaned up on unmount.
 */
function useClock(): void {
  useEffect(() => {
    const el = document.getElementById("clock");
    const updateClock = () => {
      const now = new Date();
      const time = now.toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      if (el) el.textContent = time;
    };
    updateClock();
    const id = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(id);
  }, []);
}

export default function App(): React.ReactElement {
  useClock();
  return (
    <SettingsProvider>
      <WindowManager>
        <Desktop />
      </WindowManager>
    </SettingsProvider>
  );
}
