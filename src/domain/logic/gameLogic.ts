import type {
  Player,
  GameConfig,
  WordPair,
  Winner,
  Role,
} from "../model/types";

export function createId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return (
    "id_" + Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
  );
}

export function suggestImpostorCount(playerCount: number): number {
  if (playerCount <= 6) return 1;
  if (playerCount <= 9) return 2;
  return 3;
}

export function maxImpostorCount(playerCount: number): number {
  return Math.max(1, Math.floor((playerCount - 1) / 2));
}

export function buildPlayers(names: string[]): Player[] {
  return names.map((name) => ({
    id: createId(),
    name: name.trim(),
    role: null,
    word: null,
    isEliminated: false,
    score: 0,
  }));
}

export interface AssignResult {
  players: Player[];
  realWord: string;
  impostorWord: string;
}
export function assignRolesAndWords(
  players: Player[],
  config: GameConfig,
  wordPairs: WordPair[],
): AssignResult {
  const pool = wordPairs.filter((w) => w.categoryId === config.categoryId);
  if (pool.length === 0) {
    throw new Error("No hay palabras en esta categoría");
  }
  const pair = pool[Math.floor(Math.random() * pool.length)];

  const shuffled = [...players].sort(() => Math.random() - 0.5);
  const impostorIds = new Set(
    shuffled.slice(0, config.impostorCount).map((p) => p.id),
  );

  const updatedPlayers = players.map((p) => {
    const isImpostor = impostorIds.has(p.id);
    const role: Role = isImpostor ? "IMPOSTOR" : "PLAYER";
    let word: string | null = pair.realWord;
    if (isImpostor) {
      word = config.impostorMode === "NO_WORD" ? null : pair.impostorWord;
    }
    return {
      ...p,
      role,
      word,
      isEliminated: false,
      score: 0,
    };
  });

  return {
    players: updatedPlayers,
    realWord: pair.realWord,
    impostorWord: pair.impostorWord,
  };
}

export function pickStartingPlayer(players: Player[]): string {
  const idx = Math.floor(Math.random() * players.length);
  return players[idx].id;
}

export function checkVictory(players: Player[]): Winner | null {
  const alive = players.filter((p) => !p.isEliminated);
  const aliveImpostors = alive.filter((p) => p.role === "IMPOSTOR").length;
  const aliveNormals = alive.length - aliveImpostors;

  if (aliveImpostors === 0) return "PLAYERS";
  if (aliveImpostors >= aliveNormals) return "IMPOSTORS";
  return null;
}
import type { TimerMode } from "../model/types";

export function timerModeToSeconds(mode: TimerMode): number | null {
  switch (mode) {
    case "MIN_1":
      return 60;
    case "MIN_2":
      return 120;
    case "MIN_3":
      return 180;
    case "MIN_5":
      return 300;
    case "FREE":
      return null;
  }
}
export interface VoteResult {
  eliminatedId: string | null;
  tie: boolean;
  tally: Record<string, number>;
}

export function tallyVotes(votes: Record<string, string>): VoteResult {
  const tally: Record<string, number> = {};
  Object.values(votes).forEach((targetId) => {
    tally[targetId] = (tally[targetId] ?? 0) + 1;
  });

  const entries = Object.entries(tally);
  if (entries.length === 0) {
    return { eliminatedId: null, tie: false, tally };
  }

  const max = Math.max(...entries.map(([, n]) => n));
  const top = entries.filter(([, n]) => n === max);

  if (top.length > 1) {
    return { eliminatedId: null, tie: true, tally };
  }
  return { eliminatedId: top[0][0], tie: false, tally };
}

export function scoringForElimination(
  eliminated: Player,
  players: Player[],
): Player[] {
  const wasImpostor = eliminated.role === "IMPOSTOR";
  return players.map((p) => {
    if (p.id === eliminated.id) return p;
    if (p.role === "IMPOSTOR" && !wasImpostor) {
      return { ...p, score: p.score + 3 };
    }
    if (p.role === "PLAYER" && wasImpostor) {
      return { ...p, score: p.score + 2 };
    }
    return p;
  });
}
import type { GameState } from "../model/types";

export function resetPlayersForRematch(players: Player[]): Player[] {
  return players.map((p) => ({
    ...p,
    role: null,
    word: null,
    isEliminated: false,
    score: 0,
  }));
}

export function rebuildGameForRematch(
  game: GameState,
  wordPairs: WordPair[],
): GameState {
  const cleanPlayers = resetPlayersForRematch(game.players);
  const result = assignRolesAndWords(cleanPlayers, game.config, wordPairs);
  const startingPlayerId =
    game.config.startMode === "RANDOM"
      ? pickStartingPlayer(result.players)
      : (result.players[0]?.id ?? null);

  return {
    ...game,
    players: result.players,
    realWord: result.realWord,
    impostorWord: result.impostorWord,
    phase: "REVEAL",
    currentRevealIndex: 0,
    startingPlayerId,
    votes: {},
    roundNumber: 1,
    lastEliminatedId: null,
    winner: null,
  };
}
