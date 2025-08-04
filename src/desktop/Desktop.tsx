import React, { useMemo, useRef, useState } from "react";
import "./desktop.css";
import { useWindowManager } from "@/window/WindowManager";
import { getWindowDefaults } from "@/window/registry";

type Shortcut = {
  id: string;
  icon: string; // emoji
  label: string;
  implemented?: boolean;
};

export default function Desktop(): React.ReactElement {
  const { open, handles, focus } = useWindowManager();

  // Centralize shortcut definitions; labels can later be i18n'ed
  const shortcuts: Shortcut[] = useMemo(
    () => [
      { id: "tictactoe", icon: "🔢", label: "Kółko i Krzyżyk", implemented: false },
      { id: "memo", icon: "🧠", label: "Memo", implemented: false },
      { id: "snake", icon: "🐍", label: "Wąż", implemented: true },
      { id: "rps", icon: "✊", label: "Kamień Papier Nożyce", implemented: false },
      { id: "minesweeper", icon: "🚩", label: "Saper", implemented: true },
      { id: "tetris", icon: "🧱", label: "Tetris", implemented: false },
      { id: "connect4", icon: "🟡", label: "Connect 4", implemented: false },
      { id: "pong", icon: "🏓", label: "Pong", implemented: false },
      { id: "cards", icon: "🃏", label: "Ewolucja", implemented: false },
      { id: "calc", icon: "🖩", label: "Catculator", implemented: false },
      { id: "settings", icon: "⚙️", label: "Ustawienia", implemented: false },
    ],
    []
  );

  const visibleShortcuts = shortcuts.filter((s) => s.implemented);

  const handleOpenById = async (id: string): Promise<void> => {
    const def = getWindowDefaults(id);
    if (!def) return; // not yet implemented or unknown
    // Lazy-load component
    const mod = await def.loader();
    const Content = mod.default as React.ComponentType;
    open({
      id: def.id,
      title: def.title,
      content: <Content />,
      width: def.width,
      height: def.height,
      x: def.x,
      y: def.y,
      minWidth: def.minWidth,
      minHeight: def.minHeight,
      maxWidth: def.maxWidth,
      maxHeight: def.maxHeight,
    });
  };

  // Accessibility: roving tabindex over desktop icons
  const [activeIndex, setActiveIndex] = useState(0);
  const iconRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const moveFocus = (delta: number) => {
    if (visibleShortcuts.length === 0) return;
    const next = (activeIndex + delta + visibleShortcuts.length) % visibleShortcuts.length;
    setActiveIndex(next);
    const el = iconRefs.current[next];
    el?.focus();
  };

  const onIconKeyDown = (e: React.KeyboardEvent, idx: number, id: string) => {
    // Set current index when any keydown occurs on that icon
    if (activeIndex !== idx) setActiveIndex(idx);

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        handleOpenById(id);
        break;
      case "ArrowDown":
      case "ArrowRight":
        e.preventDefault();
        moveFocus(1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        e.preventDefault();
        moveFocus(-1);
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        iconRefs.current[0]?.focus();
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(visibleShortcuts.length - 1);
        iconRefs.current[visibleShortcuts.length - 1]?.focus();
        break;
    }
  };

  // Taskbar keyboard navigation
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const taskRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const moveTaskFocus = (delta: number) => {
    if (handles.length === 0) return;
    const next = (activeTaskIndex + delta + handles.length) % handles.length;
    setActiveTaskIndex(next);
    taskRefs.current[next]?.focus();
  };

  const onTaskKeyDown = (e: React.KeyboardEvent, idx: number, id: string) => {
    if (activeTaskIndex !== idx) setActiveTaskIndex(idx);
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        focus(id);
        break;
      case "ArrowRight":
        e.preventDefault();
        moveTaskFocus(1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        moveTaskFocus(-1);
        break;
      case "Home":
        e.preventDefault();
        setActiveTaskIndex(0);
        taskRefs.current[0]?.focus();
        break;
      case "End":
        e.preventDefault();
        setActiveTaskIndex(Math.max(0, handles.length - 1));
        taskRefs.current[Math.max(0, handles.length - 1)]?.focus();
        break;
    }
  };

  // Stable callback refs to satisfy TS Ref signature (must return void)
  const setIconRef = (i: number) => (el: HTMLButtonElement | null): void => {
    iconRefs.current[i] = el;
  };
  const setTaskRef = (i: number) => (el: HTMLButtonElement | null): void => {
    taskRefs.current[i] = el;
  };

  return (
    <div className="desktop-root">
      <div
        className="desktop-grid"
        role="grid"
        aria-label="Desktop icons"
      >
        {visibleShortcuts.map((s, i) => (
          <button
            ref={setIconRef(i)}
            key={s.id}
            className="desktop-icon"
            data-icon={s.icon}
            title={s.label}
            onClick={() => handleOpenById(s.id)}
            role="gridcell"
            aria-label={s.label}
            tabIndex={i === activeIndex ? 0 : -1}
            onKeyDown={(e) => onIconKeyDown(e, i, s.id)}
          >
            <div className="icon-label">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Trial banner placed directly above taskbar with consistent spacing */}
      <div
        className="trial-banner"
        role="status"
        aria-live="polite"
      >
        <strong>Trial Mode:</strong> Construction Workers on Coffee Break
      </div>

      <div className="taskbar" role="toolbar" aria-label="Taskbar">
        <button className="start-button" title="Start" type="button">⊞</button>
        <div className="taskbar-apps" role="group" aria-label="Open windows">
          {handles.map((h, i) => (
            <button
              ref={setTaskRef(i)}
              key={h.id}
              className="taskbar-btn"
              onClick={() => focus(h.id)}
              title={h.title}
              aria-pressed={!h.minimized}
              tabIndex={i === activeTaskIndex ? 0 : -1}
              onKeyDown={(e) => onTaskKeyDown(e, i, h.id)}
              type="button"
            >
              {h.title}
            </button>
          ))}
        </div>
        <div className="system-tray" aria-label="System status">
          <span aria-hidden>🔊</span>
          <span aria-hidden>📶</span>
          <span id="clock" className="clock" />
        </div>
      </div>
    </div>
  );
}