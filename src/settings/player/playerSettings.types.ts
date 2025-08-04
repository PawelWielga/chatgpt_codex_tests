/**
 * Player-specific settings (modernized) migrated from legacy_backup/legacy_backup/js/player-settings.js
 * Backward compatible with localStorage key "playerSettings".
 */

export type HexColor = string;

export type PlayerSettings = {
  name: string;
  color: HexColor;
  emoji: string;
  aiColor: HexColor;
  aiEmoji: string;
};

export const defaultPlayerSettings: PlayerSettings = {
  name: "Gracz",
  color: "#dc3545",
  emoji: "🐶",
  aiColor: "#ffc107",
  aiEmoji: "💻",
};