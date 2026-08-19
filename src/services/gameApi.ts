import { GAME_CONFIG } from "@/game/config";
import { getLevel, LEVELS } from "@/game/data/levels";
import type { LeaderboardRow, Player } from "@/game/types";
import type {
  AnswerResult,
  GameApi,
  InteractionResult,
  RegisterPayload,
  ScanResult,
} from "./types";

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

/**
 * Offline mock implementation of {@link GameApi}.
 *
 * All authoritative decisions (is this the clue object? is the answer right?
 * how much penalty?) are resolved HERE, not inside components, so replacing
 * this class with an HTTP client is a one-line change in `api`.
 */
class MockGameApi implements GameApi {
  private players = new Map<string, Player>();

  async registerPlayer(payload: RegisterPayload): Promise<Player> {
    await delay();
    const player: Player = {
      id: `p_${Math.random().toString(36).slice(2, 10)}`,
      playerName: payload.playerName,
      enrollmentNumber: payload.enrollmentNumber,
      team: payload.team,
      eventId: "techfest-2026",
      status: "not_started",
      currentLevel: 1,
      currentBuilding: "main_gate",
      currentRoom: null,
      startTime: null,
      endTime: null,
      gameTimeSeconds: 0,
      penaltySeconds: 0,
      finalTimeSeconds: 0,
      inventory: [],
    };
    this.players.set(player.id, player);
    return player;
  }

  async startSession(playerId: string) {
    await delay(60);
    const startTime = Date.now();
    const p = this.players.get(playerId);
    if (p) {
      p.startTime = startTime;
      p.status = "searching";
    }
    return { startTime };
  }

  async investigateObject(_playerId: string, objectId: string): Promise<InteractionResult> {
    await delay(80);
    for (const level of LEVELS) {
      const obj = level.objects.find((o) => o.id === objectId);
      if (!obj) continue;
      if (obj.holdsClue) {
        const { answer: _answer, ...safeChallenge } = level.challenge;
        return {
          objectId,
          outcome: "clue",
          message: obj.message,
          clue: level.clue,
          challenge: safeChallenge,
          grantedItem: obj.grantsItem,
        };
      }
      return { objectId, outcome: "decoy", message: obj.message };
    }
    return { objectId, outcome: "decoy", message: "Nothing of interest here." };
  }

  async submitAnswer(
    _playerId: string,
    challengeId: string,
    answer: string,
  ): Promise<AnswerResult> {
    await delay(160);
    const level = LEVELS.find((l) => l.challenge.id === challengeId);
    const expected = level?.challenge.answer ?? "";
    const correct =
      expected.length > 0 &&
      answer.trim().toLowerCase() === expected.trim().toLowerCase();
    return {
      correct,
      penaltySeconds: correct ? 0 : GAME_CONFIG.penalties.wrongAnswer,
      levelCompleted: correct,
      nextLevel: correct ? (level?.clue.nextLevel ?? null) : null,
      message: correct
        ? "Trace decrypted. Level complete."
        : "Incorrect. The terminal rejects your input.",
    };
  }

  async requestHint(_playerId: string, challengeId: string, order: number) {
    await delay(60);
    const level = LEVELS.find((l) => l.challenge.id === challengeId);
    const hint = level?.challenge.hints.find((h) => h.order === order);
    return {
      text: hint?.text ?? "No further hints available.",
      penaltySeconds: hint?.penaltySeconds ?? 0,
    };
  }

  async runScanner(
    _playerId: string,
    position: [number, number, number],
  ): Promise<ScanResult> {
    await delay(GAME_CONFIG.scanner.durationMs);
    const level = getLevel(1);
    const target = level.objects.find((o) => o.holdsClue);
    let message = "Nothing unusual detected.";
    if (target) {
      const dx = target.position[0] - position[0];
      const dz = target.position[2] - position[2];
      const dist = Math.hypot(dx, dz);
      if (dist < GAME_CONFIG.scanner.nearRange) message = "Unusual signal detected nearby.";
      else if (dist < GAME_CONFIG.scanner.nearRange * 2)
        message = "Faint electronic activity detected in this sector.";
    }
    return { message, penaltySeconds: GAME_CONFIG.penalties.scannerUse };
  }

  async completeSession(playerId: string): Promise<Player> {
    await delay(80);
    const p = this.players.get(playerId);
    if (!p) throw new Error("Unknown player");
    p.status = "completed";
    p.endTime = Date.now();
    return p;
  }

  async getLeaderboard(): Promise<LeaderboardRow[]> {
    await delay(60);
    const { MOCK_LEADERBOARD } = await import("./mockData");
    return MOCK_LEADERBOARD;
  }
}

export const api: GameApi = new MockGameApi();