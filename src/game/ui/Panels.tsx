import { useEffect, useState } from "react";
import { KeyRound, Package, ScanLine } from "lucide-react";
import { HoloPanel } from "./HoloPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GAME_CONFIG, INVENTORY_CATALOG, formatTime } from "@/game/config";
import { getLevel } from "@/game/data/levels";
import { useGameStore } from "@/store/gameStore";

export function CluePanel() {
  const clue = useGameStore((s) => s.discoveredClue);
  const setPanel = useGameStore((s) => s.setPanel);
  const interaction = useGameStore((s) => s.lastInteraction);
  if (!clue) return null;

  return (
    <HoloPanel
      title="ENCRYPTED TRACE RECOVERED"
      subtitle={interaction?.message}
      footer={
        <>
          <Button variant="ghost" onClick={() => setPanel(null)}>
            Later
          </Button>
          <Button onClick={() => setPanel("challenge")}>Open Challenge</Button>
        </>
      }
    >
      <blockquote className="rounded-md border border-primary/25 bg-primary/5 p-4 font-display text-base leading-relaxed text-primary">
        “{clue.text}”
      </blockquote>
      <p className="mt-3 text-xs text-muted-foreground">
        Decrypt this trace to confirm the next destination.
      </p>
    </HoloPanel>
  );
}

export function ChallengePanel() {
  const challenge = useGameStore((s) => s.activeChallenge);
  const submitAnswer = useGameStore((s) => s.submitAnswer);
  const setPanel = useGameStore((s) => s.setPanel);
  const attempts = useGameStore((s) => s.attempts);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!challenge) return null;

  const submit = async () => {
    if (!value.trim() || busy) return;
    setBusy(true);
    const ok = await submitAnswer(value.trim());
    setBusy(false);
    if (!ok) {
      setError(`Incorrect. +${challenge.penaltySeconds}s penalty added. Try again.`);
      setValue("");
    }
  };

  return (
    <HoloPanel
      title={`CHALLENGE — ${challenge.type.replace("_", " ").toUpperCase()}`}
      subtitle={`Attempts: ${attempts} · Wrong answer penalty: +${challenge.penaltySeconds}s`}
      onClose={() => setPanel(null)}
      footer={
        <>
          <Button variant="ghost" onClick={() => setPanel("hint")}>
            Need a hint?
          </Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? "Validating…" : "Submit Answer"}
          </Button>
        </>
      }
    >
      <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
        {challenge.question}
      </p>
      <Input
        autoFocus
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setError(null);
        }}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Enter your answer"
        className="mt-4 font-display tracking-widest"
      />
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      <p className="mt-3 text-[11px] text-muted-foreground">
        Answers are validated by the mission server; the client never scores itself.
      </p>
    </HoloPanel>
  );
}

export function InventoryPanel() {
  const inventory = useGameStore((s) => s.inventory);
  const setPanel = useGameStore((s) => s.setPanel);

  return (
    <HoloPanel title="INVENTORY" subtitle="Items recovered during the hunt" onClose={() => setPanel(null)}>
      {inventory.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No items collected yet. Investigate objects to recover equipment.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {inventory.map((id) => {
            const item = INVENTORY_CATALOG[id];
            return (
              <li key={id} className="rounded-md border border-primary/20 bg-primary/5 p-3">
                <div className="flex items-center gap-2 font-display text-sm text-primary">
                  <Package className="h-4 w-4" /> {item.name}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
              </li>
            );
          })}
        </ul>
      )}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {Object.values(INVENTORY_CATALOG)
          .filter((i) => !inventory.includes(i.id))
          .map((i) => (
            <div
              key={i.id}
              className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-xs text-muted-foreground"
            >
              <KeyRound className="h-3.5 w-3.5 opacity-50" /> {i.name} — not found
            </div>
          ))}
      </div>
    </HoloPanel>
  );
}

