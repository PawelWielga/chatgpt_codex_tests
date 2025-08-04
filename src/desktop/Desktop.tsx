import React from "react";
import "./desktop.css";
import { useWindowManager } from "@/window/WindowManager";
import SnakeGame from "@/games/snake/SnakeGame";
import MinesweeperGame from "@/games/minesweeper/MinesweeperGame";

type Shortcut = {
  id: string;
  icon: string; // emoji
  label: string;
  onOpen?: () => void;
  implemented?: boolean;
};

export default function Desktop() {
  const { open, handles, focus } = useWindowManager();

  const shortcuts: Shortcut[] = [
    { id: "tictactoe", icon: "🔢", label: "Kółko i Krzyżyk", implemented: false },
    { id: "memo", icon: "🧠", label: "Memo", implemented: false },
    {
      id: "snake",
      icon: "🐍",
      label: "Wąż",
      implemented: true,
      onOpen: () =>
        open({
          id: "snake",
          title: "Wąż",
          content: <SnakeGame />,
          width: 820,
          height: 680,
          x: 120,
          y: 80,
        }),
    },
    { id: "rps", icon: "✊", label: "Kamień Papier Nożyce", implemented: false },
    {
      id: "minesweeper",
      icon: "🚩",
      label: "Saper",
      implemented: true,
      onOpen: () =>
        open({
          id: "minesweeper",
          title: "Saper",
          content: <MinesweeperGame />,
          width: 640,
          height: 720,
          x: 160,
          y: 100,
        }),
    },
    { id: "tetris", icon: "🧱", label: "Tetris", implemented: false },
    { id: "connect4", icon: "🟡", label: "Connect 4", implemented: false },
    { id: "pong", icon: "🏓", label: "Pong", implemented: false },
    { id: "cards", icon: "🃏", label: "Ewolucja", implemented: false },
    { id: "calc", icon: "🖩", label: "Catculator", implemented: false },
    { id: "settings", icon: "⚙️", label: "Ustawienia", implemented: false },
  ];

  const visibleShortcuts = shortcuts.filter(s => s.implemented);

  return (
    <div className="desktop-root">
      <div className="desktop-grid" role="grid">
        {visibleShortcuts.map((s) => (
          <button
            key={s.id}
            className="desktop-icon"
            data-icon={s.icon}
            title={s.label}
            onClick={() => {
              if (s.onOpen) s.onOpen();
            }}
          >
            <div className="icon-label">{s.label}</div>
          </button>
        ))}
      </div>

      <div className="taskbar">
        <button className="start-button" title="Start">⊞</button>
        <div className="taskbar-apps">
          {handles.map(h => (
            <button key={h.id} className="taskbar-btn" onClick={() => focus(h.id)} title={h.title}>
              {h.title}
            </button>
          ))}
        </div>
        <div className="system-tray">
          <span aria-hidden>🔊</span>
          <span aria-hidden>📶</span>
          <span id="clock" className="clock" />
        </div>
      </div>
    </div>
  );
}