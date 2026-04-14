import { PointerLockControls, Sky } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { startTransition, useEffect, useEffectEvent, useRef, useState } from "react";
import type { Room } from "colyseus.js";
import * as THREE from "three";
import {
  ARENA_AXIS_LIMIT,
  ARENA_HALF_SIZE,
  NETWORK_TICK_MS,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  PLAYER_START_Z,
  SHOT_COOLDOWN_MS,
} from "../game/config";
import { DEFAULT_STATS, type GameStats } from "../game/types";
import { useKeyboard } from "../game/useKeyboard";
import { createColyseusClient, getColyseusUrl, PIRATE_ROOM_NAME } from "../net/colyseus";
import type {
  EnemySnapshot,
  ProjectileSnapshot,
  RemotePlayerSnapshot,
  RoomEnemyState,
  RoomPlayerState,
  RoomProjectileState,
} from "../net/types";
import { PirateEnemy } from "./PirateEnemy";
import { Projectile } from "./Projectile";
import { RemotePirate } from "./RemotePirate";

const UP = new THREE.Vector3(0, 1, 0);
const MOVEMENT = new THREE.Vector3();
const FORWARD = new THREE.Vector3();
const RIGHT = new THREE.Vector3();
const AIM_DIRECTION = new THREE.Vector3();

type ShooterSceneProps = {
  onStatsChange: (stats: GameStats) => void;
};

/**
 * Keeps the locally controlled camera inside the playable deck bounds.
 */
function clampToArena(value: number) {
  return THREE.MathUtils.clamp(value, -ARENA_AXIS_LIMIT, ARENA_AXIS_LIMIT);
}

/**
 * Renders a warm lantern prop that also contributes local point lighting to the deck.
 */
function Lantern({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.34, 0.48, 0.34]} />
        <meshStandardMaterial color="#1f140b" roughness={0.78} />
      </mesh>
      <pointLight color="#ffb866" intensity={6} distance={10} decay={2} />
      <mesh>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshBasicMaterial color="#ffd49a" />
      </mesh>
    </group>
  );
}

/**
 * Builds the playable pirate deck, surrounding props, and static environment meshes.
 */
function Arena() {
  return (
    <group>
      <mesh receiveShadow position={[0, -2.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[220, 220, 1, 1]} />
        <meshStandardMaterial color="#072a3a" roughness={0.35} metalness={0.05} />
      </mesh>

      <mesh receiveShadow position={[0, -0.42, 0]}>
        <boxGeometry args={[ARENA_HALF_SIZE * 2, 0.84, ARENA_HALF_SIZE * 2]} />
        <meshStandardMaterial color="#7c5630" roughness={0.96} />
      </mesh>

      <mesh receiveShadow position={[0, 0.06, 0]}>
        <boxGeometry args={[ARENA_HALF_SIZE * 2 - 2.4, 0.1, ARENA_HALF_SIZE * 2 - 2.4]} />
        <meshStandardMaterial color="#a06b3d" roughness={0.92} />
      </mesh>

      {[
        [0, 1.05, ARENA_HALF_SIZE - 0.7],
        [0, 1.05, -ARENA_HALF_SIZE + 0.7],
      ].map((position, index) => (
        <mesh key={`rail-x-${index}`} castShadow receiveShadow position={position as [number, number, number]}>
          <boxGeometry args={[ARENA_HALF_SIZE * 2 - 1.6, 0.28, 0.42]} />
          <meshStandardMaterial color="#56361d" roughness={0.88} />
        </mesh>
      ))}

      {[
        [ARENA_HALF_SIZE - 0.7, 1.05, 0],
        [-ARENA_HALF_SIZE + 0.7, 1.05, 0],
      ].map((position, index) => (
        <mesh key={`rail-z-${index}`} castShadow receiveShadow position={position as [number, number, number]}>
          <boxGeometry args={[0.42, 0.28, ARENA_HALF_SIZE * 2 - 1.6]} />
          <meshStandardMaterial color="#56361d" roughness={0.88} />
        </mesh>
      ))}

      <mesh castShadow receiveShadow position={[0, 4.1, -5]}>
        <cylinderGeometry args={[0.42, 0.58, 10, 14]} />
        <meshStandardMaterial color="#654322" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 7.4, -5]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[9.5, 0.24, 0.24]} />
        <meshStandardMaterial color="#7c5630" roughness={0.9} />
      </mesh>
      <mesh castShadow receiveShadow position={[4.2, 5.2, -5]} rotation={[0, 0, 0.03]}>
        <planeGeometry args={[5.2, 6.8]} />
        <meshStandardMaterial color="#efe1be" roughness={0.96} side={THREE.DoubleSide} />
      </mesh>

      {[
        [-10, 0.55, -9],
        [10, 0.55, -3],
        [-13, 0.55, 7],
        [9, 0.55, 12],
        [1.5, 0.55, 10],
      ].map((position, index) => (
        <mesh key={`crate-${index}`} castShadow receiveShadow position={position as [number, number, number]}>
          <boxGeometry args={[1.7, 1.3, 1.7]} />
          <meshStandardMaterial color="#8d6234" roughness={0.9} />
        </mesh>
      ))}

      {[
        [-7, 0.7, 11],
        [14, 0.7, 4],
      ].map((position, index) => (
        <mesh key={`barrel-${index}`} castShadow receiveShadow position={position as [number, number, number]}>
          <cylinderGeometry args={[0.56, 0.62, 1.35, 14]} />
          <meshStandardMaterial color="#6a4728" roughness={0.88} />
        </mesh>
      ))}

      <Lantern position={[-ARENA_HALF_SIZE + 2.6, 2.4, -ARENA_HALF_SIZE + 2.6]} />
      <Lantern position={[ARENA_HALF_SIZE - 2.6, 2.4, -ARENA_HALF_SIZE + 2.6]} />
      <Lantern position={[-ARENA_HALF_SIZE + 2.6, 2.4, ARENA_HALF_SIZE - 2.6]} />
      <Lantern position={[ARENA_HALF_SIZE - 2.6, 2.4, ARENA_HALF_SIZE - 2.6]} />
    </group>
  );
}