export function HintPanel() {
  const level = useGameStore((s) => s.currentLevel);
  const useHint = useGameStore((s) => s.useHint);
  const usedHints = useGameStore((s) => s.usedHints);
  const revealed = useGameStore((s) => s.revealedHints);
  const setPanel = useGameStore((s) => s.setPanel);
  const hints = getLevel(level).challenge.hints;

  return (
    <HoloPanel
      title="PROGRESSIVE HINTS"
      subtitle="Each hint adds a time penalty to your final score"
      onClose={() => setPanel(null)}
    >
      {hints.length === 0 && (
        <p className="text-sm text-muted-foreground">No hints configured for this level.</p>
      )}
      <div className="space-y-3">
        {hints.map((h) => {
          const used = usedHints.includes(h.order);
          const text = revealed.find((r) => r.order === h.order)?.text;
          return (
            <div
              key={h.order}
              className="rounded-md border border-border/70 bg-background/40 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-display text-sm text-foreground/90">Hint {h.order}</span>
                <span className="text-xs text-destructive">+{h.penaltySeconds}s</span>
              </div>
              {used ? (
                <p className="mt-2 text-sm text-primary/90">{text}</p>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-2"
                  onClick={() => useHint(h.order)}
                >
                  Reveal hint
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </HoloPanel>
  );
}

export function ScannerPanel() {
  const busy = useGameStore((s) => s.scannerBusy);
  const result = useGameStore((s) => s.scannerResult);
  const setPanel = useGameStore((s) => s.setPanel);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="scanline h-24 w-full bg-gradient-to-b from-transparent via-primary/25 to-transparent" />
      </div>
      <div className="holo-panel relative w-full max-w-md rounded-xl p-6 text-center">
        <ScanLine className="mx-auto h-8 w-8 text-primary" />
        <h2 className="mt-3 font-display text-base text-primary text-glow">AR SCANNER</h2>
        {busy ? (
          <p className="mt-3 text-sm text-muted-foreground">Sweeping local spectrum…</p>
        ) : (
          <p className="mt-3 text-sm text-foreground/90">{result}</p>
        )}
        <p className="mt-3 text-[11px] text-muted-foreground">
          Scanner usage penalty: +{GAME_CONFIG.penalties.scannerUse}s
        </p>
        <Button className="mt-5" disabled={busy} onClick={() => setPanel(null)}>
          Close
        </Button>
      </div>
    </div>
  );
}

export function PausePanel() {
  const resume = useGameStore((s) => s.resume);
  const elapsed = useGameStore((s) => s.elapsedSeconds);
  const penalty = useGameStore((s) => s.penaltySeconds);

  return (
    <HoloPanel
      title="MISSION PAUSED"
      subtitle="The clock is stopped"
      footer={<Button onClick={resume}>Resume Mission</Button>}
    >
      <dl className="grid grid-cols-3 gap-3 text-center">
        <Stat label="Game time" value={formatTime(elapsed)} />
        <Stat label="Penalty" value={`+${penalty}s`} />
        <Stat label="Final time" value={formatTime(elapsed + penalty)} />
      </dl>
      <div className="mt-5 space-y-1 text-xs text-muted-foreground">
        <p>WASD / Arrows — move · Mouse — look · E — investigate</p>
        <p>V — camera toggle · ESC — pause</p>
      </div>
    </HoloPanel>
  );
}

export function LevelCompletePanel() {
  const mission = useGameStore((s) => s.missionCompleted);
  const elapsed = useGameStore((s) => s.elapsedSeconds);
  const penalty = useGameStore((s) => s.penaltySeconds);
  const level = useGameStore((s) => s.currentLevel);
  const setPanel = useGameStore((s) => s.setPanel);
  const clue = useGameStore((s) => s.discoveredClue);

  return (
    <HoloPanel
      title={mission ? "CORE-X RECOVERED" : "LEVEL COMPLETE"}
      subtitle={
        mission
          ? "Mission accomplished."
          : `Trace decrypted. Next destination: ${clue?.destination ?? "unknown"}.`
      }
      footer={<Button onClick={() => setPanel(null)}>Continue</Button>}
    >
      <dl className="grid grid-cols-3 gap-3 text-center">
        <Stat label="Game time" value={formatTime(elapsed)} />
        <Stat label="Penalty" value={`+${penalty}s`} />
        <Stat label="Final time" value={formatTime(elapsed + penalty)} />
      </dl>
      <p className="mt-5 rounded-md border border-primary/25 bg-primary/5 p-3 text-sm text-primary">
        Level {Math.max(1, level - 1)} cleared. Levels {level}–{GAME_CONFIG.totalLevels} are
        scheduled for the next deployment of this prototype.
      </p>
    </HoloPanel>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-background/40 p-3">
      <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-display text-sm text-foreground">{value}</dd>
    </div>
  );
}

/** Transient decoy/penalty toast. */
export function GameToast() {
  const toast = useGameStore((s) => s.toast);
  const setToast = useGameStore((s) => s.setToast);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast, setToast]);

  if (!toast) return null;
  return (
    <div className="pointer-events-none absolute bottom-40 left-1/2 z-30 w-[min(92vw,28rem)] -translate-x-1/2">
      <div className="holo-panel rounded-lg px-4 py-3 text-center text-sm text-foreground/90">
        {toast}
      </div>
    </div>
  );
}