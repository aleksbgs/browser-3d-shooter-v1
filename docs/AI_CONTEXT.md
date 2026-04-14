# AI Context

This is the AI-first entry document for agents that are just entering the repo.

## TL;DR

- The project is a pirate-themed browser 3D shooter.
- The client renders the world and sends input.
- The server is authoritative for:
  - enemy spawn
  - enemy movement
  - projectile simulation
  - damage
  - wave progression
  - player health and score
- If you change gameplay rules, you almost certainly need to update `server/rooms/PirateShooterRoom.ts`.

## Main Entry Points

- Client root: `src/main.tsx`
- App shell: `src/App.tsx`
- Main scene and network bridge: `src/components/ShooterScene.tsx`
- Shared arena constants (client + server): `shared/arena.ts` (also re-exported from `src/game/config.ts`)
- Server bootstrap: `server/index.ts`
- Authoritative room: `server/rooms/PirateShooterRoom.ts`
- Room schema: `server/rooms/PirateShooterState.ts`

## Mental Model

Do not think about this project as a single-player shooter with multiplayer bolted on.

The correct model is:

1. The client owns the camera, pointer lock, input, and rendering.
2. The client sends `move`, `shoot`, and `respawn` messages to the room.
3. The room simulates the world in its tick loop.
4. The client renders the server snapshot.

If you add a new gameplay mechanic and it affects the fair outcome of the game, it should be server-authoritative.

## What Is Safe To Change Only On The Client

- HUD text and layout
- colors, lighting, and pirate art style
- 3D models and assets
- cameras and look feel
- visual effects that do not change the rules

## What Should Not Live Only On The Client

- local enemy damage
- local wave spawning
- local projectile hit detection that decides outcomes
- local score as the source of truth
- local player death as the source of truth

## If You Want To Add A New Feature

### PvP Damage

- extend `PirateShooterState.ts`
- add server-side hit validation in `PirateShooterRoom.ts`
- let the client only display the result

### New Enemy Type

- extend the enemy schema
- add server spawning and AI rules
- let the client component change appearance based on fields from schema state

### Ability Or Weapon

- the client sends intent
- the server checks cooldown, ammo, or other rules
- the server mutates authoritative state

## Invariants To Preserve

- `players`, `enemies`, and `projectiles` live in room state
- `wave` comes from the server
- arena horizontal limits for players are defined once in `shared/arena.ts` (`ARENA_AXIS_LIMIT`); client movement clamp and server `clampPosition` must stay aligned
- the client must not decide the final outcome of combat on its own
- `R` sends `respawn`; it does not reset the round locally
- the client can predict feel, but it must not become the source of truth

## Common Points Of Confusion

- `ShooterScene.tsx` still contains a lot of gameplay feel, but it does not own authoritative enemy logic
- remote players are currently rendered as ghost pirate models, not full avatars
- projectile rendering on the client is a view of server state, not a local simulation
- `README.md` is only a short overview; the deeper context is in this folder

## Short Checklist Before Finishing A Change

1. Does the gameplay rule live on the server if it affects the outcome?
2. Does the client only display the authoritative result?
3. Does `npm run typecheck` pass?
4. Does `npm run build` pass?