/**
 * Orchestrates local input, room synchronization, and rendering for the multiplayer shooter scene.
 */
export function ShooterScene({ onStatsChange }: ShooterSceneProps) {
  const camera = useThree((state) => state.camera);
  const pressedKeysRef = useKeyboard();
  const roomRef = useRef<Room | null>(null);
  const playerHueRef = useRef(180 + Math.random() * 30);
  const playerNameRef = useRef(`Captain ${Math.ceil(Math.random() * 99)}`);
  const lastShotAtRef = useRef(0);
  const networkElapsedRef = useRef(0);
  const [enemies, setEnemies] = useState<EnemySnapshot[]>([]);
  const [projectiles, setProjectiles] = useState<ProjectileSnapshot[]>([]);
  const [remotePlayers, setRemotePlayers] = useState<RemotePlayerSnapshot[]>([]);
  const [wave, setWave] = useState(1);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(DEFAULT_STATS.health);
  const [locked, setLocked] = useState(false);
  const [peerCount, setPeerCount] = useState(1);
  const [multiplayerStatus, setMultiplayerStatus] = useState(
    getColyseusUrl() ? "Server configured" : "Server offline",
  );

  /**
   * Publishes the latest scene-derived gameplay stats back to the app shell HUD.
   */
  const publishStats = useEffectEvent(() => {
    onStatsChange({
      health,
      score,
      wave,
      enemies: enemies.length,
      locked,
      peers: peerCount,
      multiplayerStatus,
    });
  });

  /**
   * Maps authoritative Colyseus room state into render-friendly client snapshots and HUD values.
   */
  const syncRoomState = useEffectEvent(() => {
    const room = roomRef.current;

    if (!room?.state) {
      return;
    }

    const nextRemotePlayers: RemotePlayerSnapshot[] = [];
    const nextEnemies: EnemySnapshot[] = [];
    const nextProjectiles: ProjectileSnapshot[] = [];
    let totalPlayers = 0;
    const localPlayer = room.state.players?.get?.(room.sessionId);

    room.state.players?.forEach((player: RoomPlayerState, sessionId: string) => {
      totalPlayers += 1;

      if (sessionId === room.sessionId) {
        return;
      }

      nextRemotePlayers.push({
        sessionId,
        name: player.name ?? "Crewmate",
        title: player.title ?? "Deckhand",
        hue: Number(player.hue ?? 190),
        health: Number(player.health ?? 0),
        score: Number(player.score ?? 0),
        x: Number(player.x ?? 0),
        y: Number(player.y ?? PLAYER_HEIGHT),
        z: Number(player.z ?? PLAYER_START_Z),
        yaw: Number(player.yaw ?? Math.PI),
      });
    });

    room.state.enemies?.forEach((enemy: RoomEnemyState) => {
      nextEnemies.push({
        id: Number(enemy.id),
        hue: Number(enemy.hue ?? 180),
        health: Number(enemy.health ?? 1),
        scale: Number(enemy.scale ?? 1),
        x: Number(enemy.x ?? 0),
        y: Number(enemy.y ?? 0.95),
        z: Number(enemy.z ?? 0),
      });
    });

    room.state.projectiles?.forEach((projectile: RoomProjectileState) => {
      nextProjectiles.push({
        id: Number(projectile.id),
        ownerSessionId: projectile.ownerSessionId ?? "",
        hue: Number(projectile.hue ?? 32),
        x: Number(projectile.x ?? 0),
        y: Number(projectile.y ?? PLAYER_HEIGHT),
        z: Number(projectile.z ?? 0),
        dx: Number(projectile.dx ?? 0),
        dy: Number(projectile.dy ?? 0),
        dz: Number(projectile.dz ?? 1),
      });
    });

    const nextHealth = Number(localPlayer?.health ?? DEFAULT_STATS.health);
    const nextScore = Number(localPlayer?.score ?? 0);
    const nextWave = Number(room.state.wave ?? 1);

    if (localPlayer) {
      const nextX = Number(localPlayer.x ?? 0);
      const nextZ = Number(localPlayer.z ?? PLAYER_START_Z);

      if (
        nextHealth <= 0 ||
        Math.abs(camera.position.x - nextX) > 2 ||
        Math.abs(camera.position.z - nextZ) > 2
      ) {
        camera.position.set(nextX, PLAYER_HEIGHT, nextZ);
      }
    }

    setHealth(nextHealth);
    setScore(nextScore);
    setWave(nextWave);
    setPeerCount(totalPlayers || 1);
    setMultiplayerStatus("Room online");

    startTransition(() => {
      setRemotePlayers(nextRemotePlayers);
      setEnemies(nextEnemies);
      setProjectiles(nextProjectiles);
    });
  });

  useEffect(() => {
    camera.position.set(0, PLAYER_HEIGHT, PLAYER_START_Z);
  }, [camera]);

  useEffect(() => {
    publishStats();
  }, [enemies.length, health, locked, multiplayerStatus, peerCount, publishStats, score, wave]);

  useEffect(() => {
    /**
     * Mirrors the browser pointer lock state into React so the HUD can describe the controls accurately.
     */
    const syncPointerLock = () => {
      setLocked(document.pointerLockElement !== null);
    };

    /**
     * Sends a respawn request when the local player is down and presses the reset key.
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "KeyR" && health <= 0) {
        roomRef.current?.send("respawn");
      }
    };

    document.addEventListener("pointerlockchange", syncPointerLock);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerlockchange", syncPointerLock);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [health]);

  useEffect(() => {
    const client = createColyseusClient();

    if (!client) {
      setMultiplayerStatus("Server offline");
      setPeerCount(1);
      return;
    }

    let isMounted = true;

    /**
     * Connects to the Colyseus room and wires state, error, and disconnect listeners.
     */
    const connect = async () => {
      try {
        setMultiplayerStatus("Connecting...");

        const room = await client.joinOrCreate(PIRATE_ROOM_NAME, {
          name: playerNameRef.current,
          hue: playerHueRef.current,
        });

        if (!isMounted) {
          await room.leave();
          return;
        }

        roomRef.current = room;
        setMultiplayerStatus("Connected");

        room.onStateChange(() => {
          if (isMounted) {
            syncRoomState();
          }
        });

        room.onLeave((code) => {
          roomRef.current = null;

          if (!isMounted) {
            return;
          }

          setPeerCount(1);
          setHealth(DEFAULT_STATS.health);
          setScore(0);
          setWave(1);
          setMultiplayerStatus(`Disconnected (${code})`);
          startTransition(() => {
            setRemotePlayers([]);
            setEnemies([]);
            setProjectiles([]);
          });
        });

        room.onError((code, message) => {
          if (!isMounted) {
            return;
          }

          setMultiplayerStatus(`Net error ${code}`);
          console.error("[colyseus]", message);
        });

        syncRoomState();
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error("[colyseus]", error);
        setPeerCount(1);
        setMultiplayerStatus("Server offline");
        startTransition(() => {
          setRemotePlayers([]);
          setEnemies([]);
          setProjectiles([]);
        });
      }
    };

    void connect();

    return () => {
      isMounted = false;
      const room = roomRef.current;
      roomRef.current = null;
      startTransition(() => {
        setRemotePlayers([]);
        setEnemies([]);
        setProjectiles([]);
      });
      void room?.leave();
    };
  }, [syncRoomState]);

  /**
   * Sends a shoot intent to the authoritative room when the local fire cooldown allows it.
   */
  const handleShoot = useEffectEvent(() => {
    const room = roomRef.current;

    if (!room || !locked || health <= 0) {
      return;
    }

    const now = performance.now();

    if (now - lastShotAtRef.current < SHOT_COOLDOWN_MS) {
      return;
    }

    lastShotAtRef.current = now;
    camera.getWorldDirection(AIM_DIRECTION);
    AIM_DIRECTION.normalize();

    room.send("shoot", {
      dx: AIM_DIRECTION.x,
      dy: AIM_DIRECTION.y,
      dz: AIM_DIRECTION.z,
    });
  });

  useEffect(() => {
    /**
     * Converts the primary mouse button into a room-authoritative shoot request.
     */
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) {
        handleShoot();
      }
    };

    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, [handleShoot]);

  useFrame((_, delta) => {
    if (health > 0) {
      camera.getWorldDirection(FORWARD);
      FORWARD.y = 0;
      FORWARD.normalize();
      RIGHT.crossVectors(FORWARD, UP).normalize();
      MOVEMENT.set(0, 0, 0);

      if (pressedKeysRef.current.has("KeyW") || pressedKeysRef.current.has("ArrowUp")) {
        MOVEMENT.add(FORWARD);
      }

      if (pressedKeysRef.current.has("KeyS") || pressedKeysRef.current.has("ArrowDown")) {
        MOVEMENT.sub(FORWARD);
      }

      if (pressedKeysRef.current.has("KeyD") || pressedKeysRef.current.has("ArrowRight")) {
        MOVEMENT.add(RIGHT);
      }

      if (pressedKeysRef.current.has("KeyA") || pressedKeysRef.current.has("ArrowLeft")) {
        MOVEMENT.sub(RIGHT);
      }

      if (MOVEMENT.lengthSq() > 0) {
        MOVEMENT.normalize();
        camera.position.addScaledVector(MOVEMENT, PLAYER_SPEED * delta);
        camera.position.x = clampToArena(camera.position.x);
        camera.position.z = clampToArena(camera.position.z);
      }
    }

    camera.position.y = PLAYER_HEIGHT;

    const room = roomRef.current;

    if (!room) {
      return;
    }

    networkElapsedRef.current += delta * 1000;

    if (networkElapsedRef.current < NETWORK_TICK_MS) {
      return;
    }

    networkElapsedRef.current = 0;
    camera.getWorldDirection(AIM_DIRECTION);

    room.send("move", {
      x: camera.position.x,
      y: PLAYER_HEIGHT,
      z: camera.position.z,
      yaw: Math.atan2(AIM_DIRECTION.x, AIM_DIRECTION.z),
    });
  });

  return (
    <>
      <color attach="background" args={["#07111f"]} />
      <fog attach="fog" args={["#07111f", 18, 90]} />
      <Sky distance={3000} sunPosition={[5, 2, 8]} inclination={0.58} azimuth={0.25} />
      <ambientLight intensity={0.8} />
      <directionalLight
        castShadow
        intensity={1.75}
        position={[12, 20, 6]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <hemisphereLight intensity={0.9} color="#d6efff" groundColor="#11253d" />
      <PointerLockControls makeDefault />
      <Arena />
      {remotePlayers.map((player) => (
        <RemotePirate key={player.sessionId} player={player} />
      ))}
      {projectiles.map((projectile) => (
        <Projectile key={projectile.id} projectile={projectile} />
      ))}
      {enemies.map((enemy) => (
        <PirateEnemy key={enemy.id} enemy={enemy} />
      ))}
    </>
  );
}
