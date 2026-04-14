export type RemotePlayerSnapshot = {
  sessionId: string;
  name: string;
  title: string;
  hue: number;
  health: number;
  score: number;
  x: number;
  y: number;
  z: number;
  yaw: number;
};

export type EnemySnapshot = {
  id: number;
  hue: number;
  health: number;
  scale: number;
  x: number;
  y: number;
  z: number;
};

export type ProjectileSnapshot = {
  id: number;
  ownerSessionId: string;
  hue: number;
  x: number;
  y: number;
  z: number;
  dx: number;
  dy: number;
  dz: number;
};
