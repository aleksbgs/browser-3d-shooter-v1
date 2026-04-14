/**
 * Deck half-extent used for geometry and layout (world units).
 * Player movement and server clamps use {@link ARENA_AXIS_LIMIT}.
 */
export const ARENA_HALF_SIZE = 28;

/**
 * Inclusive ±X / ±Z bounds for players and authoritative position clamps.
 * Kept as `ARENA_HALF_SIZE - 2` so the play area sits inside deck rails.
 */
export const ARENA_AXIS_LIMIT = ARENA_HALF_SIZE - 2;
