import React, { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useSettings } from "@/settings/SettingsContext";
import "./layout.css";
import {
  isFullscreen,
  requestAppFullscreen,
  exitAppFullscreen,
  onFullscreenChange,
} from "@/utils/fullscreen";

/**
 * Layout: Sidebar with navigation and global settings, plus main content outlet.
 * - Uses strict typing on settings handlers.
 * - Improves a11y of controls with aria attributes and distinct icons.
 */
export default function Layout(): React.ReactElement {
  const { settings, setTheme, toggleSound, setDifficulty } = useSettings();
  const [fs, setFs] = useState<boolean>(isFullscreen());

  useEffect(() => onFullscreenChange(() => setFs(isFullscreen())), []);

  const handleToggleFullscreen = async (): Promise<void> => {
    try {
      if (fs) {
        await exitAppFullscreen();
      } else {
        await requestAppFullscreen();
      }
    } catch {
      // no-op; prompt component handles user guidance
    }
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <span aria-label="Game SPA" role="img">🎮</span> Game SPA
          <button
            type="button"
            className="fs-toggle-btn"
            onClick={handleToggleFullscreen}
            title={fs ? "Wyjdź z pełnego ekranu" : "Pełny ekran"}
            aria-pressed={fs}
            aria-label={fs ? "Wyłącz pełny ekran" : "Włącz pełny ekran"}
          >
            {fs ? "⤢" : "⤢"}
            <span className="fs-toggle-label">{fs ? " Exit FS" : " Fullscreen"}</span>
          </button>
        </div>

        <nav className="nav" aria-label="Nawigacja">
          <Link to="/">Home</Link>
          <Link to="/snake">Snake</Link>
          {/* Add more routes as you migrate games */}
        </nav>

        <section className="settings" aria-label="Ustawienia">
          <h3>Settings</h3>

          <div className="row">
            <label htmlFor="theme">Theme</label>
            <select
              id="theme"
              value={settings.theme}
              onChange={(e) => setTheme(e.target.value as typeof settings.theme)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="row">
            <span id="sound-label">Sound</span>
            <button
              type="button"
              aria-labelledby="sound-label"
              aria-pressed={settings.sound}
              onClick={toggleSound}
            >
              {settings.sound ? "On" : "Off"}
            </button>
          </div>

          <div className="row">
            <label htmlFor="difficulty">Difficulty</label>
            <select
              id="difficulty"
              value={settings.difficulty}
              onChange={(e) => setDifficulty(e.target.value as typeof settings.difficulty)}
            >
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </section>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}