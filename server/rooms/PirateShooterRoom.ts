import { Room, type Client } from "colyseus";
import { EnemyState, PirateShooterState, PlayerState, ProjectileState } from "./PirateShooterState.js";

const ARENA_LIMIT = 26;
const PLAYER_HEIGHT = 1.65;
const PLAYER_START_Z = 18;
const PLAYER_HEALTH = 100;
const PROJECTILE_SPEED = 44;
const PROJECTILE_LIFETIME_MS = 1150;
const PROJECTILE_RADIUS = 0.24;
const SHOT_DAMAGE = 1;
const BOARDING_DAMAGE = 14;
const ENEMY_REACH_DISTANCE = 1.9;
const SHOT_COOLDOWN_MS = 160;
const WAVE_DELAY_MS = 1200;
const PLAYER_FIRE_FORWARD = 1.1;
const PLAYER_FIRE_DROP = 0.12;

type JoinOptions = {
  hue?: number;
  name?: string;
};

type MoveMessage = {
  x: number;
  y: number;
  z: number;
  yaw: number;
};

type ShootMessage = {
  dx: number;
  dy: number;
  dz: number;
};

/**
 * Clamps an incoming player position to the legal arena bounds on the server.
 */
function clampPosition(value: number) {
  return Math.max(-ARENA_LIMIT, Math.min(ARENA_LIMIT, value));
}

/**
 * Runs the authoritative Colyseus room for player input, enemy simulation, and wave progression.
 */
export class PirateShooterRoom extends Room<PirateShooterState> {
  maxClients = 12;
  patchRate = 1000 / 20;
  private nextEnemyId = 1;
  private nextProjectileId = 1;
  private pendingWaveAt: number | null = null;
  private readonly lastShotAt = new Map<string, number>();

  /**
   * Initializes room state, registers message handlers, and starts the simulation loop.
   */
  onCreate() {
    this.setState(new PirateShooterState());
    this.spawnWave(this.state.wave);

    this.onMessage("move", (client: Client, payload: MoveMessage) => {
      const player = this.state.players.get(client.sessionId);

      if (!player || player.health <= 0) {
        return;
      }

      player.x = Number.isFinite(payload.x) ? clampPosition(payload.x) : player.x;
      player.y = PLAYER_HEIGHT;
      player.z = Number.isFinite(payload.z) ? clampPosition(payload.z) : player.z;
      player.yaw = Number.isFinite(payload.yaw) ? payload.yaw : 0;
    });

    this.onMessage("shoot", (client: Client, payload: ShootMessage) => {
      const player = this.state.players.get(client.sessionId);

      if (!player || player.health <= 0) {
        return;
      }

      const now = Date.now();
      const previousShotAt = this.lastShotAt.get(client.sessionId) ?? 0;

      if (now - previousShotAt < SHOT_COOLDOWN_MS) {
        return;
      }

      if (!Number.isFinite(payload.dx) || !Number.isFinite(payload.dy) || !Number.isFinite(payload.dz)) {
        return;
      }

      const length = Math.hypot(payload.dx, payload.dy, payload.dz);

      if (length <= 0.0001) {
        return;
      }

      this.lastShotAt.set(client.sessionId, now);

      const projectile = new ProjectileState();
      projectile.id = this.nextProjectileId++;
      projectile.ownerSessionId = client.sessionId;
      projectile.hue = player.hue;
      projectile.dx = payload.dx / length;
      projectile.dy = payload.dy / length;
      projectile.dz = payload.dz / length;
      projectile.x = player.x + projectile.dx * PLAYER_FIRE_FORWARD;
      projectile.y = player.y - PLAYER_FIRE_DROP + projectile.dy * PLAYER_FIRE_FORWARD;
      projectile.z = player.z + projectile.dz * PLAYER_FIRE_FORWARD;
      projectile.ttlMs = PROJECTILE_LIFETIME_MS;

      this.state.projectiles.set(String(projectile.id), projectile);
    });

    this.onMessage("respawn", (client: Client) => {
      const player = this.state.players.get(client.sessionId);

      if (!player || player.health > 0) {
        return;
      }

      player.health = PLAYER_HEALTH;
      player.x = 0;
      player.y = PLAYER_HEIGHT;
      player.z = PLAYER_START_Z;
      player.yaw = Math.PI;
    });

    this.setSimulationInterval((deltaTime) => {
      this.updateProjectiles(deltaTime);
      this.updateEnemies(deltaTime);
      this.updateWaves();
    }, 1000 / 30);
  }

  /**
   * Creates and registers a new authoritative player state when a client joins the room.
   */
  onJoin(client: Client, options: JoinOptions) {
    const player = new PlayerState();
    player.name = options.name?.slice(0, 24) || `Sailor ${this.clients.length}`;
    player.title = "Deckhand";
    player.hue = Number.isFinite(options.hue) ? Number(options.hue) : 190;
    player.health = PLAYER_HEALTH;
    player.score = 0;
    player.x = 0;
    player.y = PLAYER_HEIGHT;
    player.z = PLAYER_START_Z;
    player.yaw = Math.PI;

    this.state.players.set(client.sessionId, player);
  }

