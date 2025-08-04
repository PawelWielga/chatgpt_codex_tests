import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSettings } from "@/settings/SettingsContext";
import "./snake.css";

type Point = { x: number; y: number };
type Dir = "up" | "down" | "left" | "right";

function randFood(cols: number, rows: number, taken: Point[]): Point {
  const takenKey = new Set(taken.map(p => `${p.x},${p.y}`));
  while (true) {
    const p = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
    if (!takenKey.has(`${p.x},${p.y}`)) return p;
  }
}

export default function SnakeGame() {
  const { settings } = useSettings();
  const speed = useMemo(() => {
    // difficulty: easy/normal/hard maps to slower/faster
    switch (settings.difficulty) {
      case "easy": return 8;
      case "hard": return 14;
      default: return 10;
    }
  }, [settings.difficulty]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  // Base grid settings; size will be dynamically scaled to fit available space
  const grid = { size: 24, cols: 32, rows: 24 }; // logical board is cols x rows
  const [dir, setDir] = useState<Dir>("right");
  const dirQueue = useRef<Dir[]>([]);
  const [alive, setAlive] = useState(true);
  const [paused, setPaused] = useState(false);

  const snakeRef = useRef<Point[]>([
    { x: 3, y: 5 }, { x: 2, y: 5 }, { x: 1, y: 5 },
  ]);
  const foodRef = useRef<Point>({ x: 10, y: 10 });
  const rafRef = useRef<number | null>(null);
  const lastStep = useRef(0);

  useEffect(() => {
    // initial food not colliding
    foodRef.current = randFood(grid.cols, grid.rows, snakeRef.current);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key.toLowerCase() === "p") {
        setPaused(p => !p);
        return;
      }
      let next: Dir | null = null;
      if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") next = "up";
      else if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") next = "down";
      else if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") next = "left";
      else if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") next = "right";
      if (!next) return;
      const curr = dirQueue.current.length ? dirQueue.current[dirQueue.current.length - 1] : dir;
      if ((curr === "up" && next === "down") ||
          (curr === "down" && next === "up") ||
          (curr === "left" && next === "right") ||
          (curr === "right" && next === "left")) {
        return; // ignore 180-turns
      }
      dirQueue.current.push(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dir]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const stepMs = 1000 / speed;

    // Compute dynamic cell size to fit available space while preserving aspect
    const updateCanvasSize = () => {
      // Available size is the size of the canvas's parent (.snake-canvas-wrap)
      const wrap = canvas.parentElement as HTMLElement | null;
      if (!wrap) return;
      const availW = wrap.clientWidth;
      const availH = wrap.clientHeight;

      // Leave a small inner padding to avoid touching borders
      const pad = 0; // already have outer padding in layout; keep tight fit
      const maxW = Math.max(0, availW - pad * 2);
      const maxH = Math.max(0, availH - pad * 2);

      const cellSizeW = Math.floor(maxW / grid.cols);
      const cellSizeH = Math.floor(maxH / grid.rows);
      const cell = Math.max(8, Math.min(cellSizeW, cellSizeH)); // clamp to reasonable minimum for visibility

      const w = grid.cols * cell;
      const h = grid.rows * cell;

      // Set backing store and CSS size to exact pixels (prevents blur)
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      // Save the current dynamic size for drawing
      (grid as any)._dynSize = cell as number;
    };

    const ro = new ResizeObserver(() => {
      updateCanvasSize();
    });
    // observe wrapper so changes in window size propagate
    if (canvas.parentElement) {
      ro.observe(canvas.parentElement);
    }
    // also set initially
    updateCanvasSize();

    const loop = (t: number) => {
      rafRef.current = requestAnimationFrame(loop);
      if (!alive || paused) return;
      if (t - lastStep.current < stepMs) return;
      lastStep.current = t;

      // update direction
      if (dirQueue.current.length) {
        setDir(dirQueue.current.shift()!);
      }

      // move snake
      const s = snakeRef.current.slice();
      const head = { ...s[0] };
      if (dir === "up") head.y -= 1;
      else if (dir === "down") head.y += 1;
      else if (dir === "left") head.x -= 1;
      else if (dir === "right") head.x += 1;

      // wall collision -> wrap or die; choose wrap like classic
      head.x = (head.x + grid.cols) % grid.cols;
      head.y = (head.y + grid.rows) % grid.rows;

      // self collision
      if (s.some(p => p.x === head.x && p.y === head.y)) {
        setAlive(false);
        return;
      }

      s.unshift(head);

      // food
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        setScore(sc => sc + 10);
        foodRef.current = randFood(grid.cols, grid.rows, s);
        if (settings.sound) {
          try { new Audio("/assets/sfx/pop.mp3").play().catch(() => {}); } catch {}
        }
      } else {
        s.pop();
      }

      snakeRef.current = s;

      // draw using dynamic cell size
      const cell = (grid as any)._dynSize ?? grid.size;
      const w = grid.cols * cell;
      const h = grid.rows * cell;

      // Ensure canvas size is correct (in case of timing)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
      }

      ctx.fillStyle = "#101418";
      ctx.fillRect(0, 0, w, h);

      // grid
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= grid.cols; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cell + 0.5, 0);
        ctx.lineTo(x * cell + 0.5, h);
        ctx.stroke();
      }
      for (let y = 0; y <= grid.rows; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cell + 0.5);
        ctx.lineTo(w, y * cell + 0.5);
        ctx.stroke();
      }

      // food
      ctx.fillStyle = "#d9534f";
      ctx.fillRect(foodRef.current.x * cell, foodRef.current.y * cell, cell, cell);

      // snake
      for (let i = 0; i < snakeRef.current.length; i++) {
        const p = snakeRef.current[i];
        const tCol = i === 0 ? "#4caf50" : "#81c784";
        ctx.fillStyle = tCol;
        ctx.fillRect(p.x * cell, p.y * cell, cell, cell);
      }
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [speed, dir, alive, paused, settings.sound]);

  const reset = () => {
    setAlive(true);
    setPaused(false);
    setScore(0);
    setDir("right");
    dirQueue.current = [];
    snakeRef.current = [{ x: 3, y: 5 }, { x: 2, y: 5 }, { x: 1, y: 5 }];
    foodRef.current = randFood(grid.cols, grid.rows, snakeRef.current);
  };

  return (
    <div className="snake-root">
      <div className="snake-hud">
        <span>Score: {score}</span>
        <span>Speed: {speed}</span>
        <button onClick={() => setPaused(p => !p)}>{paused ? "Resume" : "Pause"}</button>
        <button onClick={reset}>Restart</button>
        {!alive && <span className="dead">Game Over</span>}
      </div>
      <div className="snake-canvas-wrap">
        <canvas ref={canvasRef} />
      </div>
      <div className="snake-help">
        Arrows / WASD to steer. Space to pause.
      </div>
    </div>
  );
}