export type Role = "PLAYER" | "IMPOSTOR";

export type GamePhase =
  | "SETUP"
  | "REVEAL"
  | "ROUND"
  | "VOTING"
  | "ELIMINATION"
  | "GAME_OVER";

export type ImpostorMode = "SIMILAR_WORD" | "NO_WORD";

export type TimerMode = "MIN_1" | "MIN_2" | "MIN_3" | "MIN_5" | "FREE";

export type StartMode = "RANDOM" | "MANUAL";

export type TieRule = "REVOTE" | "NO_ELIMINATION";

export type Winner = "PLAYERS" | "IMPOSTORS";

export interface Player {
  id: string;
  name: string;
  role: Role | null;
  word: string | null;
  isEliminated: boolean;
  score: number;
}

export interface Category {
  id: string;
  name: string;
  isCustom: boolean;
}

export interface WordPair {
  id: string;
  categoryId: string;
  realWord: string;
  impostorWord: string;
}

export interface GameConfig {
  categoryId: string;
  impostorMode: ImpostorMode;
  impostorCount: number;
  timerMode: TimerMode;
  startMode: StartMode;
  tieRule: TieRule;
  scoringEnabled: boolean;
}

export interface GameState {
  config: GameConfig;
  players: Player[];
  phase: GamePhase;
  currentRevealIndex: number;
  startingPlayerId: string | null;
  votes: Record<string, string>;
  roundNumber: number;
  lastEliminatedId: string | null;
  winner: Winner | null;
}

export interface GameHistoryEntry {
  id: string;
  date: number;
  playerNames: string[];
  impostorNames: string[];
  categoryName: string;
  winner: Winner;
  rounds: number;
}
