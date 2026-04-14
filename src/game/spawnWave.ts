import { ARENA_AXIS_LIMIT } from "./config";
import type { EnemySeed } from "./types";

/**
 * Generates a radial wave of enemy seeds for local prototyping utilities.
 */
export function createWave(wave: number, startId: number) {
  const count = Math.min(3 + wave * 2, 18);
  const enemies: EnemySeed[] = Array.from({ length: count }, (_, index) => {
    const angle = ((Math.PI * 2) / count) * index + Math.random() * 0.4;
    const radius = ARENA_AXIS_LIMIT - 2 - Math.random() * 4;

    return {
      id: startId + index,
      position: [Math.cos(angle) * radius, 0.9, Math.sin(angle) * radius],
      speed: 1.85 + wave * 0.2 + Math.random() * 0.55,
      scale: 0.9 + Math.random() * 0.45,
      hue: 170 + Math.random() * 35,
    };
  });

  return {
    enemies,
    nextId: startId + count,
  };
}
