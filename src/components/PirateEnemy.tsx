import { Float } from "@react-three/drei";
import type { EnemySnapshot } from "../net/types";

/**
 * Renders a stylized pirate enemy from the authoritative server snapshot.
 */
export function PirateEnemy({ enemy }: { enemy: EnemySnapshot }) {
  const healthRatio = Math.max(0.18, Math.min(1, enemy.health / 6));

  return (
    <group position={[enemy.x, enemy.y, enemy.z]} scale={enemy.scale}>
      <Float speed={1.6} floatIntensity={0.14} rotationIntensity={0.08}>
        <mesh castShadow receiveShadow position={[0, 1.1, 0]}>
          <sphereGeometry args={[0.92, 18, 18]} />
          <meshStandardMaterial
            color={`hsl(${enemy.hue} 58% 48%)`}
            emissive="#103540"
            emissiveIntensity={0.34 + healthRatio * 0.18}
            roughness={0.5}
            metalness={0.08}
          />
        </mesh>
        <mesh castShadow position={[0, 2.12, 0]}>
          <cylinderGeometry args={[0.26, 0.32, 0.46, 14]} />
          <meshStandardMaterial color="#171717" roughness={0.84} />
        </mesh>
        <mesh castShadow position={[0, 1.92, 0]}>
          <cylinderGeometry args={[0.82, 0.82, 0.08, 18]} />
          <meshStandardMaterial color="#171717" roughness={0.84} />
        </mesh>
        <mesh castShadow position={[0.22, 1.3, 0.76]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.34, 0.2, 0.08]} />
          <meshStandardMaterial color="#0a1118" roughness={0.9} />
        </mesh>
        <mesh castShadow position={[0.82, 0.9, -0.08]} rotation={[0, 0.45, -0.5]}>
          <boxGeometry args={[0.16, 1.1, 0.08]} />
          <meshStandardMaterial color="#c8d2da" metalness={0.52} roughness={0.35} />
        </mesh>
        <mesh castShadow position={[0.54, 0.48, -0.04]} rotation={[0, 0.2, 0.4]}>
          <cylinderGeometry args={[0.06, 0.08, 0.7, 10]} />
          <meshStandardMaterial color="#8a5c2e" roughness={0.88} />
        </mesh>
        <mesh position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.78, 1.02, 28]} />
          <meshBasicMaterial color="#7be0ff" transparent opacity={0.18} />
        </mesh>
      </Float>
    </group>
  );
}
