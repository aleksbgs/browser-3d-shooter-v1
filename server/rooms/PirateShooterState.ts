import { MapSchema, Schema, type } from "@colyseus/schema";

/**
 * Stores the authoritative state for a connected player inside the Colyseus room.
 */
export class PlayerState extends Schema {
  @type("string") declare name: string;
  @type("string") declare title: string;
  @type("number") declare hue: number;
  @type("number") declare health: number;
  @type("number") declare score: number;
  @type("number") declare x: number;
  @type("number") declare y: number;
  @type("number") declare z: number;
  @type("number") declare yaw: number;
}

/**
 * Stores the authoritative state for a living enemy inside the active wave.
 */
export class EnemyState extends Schema {
  @type("number") declare id: number;
  @type("number") declare hue: number;
  @type("number") declare health: number;
  @type("number") declare speed: number;
  @type("number") declare scale: number;
  @type("number") declare x: number;
  @type("number") declare y: number;
  @type("number") declare z: number;
}

/**
 * Stores the authoritative state for a projectile that is still active in the room.
 */
export class ProjectileState extends Schema {
  @type("number") declare id: number;
  @type("string") declare ownerSessionId: string;
  @type("number") declare hue: number;
  @type("number") declare x: number;
  @type("number") declare y: number;
  @type("number") declare z: number;
  @type("number") declare dx: number;
  @type("number") declare dy: number;
  @type("number") declare dz: number;
  @type("number") declare ttlMs: number;
}

/**
 * Defines the root authoritative room schema shared with every connected client.
 */
export class PirateShooterState extends Schema {
  @type("number") wave = 1;
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type({ map: EnemyState }) enemies = new MapSchema<EnemyState>();
  @type({ map: ProjectileState }) projectiles = new MapSchema<ProjectileState>();
}
