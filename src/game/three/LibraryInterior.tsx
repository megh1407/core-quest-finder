import { getLevel } from "../data/levels";
import { ObjectMesh } from "./LibraryObjects";

export const LIBRARY_BOUNDS = { minX: -8.4, maxX: 8.4, minZ: -8.4, maxZ: 8.4 };
export const LIBRARY_SPAWN: [number, number, number] = [0, 0, 7];
export const LIBRARY_EXIT: [number, number, number] = [0, 0, 8.2];

/** Interior scene for the Library reading hall (Level 1). */
export function LibraryInterior({ highlightedId }: { highlightedId: string | null }) {
  const level = getLevel(1);

  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#2a2620" />
      </mesh>
      {/* ceiling */}
      <mesh position={[0, 4.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#191d22" />
      </mesh>
      {/* walls */}
      {(
        [
          [0, -9, 0],
          [0, 9, Math.PI],
          [-9, 0, Math.PI / 2],
          [9, 0, -Math.PI / 2],
        ] as const
      ).map(([x, z, r]) => (
        <mesh key={`${x}-${z}`} position={[x, 2.1, z]} rotation={[0, r, 0]} receiveShadow>
          <planeGeometry args={[18, 4.2]} />
          <meshStandardMaterial color="#3a3229" side={2} />
        </mesh>
      ))}

      {/* reading table */}
      <mesh position={[-1.6, 0.7, -1.4]} castShadow>
        <boxGeometry args={[3.2, 0.12, 1.6]} />
        <meshStandardMaterial color="#5a4634" />
      </mesh>
      {[
        [-2.9, -2.0],
        [-0.3, -2.0],
        [-2.9, -0.8],
        [-0.3, -0.8],
      ].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x as number, 0.35, z as number]}>
          <boxGeometry args={[0.1, 0.7, 0.1]} />
          <meshStandardMaterial color="#3c3025" />
        </mesh>
      ))}

      {/* study desks */}
      <mesh position={[5.6, 0.72, -4.4]}>
        <boxGeometry args={[2.4, 0.1, 1.2]} />
        <meshStandardMaterial color="#524232" />
      </mesh>

      {/* exit marker */}
      <mesh position={[0, 0.04, 8.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.6, 1.4]} />
        <meshBasicMaterial color="#5fd0e6" transparent opacity={0.22} />
      </mesh>

      {level.objects.map((o) => (
        <ObjectMesh key={o.id} object={o} highlighted={highlightedId === o.id} />
      ))}

      <ambientLight intensity={0.45} />
      <pointLight position={[0, 3.6, 0]} intensity={26} distance={22} color="#ffe0b8" castShadow />
      <pointLight position={[-5, 3, -4]} intensity={12} distance={14} color="#8fd6e6" />
    </group>
  );
}