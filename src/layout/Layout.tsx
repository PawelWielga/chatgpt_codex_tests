import React, { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useSettings } from "@/settings/SettingsContext";
import "./layout.css";
import { isFullscreen, requestAppFullscreen, exitAppFullscreen, onFullscreenChange } from "@/utils/fullscreen";

export default function Layout() {
  const { settings, setTheme, toggleSound, setDifficulty } = useSettings();
  const [fs, setFs] = useState<boolean>(isFullscreen());

  useEffect(() => {
    return onFullscreenChange(() => setFs(isFullscreen()));
  }, []);

  const handleToggleFullscreen = async () => {
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
          Game SPA
          <button className="fs-toggle-btn" onClick={handleToggleFullscreen} title={fs ? "Wyjdź z pełnego ekranu" : "Pełny ekran"}>
            {fs ? "⤢" : "⤢"}
            <span className="fs-toggle-label">{fs ? " Exit FS" : " Fullscreen"}</span>
          </button>
        </div>
        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/snake">Snake</Link>
          {/* Add more routes as you migrate games */}
        </nav>

        <section className="settings">
          <h3>Settings</h3>
          <div className="row">
            <label>Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => setTheme(e.target.value as any)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="row">
            <label>Sound</label>
            <button onClick={toggleSound}>
              {settings.sound ? "On" : "Off"}
            </button>
          </div>

          <div className="row">
            <label>Difficulty</label>
            <select
              value={settings.difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
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