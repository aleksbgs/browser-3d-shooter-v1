export type EnemySeed = {
  id: number;
  position: [number, number, number];
  speed: number;
  scale: number;
  hue: number;
};

export type ProjectileSeed = {
  id: number;
  position: [number, number, number];
  direction: [number, number, number];
  hue: number;
};

export type GameStats = {
  health: number;
  score: number;
  wave: number;
  enemies: number;
  locked: boolean;
  peers: number;
  multiplayerStatus: string;
};

export const DEFAULT_STATS: GameStats = {
  health: 100,
  score: 0,
  wave: 1,
  enemies: 0,
  locked: false,
  peers: 1,
  multiplayerStatus: "Server offline",
};
