import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { ProjectileSnapshot } from "../net/types";

const FORWARD = new THREE.Vector3(0, 0, 1);
const LOOK_TARGET = new THREE.Vector3();

type ProjectileProps = {
  projectile: ProjectileSnapshot;
};

/**
 * Renders a synced projectile and orients its trail in the direction provided by the server.
 */
export function Projectile({ projectile }: ProjectileProps) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const group = groupRef.current;

    if (!group) {
      return;
    }

    group.position.set(projectile.x, projectile.y, projectile.z);
    LOOK_TARGET.set(
      projectile.x + projectile.dx,
      projectile.y + projectile.dy,
      projectile.z + projectile.dz,
    );
    group.lookAt(LOOK_TARGET);
  }, [projectile.dx, projectile.dy, projectile.dz, projectile.x, projectile.y, projectile.z]);

  return (
    <group ref={groupRef}>
      <mesh castShadow>
        <sphereGeometry args={[0.13, 10, 10]} />
        <meshStandardMaterial
          color={`hsl(${projectile.hue} 90% 62%)`}
          emissive="#ffb347"
          emissiveIntensity={1.4}
        />
      </mesh>
      <mesh position={[0, 0, -0.9]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.11, 1.8, 12]} />
        <meshBasicMaterial color="#ffd18b" transparent opacity={0.72} />
      </mesh>
    </group>
  );
}
