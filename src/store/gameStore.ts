import { create } from "zustand";
import { GAME_CONFIG } from "@/game/config";
import { getLevel } from "@/game/data/levels";
import type {
  BuildingId,
  Challenge,
  Clue,
  InventoryItemId,
  Player,
  PlayerStatus,
} from "@/game/types";
import { api } from "@/services/gameApi";
import { realtime } from "@/services/realtime";
import type { InteractionResult } from "@/services/types";

export type SceneId = "campus" | "library_interior";
export type CameraMode = "third" | "first";
export type PanelId = "inventory" | "hint" | "scanner" | "pause" | "challenge" | "clue" | "level_complete" | null;

interface GameState {
  player: Player | null;
  status: PlayerStatus;
  scene: SceneId;
  cameraMode: CameraMode;
  currentLevel: number;
  building: BuildingId;
  room: string | null;
  startedAt: number | null;
  pausedAt: number | null;
  pausedTotalMs: number;
  elapsedSeconds: number;
  penaltySeconds: number;
  inventory: InventoryItemId[];
  discoveredClue: Clue | null;
  activeChallenge: Omit<Challenge, "answer"> | null;
  usedHints: number[];
  revealedHints: { order: number; text: string }[];
  investigated: string[];
  attempts: number;
  panel: PanelId;
  toast: string | null;
  lastInteraction: InteractionResult | null;
  scannerBusy: boolean;
  scannerResult: string | null;
  playerPosition: [number, number, number];
  levelCompleted: boolean;
  missionCompleted: boolean;

