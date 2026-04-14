# Browser 3D Shooter V3

Minimal standalone starter project for a browser 3D shooter in a stack that is close to the Spawn approach:

- TypeScript
- React
- React Three Fiber
- Three.js
- Drei
- Colyseus authoritative room for enemy state, waves, and shooting

## Dev

```bash
npm install
npm run dev:server
npm run dev:client
```

## Controls

- `WASD` to move
- mouse to look around
- left click to shoot
- `R` to respawn after you go down

## Multiplayer

Copy `.env.example` to `.env` if you want the client to automatically try connecting to a local Colyseus server.

## Docs

More detailed AI-first documentation lives in the `docs/` folder.

## Build

```bash
npm run build
npm run start:server
```

## Next Steps

1. Add PvP damage and server-side hit markers.
2. Replace the primitive pirate models with glTF assets.
3. Move the UI score and wave feed to server message events.
4. Add physics and collisions once the movement loop is stable.
