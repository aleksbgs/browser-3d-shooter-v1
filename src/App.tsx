import { useState } from "react";
import { GameCanvas } from "./components/GameCanvas";
import { GameHud } from "./components/GameHud";
import { DEFAULT_STATS, type GameStats } from "./game/types";

/**
 * Builds the top-level app shell and wires live game stats from the scene into the HUD.
 */
export default function App() {
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);

  return (
    <main className="app-shell">
      <GameCanvas onStatsChange={setStats} />
      <GameHud stats={stats} />
      <div className="crosshair" aria-hidden="true" />
    </main>
  );
}
