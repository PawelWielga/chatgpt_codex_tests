import { Settings, defaultSettings } from "./settings.types";

const SETTINGS_KEY = "app:settings:v1";

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    return migrateSettings(parsed);
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    // ignore persistence errors (e.g., private mode)
  }
}

/**
 * Minimal migration/sanitization to guard against missing/invalid fields.
 * Keeps shape stable without an external schema library.
 */
export function migrateSettings(input: any): Settings {
  const out: Settings = {
    difficulty: isDifficulty(input?.difficulty) ? input.difficulty : defaultSettings.difficulty,
    sound: typeof input?.sound === "boolean" ? input.sound : defaultSettings.sound,
    theme: isTheme(input?.theme) ? input.theme : defaultSettings.theme,
  };
  return out;
}

function isDifficulty(v: any): v is Settings["difficulty"] {
  return v === "easy" || v === "normal" || v === "hard";
}

function isTheme(v: any): v is Settings["theme"] {
  return v === "light" || v === "dark";
}