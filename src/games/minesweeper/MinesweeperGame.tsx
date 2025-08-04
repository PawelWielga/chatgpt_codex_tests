import React, { useEffect, useMemo, useRef, useState } from "react";
import "./minesweeper.css";

type Cell = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adj: number; // adjacent mines
};

type Difficulty = { cols: number; rows: number; mines: number };

const DIFF: Difficulty = { cols: 9, rows: 9, mines: 10 };

// Meta used only for the latest reveal "wave" animation
type WaveMeta = {
  waveId: number;
  dist: number;
} | null;

function inBounds(c: number, r: number, cols: number, rows: number) {
  return c >= 0 && c < cols && r >= 0 && r < rows;
}

function neighbors(index: number, cols: number, rows: number) {
  const r = Math.floor(index / cols);
  const c = index % cols;
  const result: number[] = [];
  for (let rr = r - 1; rr <= r + 1; rr++) {
    for (let cc = c - 1; cc <= c + 1; cc++) {
      if (rr === r && cc === c) continue;
      if (inBounds(cc, rr, cols, rows)) result.push(rr * cols + cc);
    }
  }
  return result;
}

function createBoard(cols: number, rows: number): Cell[] {
  return Array.from({ length: cols * rows }, () => ({
    mine: false,
    revealed: false,
    flagged: false,
    adj: 0,
  }));
}

function placeMinesRandom(board: Cell[], cols: number, rows: number, mines: number, safeIndex: number) {
  // ensure first click is safe: avoid placing mine at safeIndex and its neighbors
  const forbidden = new Set([safeIndex, ...neighbors(safeIndex, cols, rows)]);
  let placed = 0;
  while (placed < mines) {
    const pos = Math.floor(Math.random() * board.length);
    if (forbidden.has(pos)) continue;
    if (!board[pos].mine) {
      board[pos].mine = true;
      placed++;
    }
  }
  // compute adj counts
  for (let i = 0; i < board.length; i++) {
    if (board[i].mine) continue;
    const adj = neighbors(i, cols, rows).reduce((acc, n) => acc + (board[n].mine ? 1 : 0), 0);
    board[i].adj = adj;
  }
}

