import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Difficulty = "easy" | "normal" | "hard";
type Theme = "light" | "dark";

export type Settings = {
  difficulty: Difficulty;
  sound: boolean;
  theme: Theme;
};

type SettingsContextValue = {
  settings: Settings;
  setDifficulty: (d: Difficulty) => void;
  toggleSound: () => void;
  setTheme: (t: Theme) => void;
  reset: () => void;
};

const defaultSettings: Settings = {
  difficulty: "normal",
  sound: true,
  theme: "light",
};

const SETTINGS_KEY = "app:settings:v1";

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      document.documentElement.dataset.theme = settings.theme;
    } catch {
      // ignore persistence errors
    }
  }, [settings]);

  const api = useMemo<SettingsContextValue>(
    () => ({
      settings,
      setDifficulty: (d) => setSettings((s) => ({ ...s, difficulty: d })),
      toggleSound: () => setSettings((s) => ({ ...s, sound: !s.sound })),
      setTheme: (t) => setSettings((s) => ({ ...s, theme: t })),
      reset: () => setSettings(defaultSettings),
    }),
    [settings]
  );

  return <SettingsContext.Provider value={api}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}