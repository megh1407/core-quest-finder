import type { GameObject } from "../types";

/** Lightweight low-poly meshes per object kind. Reused by any interior scene. */
export function ObjectMesh({ object, highlighted }: { object: GameObject; highlighted: boolean }) {
  const outline = highlighted ? "#7fe3f2" : null;

  return (
    <group position={object.position} rotation={[0, object.rotationY ?? 0, 0]}>
      {renderKind(object)}
      {outline && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.7, 0.85, 26]} />
          <meshBasicMaterial color={outline} transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
}

function renderKind(o: GameObject) {
  switch (o.kind) {
    case "bookshelf":
      return (
        <group>
          <mesh position={[0, 1.4, 0]} castShadow>
            <boxGeometry args={[0.7, 2.8, 3.4]} />
            <meshStandardMaterial color="#4a3a2c" />
          </mesh>
          {[0.6, 1.3, 2.0, 2.6].map((y) => (
            <mesh key={y} position={[0.12, y, 0]}>
              <boxGeometry args={[0.5, 0.34, 3.1]} />
              <meshStandardMaterial color="#8a6a4d" />
            </mesh>
          ))}
        </group>
      );
    case "book":
      return (
        <group>
          <mesh position={[0, 0.78, 0]} rotation={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[0.42, 0.1, 0.32]} />
            <meshStandardMaterial color="#7a3f34" />
          </mesh>
          <mesh position={[0, 0.38, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.72, 6]} />
            <meshStandardMaterial color="#3a2f26" />
          </mesh>
          <mesh position={[0, 0.72, 0]}>
            <boxGeometry args={[1.1, 0.08, 0.7]} />
            <meshStandardMaterial color="#5b4634" />
          </mesh>
        </group>
      );
    case "computer":
      return (
        <group>
          <mesh position={[0, 0.38, 0]}>
            <boxGeometry args={[1.3, 0.75, 0.7]} />
            <meshStandardMaterial color="#3b4653" />
          </mesh>
          <mesh position={[0, 1.05, 0]}>
            <boxGeometry args={[0.95, 0.6, 0.06]} />
            <meshStandardMaterial color="#12181f" emissive="#0d242b" />
          </mesh>
        </group>
      );
    case "table":
      return (
        <mesh position={[0, 0.75, 0]} castShadow>
          <boxGeometry args={[2.4, 0.12, 1.2]} />
          <meshStandardMaterial color="#5a4634" />
        </mesh>
      );
    case "chair":
      return (
        <group>
          <mesh position={[0, 0.48, 0]}>
            <boxGeometry args={[0.6, 0.1, 0.6]} />
            <meshStandardMaterial color="#4d5a68" />
          </mesh>
          <mesh position={[0, 0.85, -0.26]}>
            <boxGeometry args={[0.6, 0.66, 0.09]} />
            <meshStandardMaterial color="#4d5a68" />
          </mesh>
        </group>
      );
    case "cabinet":
      return (
        <group>
          <mesh position={[0, 0.85, 0]} castShadow>
            <boxGeometry args={[1.1, 1.7, 0.7]} />
            <meshStandardMaterial color="#3f4a56" metalness={0.3} />
          </mesh>
          {[0.45, 1.0, 1.45].map((y) => (
            <mesh key={y} position={[0, y, 0.37]}>
              <boxGeometry args={[0.9, 0.06, 0.04]} />
              <meshStandardMaterial color="#8fa2b3" />
            </mesh>
          ))}
        </group>
      );
    case "locker":
      return (
        <mesh position={[0, 1, 0]} castShadow>
          <boxGeometry args={[0.9, 2, 0.6]} />
          <meshStandardMaterial color="#425568" metalness={0.4} />
        </mesh>
      );
    case "box":
      return (
        <mesh position={[0, 0.35, 0]} rotation={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.9, 0.7, 0.9]} />
          <meshStandardMaterial color="#7c6244" />
        </mesh>
      );
    case "painting":
      return (
        <group>
          <mesh position={[0, 2, 0]}>
            <boxGeometry args={[1.8, 1.2, 0.08]} />
            <meshStandardMaterial color="#2b2118" />
          </mesh>
          <mesh position={[0, 2, 0.06]}>
            <planeGeometry args={[1.55, 0.98]} />
            <meshStandardMaterial color="#6b5a45" />
          </mesh>
        </group>
      );
    case "noticeboard":
      return (
        <group>
          <mesh position={[0, 1.8, 0]}>
            <boxGeometry args={[2.2, 1.4, 0.1]} />
            <meshStandardMaterial color="#33404d" />
          </mesh>
          {[-0.6, 0, 0.62].map((x, i) => (
            <mesh key={x} position={[x, 1.8 + (i % 2) * 0.16, 0.07]}>
              <planeGeometry args={[0.5, 0.66]} />
              <meshStandardMaterial color={i === 1 ? "#c7cfd6" : "#9fb1bd"} />
            </mesh>
          ))}
        </group>
      );
    default:
      return (
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.8, 1, 0.8]} />
          <meshStandardMaterial color="#556" />
        </mesh>
      );
  }
}