import type {
  ActivityLog,
  Challenge,
  Clue,
  InventoryItemId,
  LeaderboardRow,
  Player,
} from "@/game/types";

export interface RegisterPayload {
  playerName: string;
  enrollmentNumber: string;
  team: string;
}

export interface InteractionResult {
  objectId: string;
  outcome: "decoy" | "clue" | "locked";
  message: string;
  clue?: Clue | undefined;
  challenge?: Omit<Challenge, "answer"> | undefined;
  grantedItem?: InventoryItemId | undefined;
}

export interface AnswerResult {
  correct: boolean;
  penaltySeconds: number;
  levelCompleted: boolean;
  nextLevel: number | null;
  message: string;
}

export interface ScanResult {
  message: string;
  penaltySeconds: number;
}

/**
 * The single boundary between the client and the (future) authoritative
 * backend. Every method here will become a REST call against the
 * Node/Express/MongoDB API. Nothing in the UI may bypass this interface.
 */
export interface GameApi {
  registerPlayer(payload: RegisterPayload): Promise<Player>;
  startSession(playerId: string): Promise<{ startTime: number }>;
  investigateObject(playerId: string, objectId: string): Promise<InteractionResult>;
  submitAnswer(playerId: string, challengeId: string, answer: string): Promise<AnswerResult>;
  requestHint(playerId: string, challengeId: string, order: number): Promise<{ text: string; penaltySeconds: number }>;
  runScanner(playerId: string, position: [number, number, number]): Promise<ScanResult>;
  completeSession(playerId: string): Promise<Player>;
  getLeaderboard(): Promise<LeaderboardRow[]>;
}

/** Replaced by a Socket.IO client later. */
export interface RealtimeChannel {
  subscribe(handler: (log: ActivityLog) => void): () => void;
  emit(log: Omit<ActivityLog, "id" | "createdAt">): void;
}