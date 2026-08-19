import { useCallback, useEffect, useRef, useState } from "react";
import { GameWorld } from "@/game/three/GameWorld";
import type { ProximityTarget } from "@/game/three/ProximityWatcher";
import { Hud } from "./Hud";
import {
  ChallengePanel,
  CluePanel,
  GameToast,
  HintPanel,
  InventoryPanel,
  LevelCompletePanel,
  PausePanel,
  ScannerPanel,
} from "./Panels";
import { useGameStore } from "@/store/gameStore";

export function GameScreen() {
  const [nearby, setNearby] = useState<ProximityTarget | null>(null);
  const nearbyRef = useRef<ProximityTarget | null>(null);
  const panel = useGameStore((s) => s.panel);
  const tick = useGameStore((s) => s.tick);
  const investigate = useGameStore((s) => s.investigate);
  const setScene = useGameStore((s) => s.setScene);
  const toggleCamera = useGameStore((s) => s.toggleCamera);
  const pause = useGameStore((s) => s.pause);
  const resume = useGameStore((s) => s.resume);

  const handleNearby = useCallback((t: ProximityTarget | null) => {
    nearbyRef.current = t;
    setNearby(t);
  }, []);

  useEffect(() => {
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [tick]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        if (useGameStore.getState().panel) resume();
        else pause();
        return;
      }
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "KeyV") toggleCamera();
      if (e.code === "KeyE") {
        if (useGameStore.getState().panel) return;
        const target = nearbyRef.current;
        if (!target) return;
        if (target.id === "__enter_library") setScene("library_interior");
        else if (target.id === "__exit_library") setScene("campus");
        else void investigate(target.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [investigate, pause, resume, setScene, toggleCamera]);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background">
      <GameWorld onNearby={handleNearby} />
      <Hud nearby={nearby} />
      <GameToast />
      {panel === "clue" && <CluePanel />}
      {panel === "challenge" && <ChallengePanel />}
      {panel === "inventory" && <InventoryPanel />}
      {panel === "hint" && <HintPanel />}
      {panel === "scanner" && <ScannerPanel />}
      {panel === "pause" && <PausePanel />}
      {panel === "level_complete" && <LevelCompletePanel />}
    </div>
  );
}