import { Float } from "@react-three/drei";
import type { RemotePlayerSnapshot } from "../net/types";

type RemotePirateProps = {
  player: RemotePlayerSnapshot;
};

/**
 * Renders another connected player as a lightweight ghost-pirate avatar.
 */
export function RemotePirate({ player }: RemotePirateProps) {
  const isDown = player.health <= 0;

  return (
    <group position={[player.x, player.y - 1.05, player.z]} rotation={[0, player.yaw, 0]}>
      <Float speed={1.4} floatIntensity={0.12} rotationIntensity={0.08}>
        <mesh castShadow receiveShadow position={[0, 1.05, 0]}>
          <capsuleGeometry args={[0.42, 0.8, 8, 12]} />
          <meshStandardMaterial
            color={`hsl(${player.hue} 45% 62%)`}
            transparent
            opacity={isDown ? 0.28 : 0.72}
            emissive={isDown ? "#b53a29" : "#3cc2d6"}
            emissiveIntensity={isDown ? 0.4 : 0.28}
            roughness={0.5}
          />
        </mesh>
        <mesh castShadow position={[0, 2.1, 0]}>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color="#f2cfaa" transparent opacity={0.82} />
        </mesh>
        <mesh position={[0, 2.36, 0]}>
          <cylinderGeometry args={[0.18, 0.24, 0.34, 12]} />
          <meshStandardMaterial color="#171717" transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, 2.22, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.05, 18]} />
          <meshStandardMaterial color="#171717" transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.82, 24]} />
          <meshBasicMaterial color={`hsl(${player.hue} 80% 65%)`} transparent opacity={0.35} />
        </mesh>
      </Float>
    </group>
  );
}
