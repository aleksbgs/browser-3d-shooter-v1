import { Client } from "colyseus.js";

const DEFAULT_COLYSEUS_PORT = "2567";
const DEFAULT_ROOM_NAME = "pirate_shooter_v2";

/**
 * Room name for `joinOrCreate`; must match the Colyseus `define(…)` name on the server.
 */
export const PIRATE_ROOM_NAME =
  import.meta.env.VITE_COLYSEUS_ROOM_NAME?.trim() || DEFAULT_ROOM_NAME;

/**
 * Resolves the Colyseus WebSocket base URL for `colyseus.js` `Client`.
 *
 * Precedence:
 * 1. `VITE_COLYSEUS_URL` when set and non-empty (full `ws://` or `wss://` URL).
 * 2. In the browser, `ws://${VITE_COLYSEUS_HOST || location.hostname}:${VITE_COLYSEUS_PORT || default}`.
 * 3. Otherwise `null` (e.g. build without `window`).
 */
export function getColyseusUrl(): string | null {
  if (import.meta.env.VITE_COLYSEUS_DISABLED === "true") {
    return null;
  }

  const explicit = import.meta.env.VITE_COLYSEUS_URL?.trim();
  if (explicit) {
    return explicit;
  }

  if (typeof window === "undefined") {
    return null;
  }

  const host =
    import.meta.env.VITE_COLYSEUS_HOST?.trim() || window.location.hostname;
  const port =
    import.meta.env.VITE_COLYSEUS_PORT?.trim() || DEFAULT_COLYSEUS_PORT;

  return `ws://${host}:${port}`;
}

/**
 * Returns a short human-readable label describing the current multiplayer configuration.
 */
export function getMultiplayerLabel() {
  return getColyseusUrl() ? "Server configured" : "Local-only";
}

/**
 * Creates a Colyseus client when a server URL is available (see {@link getColyseusUrl}).
 */
export function createColyseusClient() {
  const url = getColyseusUrl();

  return url ? new Client(url) : null;
}
