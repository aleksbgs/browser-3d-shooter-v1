import { Canvas } from "@react-three/fiber";
import { ShooterScene } from "./ShooterScene";
import type { GameStats } from "../game/types";
import { PLAYER_HEIGHT, PLAYER_START_Z } from "../game/config";

type GameCanvasProps = {
  onStatsChange: (stats: GameStats) => void;
};

/**
 * Creates the Three.js canvas and seeds the initial gameplay camera for the shooter scene.
 */
export function GameCanvas({ onStatsChange }: GameCanvasProps) {
  return (
    <div className="game-canvas">
      <Canvas
        camera={{
          fov: 72,
          near: 0.1,
          far: 220,
          position: [0, PLAYER_HEIGHT, PLAYER_START_Z],
        }}
        dpr={[1, 1.75]}
        shadows
      >
        <ShooterScene onStatsChange={onStatsChange} />
      </Canvas>
    </div>
  );
}
