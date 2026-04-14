# Runbook

## Local Development

Client:

```bash
npm run dev:client
```

Server:

```bash
npm run dev:server
```

If you want the client to connect automatically:

1. copy `.env.example` to `.env`
2. make sure `VITE_COLYSEUS_URL` points to the local server

## Build And Checks

Typecheck:

```bash
npm run typecheck
```

Production build:

```bash
npm run build
```

Run the built server:

```bash
npm run start:server
```

## If Something Is Not Working

### The Client Does Not Connect

Check:

- whether the server is actually listening on `ws://localhost:2567`
- whether `.env` exists and contains the correct `VITE_COLYSEUS_URL`
- whether the HUD shows `Connecting...`, `Room online`, or `Server offline`

### Everyone Sees Different Things

That should not happen for:

- wave
- enemy count
- projectile positions
- health and score

If it does happen, first check whether some logic was moved back to the client instead of staying on the server.

### The Player Teleports In A Strange Way

That is currently expected in some cases:

- respawn
- larger differences between client movement and authoritative state

The current model applies simple correction, not full reconciliation logic.

### The Build Passes, But The Feel Is Off

Most likely cause:

- rendering or input feel is the issue on the client

Least likely cause:

- schema state is the problem

## Recommended Workflow For Changes

### Visual Changes

- edit `src/components/*`
- do not touch the server if you are not changing rules

### Gameplay Changes

- start with `server/rooms/PirateShooterRoom.ts`
- extend the schema if needed
- only then align the client render layer

### Network Changes

- edit `server/rooms/PirateShooterState.ts`
- then `server/rooms/PirateShooterRoom.ts`
- then `src/net/types.ts`
- then `src/components/ShooterScene.tsx`

## Minimal Final Checklist

1. `npm run typecheck`
2. `npm run build`
3. `npm run start:server`
4. manually verify client connection and the core loop:
   - connect
   - move
   - shoot
   - enemy damage
   - respawn