  register: (payload: { playerName: string; enrollmentNumber: string; team: string }) => Promise<void>;
  startGame: () => Promise<void>;
  tick: () => void;
  setScene: (scene: SceneId) => void;
  setCameraMode: (mode: CameraMode) => void;
  toggleCamera: () => void;
  setPanel: (panel: PanelId) => void;
  setToast: (msg: string | null) => void;
  setPlayerPosition: (pos: [number, number, number]) => void;
  investigate: (objectId: string) => Promise<void>;
  submitAnswer: (answer: string) => Promise<boolean>;
  useHint: (order: number) => Promise<void>;
  runScanner: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

const initial = {
  player: null,
  status: "not_started" as PlayerStatus,
  scene: "campus" as SceneId,
  cameraMode: "third" as CameraMode,
  currentLevel: 1,
  building: "main_gate" as BuildingId,
  room: null,
  startedAt: null,
  pausedAt: null,
  pausedTotalMs: 0,
  elapsedSeconds: 0,
  penaltySeconds: 0,
  inventory: [] as InventoryItemId[],
  discoveredClue: null,
  activeChallenge: null,
  usedHints: [] as number[],
  revealedHints: [] as { order: number; text: string }[],
  investigated: [] as string[],
  attempts: 0,
  panel: null as PanelId,
  toast: null,
  lastInteraction: null,
  scannerBusy: false,
  scannerResult: null,
  playerPosition: [0, 0, 42] as [number, number, number],
  levelCompleted: false,
  missionCompleted: false,
};

function log(
  state: GameState,
  type: Parameters<typeof realtime.emit>[0]["type"],
  message: string,
) {
  realtime.emit({
    playerId: state.player?.id ?? "local",
    playerName: state.player?.playerName ?? "Local Player",
    type,
    message,
  });
}

export const useGameStore = create<GameState>((set, get) => ({
  ...initial,

  register: async (payload) => {
    const player = await api.registerPlayer(payload);
    set({ player, status: "not_started" });
  },

  startGame: async () => {
    let player = get().player;
    if (!player) {
      player = await api.registerPlayer({
        playerName: "Guest Operative",
        enrollmentNumber: "GUEST",
        team: "Solo Operative",
      });
      set({ player });
    }
    const { startTime } = await api.startSession(player.id);
    set({ startedAt: startTime, status: "searching", scene: "campus", elapsedSeconds: 0 });
    log(get(), "player_started", "started the hunt at the Main Gate");
  },

  tick: () => {
    const { startedAt, pausedAt, pausedTotalMs, status } = get();
    if (!startedAt || status === "completed" || pausedAt) return;
    set({ elapsedSeconds: Math.floor((Date.now() - startedAt - pausedTotalMs) / 1000) });
  },

  setScene: (scene) => {
    const isLibrary = scene === "library_interior";
    set({
      scene,
      building: isLibrary ? "library" : "main_gate",
      room: isLibrary ? "reading_hall" : null,
    });
    if (isLibrary) log(get(), "room_entered", "entered Library / Reading Hall");
  },

  setCameraMode: (cameraMode) => set({ cameraMode }),
  toggleCamera: () => set({ cameraMode: get().cameraMode === "third" ? "first" : "third" }),
  setPanel: (panel) => set({ panel }),
  setToast: (toast) => set({ toast }),
  setPlayerPosition: (playerPosition) => set({ playerPosition }),

  investigate: async (objectId) => {
    const state = get();
    if (!state.startedAt || state.panel) return;
    const result = await api.investigateObject(state.player?.id ?? "local", objectId);
    const investigated = state.investigated.includes(objectId)
      ? state.investigated
      : [...state.investigated, objectId];

    if (result.outcome === "clue" && result.clue) {
      set({
        investigated,
        lastInteraction: result,
        discoveredClue: result.clue,
        activeChallenge: result.challenge ?? null,
        panel: "clue",
        status: "solving",
        inventory: result.grantedItem && !state.inventory.includes(result.grantedItem)
          ? [...state.inventory, result.grantedItem]
          : state.inventory,
      });
      log(get(), "clue_found", `found the encrypted trace in ${objectId}`);
      if (result.grantedItem) log(get(), "item_collected", `collected ${result.grantedItem}`);
      return;
    }

    set({ investigated, lastInteraction: result, toast: result.message });
    log(get(), "object_investigated", `investigated ${objectId}`);
  },

  submitAnswer: async (answer) => {
    const state = get();
    const challenge = state.activeChallenge;
    if (!challenge) return false;
    const res = await api.submitAnswer(state.player?.id ?? "local", challenge.id, answer);
    if (!res.correct) {
      set({
        penaltySeconds: state.penaltySeconds + res.penaltySeconds,
        attempts: state.attempts + 1,
        toast: `${res.message} +${res.penaltySeconds}s penalty`,
      });
      log(get(), "wrong_answer", `wrong answer on ${challenge.id} (+${res.penaltySeconds}s)`);
      return false;
    }

    const nextLevel = res.nextLevel;
    const mission = nextLevel === null;
    set({
      attempts: state.attempts + 1,
      levelCompleted: true,
      missionCompleted: mission,
      panel: "level_complete",
      status: mission ? "completed" : "searching",
      currentLevel: nextLevel ?? state.currentLevel,
      activeChallenge: null,
    });
    log(get(), "level_completed", `completed Level ${state.currentLevel}`);
    return true;
  },

  useHint: async (order) => {
    const state = get();
    const challenge = state.activeChallenge ?? getLevel(state.currentLevel).challenge;
    if (state.usedHints.includes(order)) return;
    const res = await api.requestHint(state.player?.id ?? "local", challenge.id, order);
    set({
      usedHints: [...state.usedHints, order],
      revealedHints: [...state.revealedHints, { order, text: res.text }],
      penaltySeconds: state.penaltySeconds + res.penaltySeconds,
    });
    log(get(), "hint_used", `used Hint ${order} (+${res.penaltySeconds}s)`);
  },

  runScanner: async () => {
    const state = get();
    if (state.scannerBusy || !state.startedAt) return;
    set({ scannerBusy: true, scannerResult: null, panel: "scanner" });
    const res = await api.runScanner(state.player?.id ?? "local", state.playerPosition);
    set({
      scannerBusy: false,
      scannerResult: res.message,
      penaltySeconds: get().penaltySeconds + res.penaltySeconds,
    });
    log(get(), "scanner_used", `used the AR scanner (+${res.penaltySeconds}s)`);
  },

  pause: () => {
    if (get().pausedAt) return;
    set({ pausedAt: Date.now(), panel: "pause" });
  },

  resume: () => {
    const { pausedAt, pausedTotalMs } = get();
    if (!pausedAt) {
      set({ panel: null });
      return;
    }
    set({ pausedAt: null, pausedTotalMs: pausedTotalMs + (Date.now() - pausedAt), panel: null });
  },

  reset: () => set({ ...initial }),
}));

export const selectFinalTime = (s: GameState) => s.elapsedSeconds + s.penaltySeconds;
export const TOTAL_LEVELS = GAME_CONFIG.totalLevels;
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__gameStore = useGameStore;
}
