export type Difficulty = "easy" | "normal" | "hard";
export type Theme = "light" | "dark";

export type Settings = {
  difficulty: Difficulty;
  sound: boolean;
  theme: Theme;
};

export const defaultSettings: Settings = {
  difficulty: "normal",
  sound: true,
  theme: "light",
};