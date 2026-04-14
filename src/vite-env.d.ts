/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Full Colyseus WebSocket URL; overrides host/port when set (non-empty). */
  readonly VITE_COLYSEUS_URL?: string;
  /** WebSocket host for constructing `ws://…` when `VITE_COLYSEUS_URL` is unset. Defaults to `window.location.hostname` when empty. */
  readonly VITE_COLYSEUS_HOST?: string;
  /** WebSocket port when constructing `ws://…` if `VITE_COLYSEUS_URL` is unset. */
  readonly VITE_COLYSEUS_PORT?: string;
  /** Must match server `COLYSEUS_ROOM_NAME` / Docker `COLYSEUS_ROOM_NAME`. */
  readonly VITE_COLYSEUS_ROOM_NAME?: string;
  /** Set to `true` to skip creating a Colyseus client (no network multiplayer). */
  readonly VITE_COLYSEUS_DISABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
