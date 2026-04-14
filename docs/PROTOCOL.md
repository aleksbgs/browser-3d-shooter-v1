# Protocol

This document describes the contract between the client and the Colyseus room.

## Room Name

- `pirate_shooter_v2`

The name is historical for now. The implementation is `v3`, but the room identifier has not been renamed yet.

## Client To Server Messages

### `move`

Purpose:

- updates authoritative player position and yaw

Payload:

```ts
{
  x: number;
  y: number;
  z: number;
  yaw: number;
}
```

Notes:

- the server clamps position to the arena
- the server ignores dead players

### `shoot`

Purpose:

- requests creation of an authoritative projectile

Payload:

```ts
{
  dx: number;
  dy: number;
  dz: number;
}
```

Notes:

- direction is normalized on the server
- the server checks cooldown
- the client does not decide hits

### `respawn`

Purpose:

- returns a dead player to the start position with full health

Payload:

- no payload

## Server To Client State

State root:

```ts
PirateShooterState {
  wave: number;
  players: MapSchema<PlayerState>;
  enemies: MapSchema<EnemyState>;
  projectiles: MapSchema<ProjectileState>;
}
```

### `PlayerState`

```ts
{
  name: string;
  title: string;
  hue: number;
  health: number;
  score: number;
  x: number;
  y: number;
  z: number;
  yaw: number;
}
```

### `EnemyState`

```ts
{
  id: number;
  hue: number;
  health: number;
  speed: number;
  scale: number;
  x: number;
  y: number;
  z: number;
}
```

### `ProjectileState`

```ts
{
  id: number;
  ownerSessionId: string;
  hue: number;
  x: number;
  y: number;
  z: number;
  dx: number;
  dy: number;
  dz: number;
  ttlMs: number;
}
```

## Authority Rules

The server is the source of truth for:

- health
- score
- wave
- enemy existence and enemy motion
- projectile existence and projectile collision

The client is the source of truth only for:

- local input intent
- camera feel
- HUD presentation
- visual style and presentation

## Important Limitations

- the client does not currently do prediction or reconciliation beyond local movement feel
- the room does not emit separate gameplay events such as `enemy_killed` or `wave_started`
- the room identifier still carries the `v2` name even though the gameplay model is `v3`
