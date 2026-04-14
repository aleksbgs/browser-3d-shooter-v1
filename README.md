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

Copy `.env.example` to `.env` and adjust ports and URLs as needed (see comments in that file). The server reads `PORT`, `COLYSEUS_PORT`, and `COLYSEUS_ROOM_NAME`; the Vite client exposes only `VITE_*` variables (`VITE_COLYSEUS_URL`, or `VITE_COLYSEUS_HOST` / `VITE_COLYSEUS_PORT` when the full URL is left unset).

If `VITE_COLYSEUS_URL` is not set in dev, the client builds a default `ws://` URL using the current page hostname and port **2567** so Docker and LAN previews work without editing the bundle.

## Docker (full stack)

Requires Docker with Compose v2. Docker Compose reads a root `.env` file for variable substitution; see `.env.example` for `COLYSEUS_PORT`, `WEB_HOST_PORT`, `COLYSEUS_WS_HOST`, and related keys.

```bash
make up
```

By default the UI is at **http://localhost:8080** (`WEB_HOST_PORT`) and Colyseus on the host port from `COLYSEUS_PORT` (default **2567**). Override those in `.env` before `make up`.

```bash
make down    # stop
make logs    # follow logs
```

For another host or port, set the corresponding variables in `.env` and rebuild (`make rebuild` or `docker compose build`).

## Docs

More detailed AI-first documentation lives in the `docs/` folder.

## Build

```bash
npm run build
npm run start:server
```

The client build runs `tsc` and Vite. The server build removes `server-dist/`, then compiles `server/` and `shared/` into `server-dist/` (entry point: `server-dist/server/index.js`).

Shared gameplay constants that must match on both sides (for example arena bounds) live in `shared/` and are re-exported from `src/game/config.ts` on the client.

## Next Steps

1. Add PvP damage and server-side hit markers.
2. Replace the primitive pirate models with glTF assets.
3. Move the UI score and wave feed to server message events.
4. Add physics and collisions once the movement loop is stable.
