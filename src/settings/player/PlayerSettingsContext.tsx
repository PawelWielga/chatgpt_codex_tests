import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { PlayerSettings } from "./playerSettings.types";
import { defaultPlayerSettings } from "./playerSettings.types";
import {
  loadPlayerSettings,
  savePlayerSettings,
  updatePlayerSettings as storageUpdate,
  subscribePlayerSettings,
} from "./playerSettings.storage";

/**
 * Public API for player settings
 * - read current settings
 * - update fields
 * - reset to defaults
 * - subscribe to changes
 */
export type PlayerSettingsAPI = {
  settings: PlayerSettings;
  setName: (name: string) => void;
  setColor: (hex: string) => void;
  setEmoji: (emoji: string) => void;
  setAiColor: (hex: string) => void;
  setAiEmoji: (emoji: string) => void;
  update: (patch: Partial<PlayerSettings>) => void;
  reset: () => void;
};

const Ctx = createContext<PlayerSettingsAPI | undefined>(undefined);
(Ctx as any).displayName = "PlayerSettingsCtx";

/**
 * Provider that manages player settings state, persistence, and change notifications.
 * Also listens to storage events across tabs for consistency.
 */
export function PlayerSettingsProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [settings, setSettings] = useState<PlayerSettings>(() => loadPlayerSettings());

  // Persist local changes and keep state in sync if updated via our storageUpdate helper
  useEffect(() => {
    savePlayerSettings(settings);
  }, [settings]);

  // Bridge local subscriptions from storage module to context state if external callers modify settings
  useEffect(() => {
    const unsub = subscribePlayerSettings((s) => setSettings(s));
    return unsub;
  }, []);

  // Cross-tab sync via storage events
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      // If any settings key we care about changes, refresh from storage
      if (e.key.includes("app:playerSettings") || e.key === "playerSettings") {
        try {
          setSettings(loadPlayerSettings());
        } catch {
          // ignore parse errors
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const api = useMemo<PlayerSettingsAPI>(
    () => ({
      settings,
      setName: (name) => setSettings((s) => storageUpdate({ ...s, name })),
      setColor: (hex) => setSettings((s) => storageUpdate({ ...s, color: hex })),
      setEmoji: (emoji) => setSettings((s) => storageUpdate({ ...s, emoji })),
      setAiColor: (hex) => setSettings((s) => storageUpdate({ ...s, aiColor: hex })),
      setAiEmoji: (emoji) => setSettings((s) => storageUpdate({ ...s, aiEmoji: emoji })),
      update: (patch) => setSettings((_s) => storageUpdate(patch)),
      reset: () => setSettings(() => {
        const next = { ...defaultPlayerSettings };
        savePlayerSettings(next);
        return next;
      }),
    }),
    [settings]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

/** Hook to access player settings */
export function usePlayerSettings(): PlayerSettingsAPI {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlayerSettings must be used within PlayerSettingsProvider");
  return ctx;
}