  /**
   * Removes player-owned room state and cooldown tracking after a client disconnects.
   */
  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
    this.lastShotAt.delete(client.sessionId);
  }

  /**
   * Advances projectiles, resolves enemy hits, and awards score for confirmed kills.
   */
  private updateProjectiles(deltaTime: number) {
    const deltaSeconds = deltaTime / 1000;
    const projectilesToDelete = new Set<string>();
    const enemiesToDelete = new Set<string>();

    this.state.projectiles.forEach((projectile, projectileKey) => {
      projectile.x += projectile.dx * PROJECTILE_SPEED * deltaSeconds;
      projectile.y += projectile.dy * PROJECTILE_SPEED * deltaSeconds;
      projectile.z += projectile.dz * PROJECTILE_SPEED * deltaSeconds;
      projectile.ttlMs -= deltaTime;

      if (
        projectile.ttlMs <= 0 ||
        Math.abs(projectile.x) > ARENA_LIMIT + 10 ||
        Math.abs(projectile.z) > ARENA_LIMIT + 10
      ) {
        projectilesToDelete.add(projectileKey);
        return;
      }

      this.state.enemies.forEach((enemy, enemyKey) => {
        if (projectilesToDelete.has(projectileKey) || enemiesToDelete.has(enemyKey)) {
          return;
        }

        const dx = enemy.x - projectile.x;
        const dy = enemy.y - projectile.y;
        const dz = enemy.z - projectile.z;
        const hitRadius = enemy.scale * 1.08 + PROJECTILE_RADIUS;

        if (dx * dx + dy * dy + dz * dz > hitRadius * hitRadius) {
          return;
        }

        enemy.health -= SHOT_DAMAGE;
        projectilesToDelete.add(projectileKey);

        if (enemy.health <= 0) {
          enemiesToDelete.add(enemyKey);
          const owner = this.state.players.get(projectile.ownerSessionId);

          if (owner) {
            owner.score += 15;
          }
        }
      });
    });

    projectilesToDelete.forEach((projectileKey) => {
      this.state.projectiles.delete(projectileKey);
    });

    enemiesToDelete.forEach((enemyKey) => {
      this.state.enemies.delete(enemyKey);
    });
  }

  /**
   * Moves enemies toward the nearest living player and applies boarding damage on contact.
   */
  private updateEnemies(deltaTime: number) {
    const deltaSeconds = deltaTime / 1000;
    const enemiesToDelete = new Set<string>();

    this.state.enemies.forEach((enemy, enemyKey) => {
      const target: PlayerState | null = this.findClosestAlivePlayer(enemy.x, enemy.z);

      if (!target) {
        return;
      }

      const dx = target.x - enemy.x;
      const dz = target.z - enemy.z;
      const distance = Math.hypot(dx, dz);

      if (distance <= ENEMY_REACH_DISTANCE) {
        enemiesToDelete.add(enemyKey);
        target.health = Math.max(0, target.health - BOARDING_DAMAGE);
        return;
      }

      enemy.x += (dx / distance) * enemy.speed * deltaSeconds;
      enemy.z += (dz / distance) * enemy.speed * deltaSeconds;
      enemy.y = 0.95;
    });

    enemiesToDelete.forEach((enemyKey) => {
      this.state.enemies.delete(enemyKey);
    });
  }

  /**
   * Schedules and starts the next wave once the arena is clear and at least one player is alive.
   */
  private updateWaves() {
    if (this.getEnemyCount() > 0) {
      this.pendingWaveAt = null;
      return;
    }

    const alivePlayers = this.getAlivePlayerCount();

    if (alivePlayers === 0) {
      this.pendingWaveAt = null;
      return;
    }

    const now = Date.now();

    if (this.pendingWaveAt === null) {
      this.pendingWaveAt = now + WAVE_DELAY_MS;
      return;
    }

    if (now < this.pendingWaveAt) {
      return;
    }

    this.pendingWaveAt = null;
    this.spawnWave(this.state.wave + 1);
  }

  /**
   * Spawns a fresh authoritative enemy wave with stats derived from the requested wave number.
   */
  private spawnWave(wave: number) {
    this.state.wave = wave;

    const count = Math.min(3 + wave * 2, 18);

    for (let index = 0; index < count; index += 1) {
      const angle = ((Math.PI * 2) / count) * index + Math.random() * 0.4;
      const radius = ARENA_LIMIT - 2 - Math.random() * 4;
      const enemy = new EnemyState();
      enemy.id = this.nextEnemyId++;
      enemy.hue = 170 + Math.random() * 35;
      enemy.health = 4 + Math.floor(wave / 3);
      enemy.speed = 1.85 + wave * 0.2 + Math.random() * 0.55;
      enemy.scale = 0.9 + Math.random() * 0.45;
      enemy.x = Math.cos(angle) * radius;
      enemy.y = 0.95;
      enemy.z = Math.sin(angle) * radius;

      this.state.enemies.set(String(enemy.id), enemy);
    }
  }

  /**
   * Finds the nearest living player so enemies can choose an authoritative chase target.
   */
  private findClosestAlivePlayer(x: number, z: number): PlayerState | null {
    let bestPlayer: PlayerState | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    this.state.players.forEach((player) => {
      if (player.health <= 0) {
        return;
      }

      const dx = player.x - x;
      const dz = player.z - z;
      const distance = dx * dx + dz * dz;

      if (distance < bestDistance) {
        bestDistance = distance;
        bestPlayer = player;
      }
    });

    return bestPlayer;
  }

  /**
   * Counts living players to decide whether the room should keep wave progression active.
   */
  private getAlivePlayerCount() {
    let alivePlayers = 0;

    this.state.players.forEach((player) => {
      if (player.health > 0) {
        alivePlayers += 1;
      }
    });

    return alivePlayers;
  }

  /**
   * Counts active enemies remaining in the room.
   */
  private getEnemyCount() {
    let enemies = 0;

    this.state.enemies.forEach(() => {
      enemies += 1;
    });

    return enemies;
  }
}
