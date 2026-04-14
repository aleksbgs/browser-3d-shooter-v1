# Architecture

## System Overview

The project is split into two main sides:

- client: Vite + React + React Three Fiber + Three.js
- server: a Colyseus room with schema state

## Client Layers

### UI Layer

- `src/App.tsx`: connects the canvas and HUD
- `src/components/GameHud.tsx`: health, score, wave, enemies, crew, and network status

### Scene And Render Layer

- `src/components/ShooterScene.tsx`: the largest orchestration file on the client
- `src/components/PirateEnemy.tsx`: renders enemy snapshots
- `src/components/Projectile.tsx`: renders projectile snapshots
- `src/components/RemotePirate.tsx`: renders other players

### Input Layer

- `src/game/useKeyboard.ts`: collects WASD and arrow-key input
- `ShooterScene.tsx`: pointer lock, mouse shooting, and sending `move` and `shoot`

### Network Layer

- `src/net/colyseus.ts`: websocket URL and room name helpers
- `src/net/types.ts`: client snapshot types derived from server state

## Server Layers

### Bootstrap

- `server/index.ts`: boots the Colyseus server and registers the `pirate_shooter_v2` room

### Schema Layer

- `server/rooms/PirateShooterState.ts`
- `PlayerState`: name, color, health, score, position, and yaw
- `EnemyState`: id, health, speed, scale, hue, and position
- `ProjectileState`: owner, hue, position, direction, and ttl

### Simulation Layer

- `server/rooms/PirateShooterRoom.ts`

The room does the following:

- accepts `move` input and writes authoritative player position
- accepts `shoot` input and creates authoritative projectiles
- accepts `respawn` input when a player is dead
- runs the simulation tick through `setSimulationInterval`
- updates the following inside the tick:
  - projectile movement and enemy hit detection
  - enemy chase toward the nearest living player
  - wave progression when the arena is cleared

## Data Flow

1. The client connects to the Colyseus room.
2. The room sends schema state.
3. The client receives the snapshot and maps it into local render arrays.
4. The user moves the camera and shoots.
5. The client sends `move` and `shoot` messages.
6. The server updates state.
7. The state patch goes back to all clients.

## Why This Model Matters

If enemies, damage, and waves still lived on the client, each player would see a different world. With the authoritative room approach:

- everyone sees the same wave
- everyone sees the same projectiles
- score and health are not local guesses

## Weak Points In The Current Architecture

- `ShooterScene.tsx` is still too large as an orchestration file
- client snapshot mapping is inline instead of extracted into an adapter
- PvP does not exist yet
- the server does not emit dedicated gameplay event messages yet, only state

## Natural Next Refactor

- extract a `useRoomConnection` hook
- extract a `mapRoomStateToSnapshots` helper
- extract server-side systems:
  - projectile system
  - enemy system
  - wave system
