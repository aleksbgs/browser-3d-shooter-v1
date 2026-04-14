import { Client } from "colyseus.js";

export const PIRATE_ROOM_NAME = "pirate_shooter_v2";

/**
 * Reads the Colyseus websocket URL from the Vite environment, if one is configured.
 */
export function getColyseusUrl() {
  return import.meta.env.VITE_COLYSEUS_URL?.trim() || null;
}

/**
 * Returns a short human-readable label describing the current multiplayer configuration.
 */
export function getMultiplayerLabel() {
  return getColyseusUrl() ? "Server configured" : "Local-only v2";
}

/**
 * Creates a Colyseus client only when a server URL is available in the environment.
 */
export function createColyseusClient() {
  const url = getColyseusUrl();

  return url ? new Client(url) : null;
}
