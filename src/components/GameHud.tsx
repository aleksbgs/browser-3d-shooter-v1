import type { GameStats } from "../game/types";

/**
 * Chooses the contextual HUD status copy based on the player's health, pointer lock, and network state.
 */
function getStatusText(stats: GameStats) {
  if (stats.health <= 0) {
    return "You were boarded. Press R to respawn back onto the deck.";
  }

  if (!stats.locked) {
    return "Click inside the scene to lock the cursor, then use WASD, mouse look, and left click to fire.";
  }

  if (stats.multiplayerStatus.includes("offline")) {
    return "V3 gameplay is authoritative on the Colyseus room. Start the server to sync waves, enemies, and shooting.";
  }

  return "Hold the deck. Enemy waves and every shot are now synced through the room, so the whole crew sees the same fight.";
}

/**
 * Renders the gameplay HUD with score, health, crew count, wave data, and network feedback.
 */
export function GameHud({ stats }: { stats: GameStats }) {
  const normalizedStatus = stats.multiplayerStatus.toLowerCase();
  const isLive = normalizedStatus.includes("online") || normalizedStatus.includes("connected");

  return (
    <>
      <section className="hud-panel hud-top">
        <span className="hud-kicker">Spawn-Style V3</span>
        <h1 className="hud-title">Browser 3D Shooter</h1>
        <div className="hud-stats">
          <div className="hud-stat">
            <span className="hud-label">Health</span>
            <span className="hud-value">{stats.health}</span>
          </div>
          <div className="hud-stat">
            <span className="hud-label">Score</span>
            <span className="hud-value">{stats.score}</span>
          </div>
          <div className="hud-stat">
            <span className="hud-label">Wave</span>
            <span className="hud-value">{stats.wave}</span>
          </div>
          <div className="hud-stat">
            <span className="hud-label">Enemies</span>
            <span className="hud-value">{stats.enemies}</span>
          </div>
          <div className="hud-stat">
            <span className="hud-label">Crew</span>
            <span className="hud-value">{stats.peers}</span>
          </div>
        </div>
        <div className="hud-meta">
          <span className="hud-chip">{stats.locked ? "Pointer locked" : "Pointer free"}</span>
          <span className={`hud-chip ${isLive ? "is-live" : "is-offline"}`}>{stats.multiplayerStatus}</span>
        </div>
      </section>

      <section className="hud-panel hud-bottom">
        <p>{getStatusText(stats)}</p>
      </section>
    </>
  );
}
