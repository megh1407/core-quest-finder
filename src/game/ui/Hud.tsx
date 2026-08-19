import { Compass, Eye, HandHelping, Package, Pause, ScanLine, Timer } from "lucide-react";
import { EVENT, GAME_CONFIG, formatTime } from "@/game/config";
import { getLevel } from "@/game/data/levels";
import { useGameStore } from "@/store/gameStore";
import type { ProximityTarget } from "@/game/three/ProximityWatcher";

function HudButton({
  icon: Icon,
  label,
  onClick,
  hint,
}: {
  icon: typeof Package;
  label: string;
  onClick: () => void;
  hint?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="pointer-events-auto group flex items-center gap-2 rounded-md border border-primary/25 bg-background/70 px-3 py-2 text-xs font-medium tracking-wide text-foreground/85 backdrop-blur transition-colors hover:border-primary/60 hover:text-primary"
    >
      <Icon className="h-4 w-4 text-primary/80 transition-colors group-hover:text-primary" />
      <span className="hidden sm:inline">{label}</span>
      {hint && <span className="hidden text-[10px] text-muted-foreground md:inline">{hint}</span>}
    </button>
  );
}

export function Hud({ nearby }: { nearby: ProximityTarget | null }) {
  const elapsed = useGameStore((s) => s.elapsedSeconds);
  const penalty = useGameStore((s) => s.penaltySeconds);
  const level = useGameStore((s) => s.currentLevel);
  const scene = useGameStore((s) => s.scene);
  const cameraMode = useGameStore((s) => s.cameraMode);
  const toggleCamera = useGameStore((s) => s.toggleCamera);
  const setPanel = useGameStore((s) => s.setPanel);
  const runScanner = useGameStore((s) => s.runScanner);
  const pause = useGameStore((s) => s.pause);
  const clue = useGameStore((s) => s.discoveredClue);

  const objective = clue
    ? `Decrypt the trace — ${clue.destination}`
    : getLevel(level).objective;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-3 sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="holo-panel rounded-lg px-4 py-2">
          <div className="font-display text-xs tracking-[0.35em] text-primary">TECHFEST</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {EVENT.storyTitle}
          </div>
        </div>

        <div className="holo-panel flex items-center gap-4 rounded-lg px-4 py-2 text-sm">
          <span className="flex items-center gap-2 font-display tabular-nums">
            <Timer className="h-4 w-4 text-primary" />
            {formatTime(elapsed)}
          </span>
          <span className="text-xs text-destructive tabular-nums">+{penalty}s</span>
          <span className="text-xs text-muted-foreground">
            LEVEL {level}/{GAME_CONFIG.totalLevels}
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="holo-panel max-w-md rounded-lg px-4 py-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-primary/80">
            <Compass className="h-3.5 w-3.5" /> Objective
          </div>
          <p className="mt-1 text-sm text-foreground/90">{objective}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {scene === "library_interior" ? "Library / Reading Hall" : "Campus Grounds"}
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <HudButton icon={ScanLine} label="AR Scan" onClick={runScanner} />
          <HudButton icon={Package} label="Inventory" onClick={() => setPanel("inventory")} />
          <HudButton icon={HandHelping} label="Hints" onClick={() => setPanel("hint")} />
          <HudButton
            icon={Eye}
            label={cameraMode === "third" ? "First Person" : "Third Person"}
            onClick={toggleCamera}
            hint="V"
          />
          <HudButton icon={Pause} label="Pause" onClick={pause} hint="ESC" />
        </div>
      </div>

      {nearby && (
        <div className="pointer-events-none absolute bottom-28 left-1/2 -translate-x-1/2">
          <div className="holo-panel holo-pulse rounded-full px-4 py-2 text-sm">
            <span className="font-display text-primary">[E]</span>{" "}
            <span className="text-foreground/90">
              {nearby.action ?? "Investigate"} — {nearby.label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}