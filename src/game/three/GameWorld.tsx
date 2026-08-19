import { Canvas } from "@react-three/fiber";
import { Environment, Preload } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { CampusScene } from "./CampusScene";
import { LibraryInterior, LIBRARY_BOUNDS, LIBRARY_SPAWN } from "./LibraryInterior";
import { Player, type Blocker } from "./Player";
import { ProximityWatcher, type ProximityTarget } from "./ProximityWatcher";
import { CAMPUS, CAMPUS_BOUNDS, SPAWN_POSITION, doorPosition } from "../data/campus";
import { getLevel } from "../data/levels";
import { useGameStore } from "@/store/gameStore";

export function GameWorld({ onNearby }: { onNearby: (t: ProximityTarget | null) => void }) {
  const scene = useGameStore((s) => s.scene);
  const panel = useGameStore((s) => s.panel);
  const investigated = useGameStore((s) => s.investigated);
  const positionRef = useRef(new THREE.Vector3());
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const inLibrary = scene === "library_interior";

  const targets = useMemo<ProximityTarget[]>(() => {
    if (inLibrary) {
      const objs = getLevel(1).objects.map((o) => ({
        id: o.id,
        label: investigated.includes(o.id) ? `${o.label} (searched)` : o.label,
        position: o.position,
        radius: o.radius,
        action: "Investigate",
      }));
      return [
        ...objs,
        {
          id: "__exit_library",
          label: "Exit to Campus",
          position: [0, 0, 8.2] as [number, number, number],
          radius: 2.4,
          action: "Leave",
        },
      ];
    }
    return CAMPUS.filter((b) => b.enterable).map((b) => {
      const [x, z] = doorPosition(b);
      return {
        id: `__enter_${b.id}`,
        label: `Enter ${b.name}`,
        position: [x, 0, z + 0.6] as [number, number, number],
        radius: 3.2,
        action: "Enter",
      };
    });
  }, [inLibrary, investigated]);

  const blockers = useMemo<Blocker[]>(() => {
    if (inLibrary) {
      return getLevel(1)
        .objects.filter((o) => o.kind !== "book" && o.kind !== "painting")
        .map((o) => ({ x: o.position[0], z: o.position[2], w: 1.2, d: 1.2 }));
    }
    return CAMPUS.filter((b) => b.id !== "garden" && b.id !== "main_gate").map((b) => ({
      x: b.position[0],
      z: b.position[1],
      w: b.size[0],
      d: b.size[2],
    }));
  }, [inLibrary]);

  useEffect(() => {
    onNearby(null);
    setHighlightedId(null);
  }, [scene, onNearby]);

  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      camera={{ fov: 62, near: 0.1, far: 260, position: [0, 4, 50] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={[inLibrary ? "#0d1116" : "#0b1119"]} />
      <fog attach="fog" args={[inLibrary ? "#0d1116" : "#0b1119", 26, inLibrary ? 40 : 130]} />

      {inLibrary ? (
        <LibraryInterior highlightedId={highlightedId} />
      ) : (
        <>
          <hemisphereLight intensity={0.5} groundColor="#1b2530" color="#8fb7cc" />
          <directionalLight
            position={[28, 40, 20]}
            intensity={1.1}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <Environment preset="night" />
          <CampusScene />
        </>
      )}

      <Player
        spawn={inLibrary ? LIBRARY_SPAWN : SPAWN_POSITION}
        bounds={inLibrary ? LIBRARY_BOUNDS : CAMPUS_BOUNDS}
        blockers={blockers}
        enabled={panel === null}
        onMove={(p) => positionRef.current.copy(p)}
      />

      <ProximityWatcher
        targets={targets}
        positionRef={positionRef}
        onChange={(t) => {
          setHighlightedId(null);
          onNearby(t);
        }}
      />
      <Preload all />
    </Canvas>
  );
}