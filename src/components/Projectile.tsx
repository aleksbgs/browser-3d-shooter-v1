import { useMemo } from "react";
import * as THREE from "three";
import type { ProjectileSnapshot } from "../net/types";

const FORWARD = new THREE.Vector3(0, 0, 1);

type ProjectileProps = {
  projectile: ProjectileSnapshot;
};

function orientationFromDirection(dx: number, dy: number, dz: number) {
  const quat = new THREE.Quaternion();
  const dir = new THREE.Vector3(dx, dy, dz);

  if (dir.lengthSq() < 1e-10) {
    return quat;
  }

  dir.normalize();
  quat.setFromUnitVectors(FORWARD, dir);
  return quat;
}

/**
 * Renders a synced projectile and orients its trail in the direction provided by the server.
 */
export function Projectile({ projectile }: ProjectileProps) {
  const quaternion = useMemo(
    () => orientationFromDirection(projectile.dx, projectile.dy, projectile.dz),
    [projectile.dx, projectile.dy, projectile.dz],
  );

  return (
    <group position={[projectile.x, projectile.y, projectile.z]} quaternion={quaternion}>
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

