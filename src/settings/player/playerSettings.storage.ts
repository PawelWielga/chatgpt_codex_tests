import { defaultPlayerSettings, PlayerSettings } from "./playerSettings.types";

/**
 * Storage keys:
 * - Modern namespace: "app:playerSettings:v1"
 * - Legacy fallback:  "playerSettings" (from legacy_backup/legacy_backup/js/player-settings.js)
 */
const MODERN_KEY = "app:playerSettings:v1";
const LEGACY_KEY = "playerSettings";

/** Load player settings with migration and sanitization */
export function loadPlayerSettings(): PlayerSettings {
  // Try modern first, then legacy, else defaults
  try {
    const raw = localStorage.getItem(MODERN_KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (!raw) return defaultPlayerSettings;
    const parsed = JSON.parse(raw);
    return migratePlayerSettings(parsed);
  } catch {
    return defaultPlayerSettings;
  }
}

/** Persist player settings in modern namespace; ignore storage errors */
export function savePlayerSettings(s: PlayerSettings): void {
  try {
    localStorage.setItem(MODERN_KEY, JSON.stringify(s));
  } catch {
    // ignore storage errors (e.g. quota, private mode)
  }
}

/** Reset to defaults and persist */
export function resetPlayerSettings(): PlayerSettings {
  savePlayerSettings(defaultPlayerSettings);
  return defaultPlayerSettings;
}

/** Subscribe to settings changes initiated by this module (simple broadcast channel) */
type Listener = (s: PlayerSettings) => void;
const listeners = new Set<Listener>();
export function subscribePlayerSettings(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Internal helper to notify subscribers */
function notify(s: PlayerSettings): void {
  for (const fn of listeners) {
    try {
      fn(s);
    } catch {
      // isolate listener errors
    }
  }
}

/** Public API to update a subset of settings safely, with persistence and notification */
export function updatePlayerSettings(patch: Partial<PlayerSettings>): PlayerSettings {
  const current = loadPlayerSettings();
  const next = migratePlayerSettings({ ...current, ...patch });
  savePlayerSettings(next);
  notify(next);
  return next;
}

/** Migration + sanitization from any unknown input shape to safe PlayerSettings */
export function migratePlayerSettings(input: any): PlayerSettings {
  return {
    name: isNonEmptyString(input?.name) ? ("" + input.name).slice(0, 40) : defaultPlayerSettings.name,
    color: isHexColor(input?.color) ? normalizeHex(input.color) : defaultPlayerSettings.color,
    emoji: safeEmoji(input?.emoji, defaultPlayerSettings.emoji),
    aiColor: isHexColor(input?.aiColor) ? normalizeHex(input.aiColor) : defaultPlayerSettings.aiColor,
    aiEmoji: safeEmoji(input?.aiEmoji, defaultPlayerSettings.aiEmoji),
  };
}

/** Utilities */

function isNonEmptyString(v: any): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isHexColor(v: any): v is string {
  return typeof v === "string" && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.trim());
}

function normalizeHex(v: string): string {
  const t = v.trim();
  if (/^#[0-9a-fA-F]{3}$/.test(t)) {
    // expand #abc -> #aabbcc
    return "#" + t.slice(1).split("").map((c) => c + c).join("").toLowerCase();
  }
  return t.toLowerCase();
}

function safeEmoji(v: any, fallback: string): string {
  if (!isNonEmptyString(v)) return fallback;
  // Keep first grapheme approx (basic): limit to length 4 code units and strip unsafe
  const s = ("" + v).trim().slice(0, 4);
  // Very permissive allowlist for typical emoji; fallback if looks like code/markup
  if (/[<>{}]/.test(s)) return fallback;
  return s;
}