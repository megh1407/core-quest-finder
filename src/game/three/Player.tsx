import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GAME_CONFIG } from "../config";
import { useGameStore } from "@/store/gameStore";

export interface Blocker {
  x: number;
  z: number;
  w: number;
  d: number;
}

interface PlayerProps {
  spawn: [number, number, number];
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  blockers?: Blocker[];
  /** called every frame with the player world position */
  onMove?: (pos: THREE.Vector3) => void;
  enabled: boolean;
}

const keyMap: Record<string, string> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "back",
  ArrowDown: "back",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  ShiftLeft: "run",
};

export function Player({ spawn, bounds, blockers = [], onMove, enabled }: PlayerProps) {
  const group = useRef<THREE.Group>(null);
  const keys = useRef<Record<string, boolean>>({});
  const yaw = useRef(Math.PI);
  const pitch = useRef(-0.12);
  const { camera, gl } = useThree();
  const cameraMode = useGameStore((s) => s.cameraMode);
  const setPlayerPosition = useGameStore((s) => s.setPlayerPosition);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const lastReport = useRef(0);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const action = keyMap[e.code];
      if (action) keys.current[action] = true;
    };
    const up = (e: KeyboardEvent) => {
      const action = keyMap[e.code];
      if (action) keys.current[action] = false;
    };
    const blur = () => {
      keys.current = {};
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  // Mouse look: pointer lock on canvas click, plus drag fallback.
  useEffect(() => {
    const canvas = gl.domElement;
    let dragging = false;
    const applyDelta = (dx: number, dy: number) => {
      yaw.current -= dx * 0.0025;
      pitch.current = THREE.MathUtils.clamp(pitch.current - dy * 0.002, -0.9, 0.7);
    };
    const onClick = () => {
      if (document.pointerLockElement !== canvas) canvas.requestPointerLock?.();
    };
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === canvas) applyDelta(e.movementX, e.movementY);
      else if (dragging) applyDelta(e.movementX, e.movementY);
    };
    const onDown = () => {
      dragging = true;
    };
    const onUp = () => {
      dragging = false;
    };
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMouseMove);
    return () => {
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [gl]);

  useEffect(() => {
    if (!enabled && document.pointerLockElement) document.exitPointerLock();
  }, [enabled]);

  useEffect(() => {
    group.current?.position.set(spawn[0], 0, spawn[2]);
  }, [spawn]);

  useFrame((_, rawDelta) => {
    const g = group.current;
    if (!g) return;
    const delta = Math.min(rawDelta, 0.05);

    if (enabled) {
      const k = keys.current;
      const speed =
        (k["run"] ? GAME_CONFIG.player.runSpeed : GAME_CONFIG.player.walkSpeed) * delta;
      let fwd = 0;
      let strafe = 0;
      if (k["forward"]) fwd += 1;
      if (k["back"]) fwd -= 1;
      if (k["left"]) strafe -= 1;
      if (k["right"]) strafe += 1;

      if (fwd !== 0 || strafe !== 0) {
        const len = Math.hypot(fwd, strafe);
        const sin = Math.sin(yaw.current);
        const cos = Math.cos(yaw.current);
        const dx = ((strafe * cos - fwd * sin) / len) * speed;
        const dz = ((-strafe * sin - fwd * cos) / len) * speed;

        const nextX = THREE.MathUtils.clamp(g.position.x + dx, bounds.minX, bounds.maxX);
        const nextZ = THREE.MathUtils.clamp(g.position.z + dz, bounds.minZ, bounds.maxZ);
        if (!collides(blockers, nextX, g.position.z)) g.position.x = nextX;
        if (!collides(blockers, g.position.x, nextZ)) g.position.z = nextZ;
        g.rotation.y = Math.atan2(dx, dz);
      }
    }

    // Camera
    const eye = GAME_CONFIG.player.eyeHeight;
    if (cameraMode === "first") {
      camera.position.set(g.position.x, eye, g.position.z);
      tmp.set(
        g.position.x - Math.sin(yaw.current),
        eye + Math.tan(pitch.current),
        g.position.z - Math.cos(yaw.current),
      );
      camera.lookAt(tmp);
    } else {
      const dist = GAME_CONFIG.player.thirdPersonDistance;
      const height = GAME_CONFIG.player.thirdPersonHeight - pitch.current * 3;
      const desired = tmp.set(
        g.position.x + Math.sin(yaw.current) * dist,
        height,
        g.position.z + Math.cos(yaw.current) * dist,
      );
      camera.position.lerp(desired, 1 - Math.pow(0.001, delta));
      camera.lookAt(g.position.x, 1.3, g.position.z);
    }

    onMove?.(g.position);
    const now = performance.now();
    if (now - lastReport.current > 400) {
      lastReport.current = now;
      setPlayerPosition([g.position.x, 0, g.position.z]);
    }
  });

  return (
    <group ref={group} position={spawn}>
      <mesh position={[0, 0.9, 0]} castShadow visible={cameraMode === "third"}>
        <capsuleGeometry args={[0.36, 0.9, 4, 10]} />
        <meshStandardMaterial color="#7fd8e8" emissive="#123845" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, 1.72, 0]} castShadow visible={cameraMode === "third"}>
        <sphereGeometry args={[0.26, 14, 12]} />
        <meshStandardMaterial color="#dbeef4" />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.62, 24]} />
        <meshBasicMaterial color="#5fd0e6" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function collides(blockers: Blocker[], x: number, z: number) {
  const r = 0.45;
  return blockers.some(
    (b) =>
      x > b.x - b.w / 2 - r &&
      x < b.x + b.w / 2 + r &&
      z > b.z - b.d / 2 - r &&
      z < b.z + b.d / 2 + r,
  );
}