function revealFlood(board: Cell[], start: number, cols: number, rows: number) {
  const stack = [start];
  while (stack.length) {
    const idx = stack.pop()!;
    const cell = board[idx];
    if (cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    if (!cell.mine && cell.adj === 0) {
      for (const n of neighbors(idx, cols, rows)) {
        if (!board[n].revealed && !board[n].flagged) stack.push(n);
      }
    }
  }
}

/**
 * Compute BFS distances only within the set of cells that will be revealed in this wave.
 * This mirrors legacy revealWave timing (d * 60ms), and does NOT include mines.
 */
function computeWaveDistances(revealedNow: Set<number>, startIdx: number, cols: number, rows: number): Map<number, number> {
  const dist = new Map<number, number>();
  // start might be a numbered tile (only itself reveals) – still mark distance 0 if it's in the set
  if (!revealedNow.size) return dist;
  if (revealedNow.has(startIdx)) {
    dist.set(startIdx, 0);
  } else {
    // pick any of the revealed cells nearest to start as seed at 0
    // but in classic behavior we want concentric wave from clicked cell; if start wasn't revealed (e.g., flagged) we fallback.
    const first = [...revealedNow][0];
    dist.set(first, 0);
  }

  const q: number[] = [ [...dist.keys()][0] ];
  while (q.length) {
    const u = q.shift()!;
    const du = dist.get(u)!;
    for (const v of neighbors(u, cols, rows)) {
      if (!revealedNow.has(v)) continue;
      if (dist.has(v)) continue;
      dist.set(v, du + 1);
      q.push(v);
    }
  }
  return dist;
}

// Compute BFS distances for ripple like legacy revealWave().
// It traverses only across cells that will be revealed in this action.
/* duplicate removed */

export default function MinesweeperGame() {
  const { cols, rows, mines } = DIFF;

  const [board, setBoard] = useState<Cell[]>(() => createBoard(cols, rows));
  const [started, setStarted] = useState(false);
  const [dead, setDead] = useState(false);
  const [won, setWon] = useState(false);
  const [flags, setFlags] = useState(0);
  const [time, setTime] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Wave animation meta (latest wave only), indexed by cell index
  const [waveMeta, setWaveMeta] = useState<WaveMeta[]>(() => Array(cols * rows).fill(null));
  const waveIdRef = useRef(0);

  const remaining = useMemo(() => Math.max(0, mines - flags), [mines, flags]);

  useEffect(() => {
    if (started && !dead && !won) {
      timerRef.current = window.setInterval(() => setTime((t) => Math.min(999, t + 1)), 1000);
      return () => {
        if (timerRef.current) window.clearInterval(timerRef.current);
      };
    }
    return;
  }, [started, dead, won]);

  const reset = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setBoard(createBoard(cols, rows));
    setStarted(false);
    setDead(false);
    setWon(false);
    setFlags(0);
    setTime(0);
    setWaveMeta(Array(cols * rows).fill(null));
    waveIdRef.current = 0;
  };

  const checkWin = (next: Cell[]) => {
    // win if all non-mine cells revealed
    const total = cols * rows;
    let revealedSafe = 0;
    let minesCount = 0;
    for (let i = 0; i < total; i++) {
      const c = next[i];
      if (c.mine) minesCount++;
      else if (c.revealed) revealedSafe++;
    }
    if (minesCount === mines && revealedSafe === total - mines) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      setWon(true);
    }
  };

  const revealIndex = (idx: number) => {
    if (dead || won) return;
    // We'll replicate legacy revealWave(): reveal set with delays per BFS distance.
    setBoard((prev) => {
      const next = prev.map((c) => ({ ...c }));
      const cell = next[idx];
      if (cell.revealed || cell.flagged) return prev;

      if (!started) {
        // place mines on first reveal (safe first click)
        placeMinesRandom(next, cols, rows, mines, idx);
        setStarted(true);
      }

      // If clicked a mine: reveal all immediately (no ripple)
      if (next[idx].mine) {
        next[idx].revealed = true;
        for (let i = 0; i < next.length; i++) {
          if (next[i].mine) next[i].revealed = true;
        }
        setDead(true);
        if (timerRef.current) window.clearInterval(timerRef.current);
        // Clear wave meta since we don't need delayed animation now
        setWaveMeta(Array(cols * rows).fill(null));
        return next;
      }

      // Determine the set of cells that will end up revealed from this action.
      // We simulate on a copy to find 'revealedNow' without committing time delays.
      const sim = next.map((c) => ({ ...c }));
      if (sim[idx].adj === 0) {
        revealFlood(sim, idx, cols, rows);
      } else {
        sim[idx].revealed = true;
      }

      // Only SAFE cells will be rippled; exclude any mines from wave set
      const revealedNow = new Set<number>();
      for (let i = 0; i < sim.length; i++) {
        if (sim[i].revealed && !prev[i].revealed && !sim[i].mine) {
          revealedNow.add(i);
        }
      }

      // If nothing to reveal, bail
      if (revealedNow.size === 0) {
        return next;
      }

      // Compute BFS distances like legacy revealWave()
      const distances = computeWaveDistances(revealedNow, idx, cols, rows);
      const thisWaveId = ++waveIdRef.current;

      // Ensure only this wave animates
      setWaveMeta(Array(cols * rows).fill(null));

      // Schedule the actual revealing with setTimeout per distance step, similar to legacy d*60ms
      const BASE_DELAY = 60; // ms per step as in legacy
      distances.forEach((d, iCell) => {
        window.setTimeout(() => {
          setBoard((curr) => {
            const clone = curr.map((c) => ({ ...c }));
            // Reveal SAFE cells only, never flip bombs during empty-click ripple
            if (!clone[iCell].mine && !clone[iCell].revealed && !clone[iCell].flagged) {
              clone[iCell].revealed = true;
            }
            return clone;
          });
          // Update waveMeta for animation attributes of this specific cell
          setWaveMeta((curr) => {
            const m = curr.slice();
            m[iCell] = { waveId: thisWaveId, dist: d };
            return m;
          });
        }, d * BASE_DELAY);
      });

      // Run win check once after the longest scheduled delay
      const maxD = Math.max(0, ...distances.values());
      window.setTimeout(() => checkWin(sim), maxD * BASE_DELAY + 5);

      return next; // return immediately; timeouts will progressively reveal
    });
  };

  const toggleFlag = (idx: number) => {
    if (dead || won) return;
    setBoard((prev) => {
      const next = prev.map((c) => ({ ...c }));
      const cell = next[idx];
      if (cell.revealed) return prev;

      // Allow placing flags without hard-capping to mines count,
      // but keep the "remaining" counter non-negative via useMemo(Math.max(0,...)).
      if (!cell.flagged) {
        cell.flagged = true;
        setFlags((f) => f + 1);
      } else {
        cell.flagged = false;
        setFlags((f) => Math.max(0, f - 1));
      }
      return next;
    });
  };

  const onCellMouseDown = (e: React.MouseEvent, idx: number) => {
    if (e.button === 2) {
      // right click
      e.preventDefault();
      toggleFlag(idx);
    } else if (e.button === 0) {
      revealIndex(idx);
    }
  };

  const onContext = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${cols}, 28px)`,
    gridTemplateRows: `repeat(${rows}, 28px)`,
  };

  return (
    <div className="ms-root">
      <div className="ms-header">
        <div className="ms-counter" aria-label="Mines remaining">{String(remaining).padStart(3, "0")}</div>
        <button className="ms-reset" onClick={reset} title="Restart">{dead ? "😵" : won ? "😎" : "🙂"}</button>
        <div className="ms-timer" aria-label="Timer">{String(time).padStart(3, "0")}</div>
      </div>

      <div className="ms-grid" style={gridStyle} onContextMenu={onContext} role="grid" aria-label="Minesweeper board">
        {board.map((cell, i) => {
          const classes = ["ms-cell"];
          if (cell.revealed) classes.push("revealed");
          if (cell.flagged) classes.push("flagged");
          const label =
            cell.revealed
              ? cell.mine
                ? "💣"
                : cell.adj > 0
                ? String(cell.adj)
                : ""
              : cell.flagged
              ? "🚩"
              : "";

          const colorClass = cell.revealed && !cell.mine && cell.adj > 0 ? `n${cell.adj}` : "";

          const meta = waveMeta[i];
          const isCurrentWave = meta && meta.waveId === waveIdRef.current;

          return (
            <button
              key={i}
              className={[...classes, colorClass].join(" ")}
              aria-label={`Cell ${i}`}
              onMouseDown={(e) => onCellMouseDown(e, i)}
              data-wave={isCurrentWave ? meta!.waveId : undefined}
              data-dist={isCurrentWave ? meta!.dist : undefined}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="ms-footer">
        Lewy klik odkrywa pole, prawy klik (lub długie naciśnięcie na touchpadzie) oznacza flagą.
      </div>
    </div>
  );
}