import type {
  Category,
  WordPair,
  GameHistoryEntry,
} from "../../domain/model/types";
import { SEED_CATEGORIES, SEED_WORD_PAIRS } from "../categories/seed";
const SEED_VERSION = "2"; // subí este número cada vez que cambies el seed
const KEYS = {
  CATEGORIES: "impostor_categories",
  WORD_PAIRS: "impostor_word_pairs",
  HISTORY: "impostor_history",
  SETTINGS: "impostor_settings",
  LAST_PLAYERS: "impostor_last_players",
  SEED_VERSION: "impostor_seed_version",
};

function ensureSeedVersion(): void {
  const current = localStorage.getItem(KEYS.SEED_VERSION);
  if (current !== SEED_VERSION) {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(SEED_CATEGORIES));
    localStorage.setItem(KEYS.WORD_PAIRS, JSON.stringify(SEED_WORD_PAIRS));
    localStorage.setItem(KEYS.SEED_VERSION, SEED_VERSION);
  }
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // silencioso
  }
}

// Categorías: si no hay, sembramos con las predefinidas
export function loadCategories(): Category[] {
  ensureSeedVersion();
  const stored = read<Category[] | null>(KEYS.CATEGORIES, null);
  if (stored && stored.length > 0) return stored;
  write(KEYS.CATEGORIES, SEED_CATEGORIES);
  return SEED_CATEGORIES;
}

export function saveCategories(categories: Category[]): void {
  write(KEYS.CATEGORIES, categories);
}

// Pares de palabras
export function loadWordPairs(): WordPair[] {
  ensureSeedVersion();
  const stored = read<WordPair[] | null>(KEYS.WORD_PAIRS, null);
  if (stored && stored.length > 0) return stored;
  write(KEYS.WORD_PAIRS, SEED_WORD_PAIRS);
  return SEED_WORD_PAIRS;
}

export function saveWordPairs(pairs: WordPair[]): void {
  write(KEYS.WORD_PAIRS, pairs);
}

// Historial
export function loadHistory(): GameHistoryEntry[] {
  return read<GameHistoryEntry[]>(KEYS.HISTORY, []);
}

export function saveHistory(history: GameHistoryEntry[]): void {
  write(KEYS.HISTORY, history);
}

export function addHistoryEntry(entry: GameHistoryEntry): void {
  const history = loadHistory();
  history.unshift(entry);
  saveHistory(history);
}

// Últimos jugadores usados (para precargar en Setup)
export function loadLastPlayers(): string[] {
  return read<string[]>(KEYS.LAST_PLAYERS, []);
}

export function saveLastPlayers(names: string[]): void {
  write(KEYS.LAST_PLAYERS, names);
}
export interface AppSettings {
  theme: "dark" | "light" | "system";
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  defaultImpostorMode: "SIMILAR_WORD" | "NO_WORD";
  defaultTimerMode: "MIN_1" | "MIN_2" | "MIN_3" | "MIN_5" | "FREE";
  defaultScoringEnabled: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  soundEnabled: true,
  vibrationEnabled: true,
  defaultImpostorMode: "SIMILAR_WORD",
  defaultTimerMode: "MIN_3",
  defaultScoringEnabled: false,
};

export function loadSettings(): AppSettings {
  return read<AppSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveSettings(settings: AppSettings): void {
  write(KEYS.SETTINGS, settings);
}

export function addCategory(category: Category): Category[] {
  const all = loadCategories();
  const next = [...all, category];
  saveCategories(next);
  return next;
}

export function updateCategory(category: Category): Category[] {
  const all = loadCategories();
  const next = all.map((c) => (c.id === category.id ? category : c));
  saveCategories(next);
  return next;
}

export function deleteCategory(categoryId: string): Category[] {
  const all = loadCategories();
  const next = all.filter((c) => c.id !== categoryId);
  saveCategories(next);
  // Borrar también sus pares de palabras
  const pairs = loadWordPairs();
  saveWordPairs(pairs.filter((p) => p.categoryId !== categoryId));
  return next;
}

export function addWordPair(pair: WordPair): WordPair[] {
  const all = loadWordPairs();
  const next = [...all, pair];
  saveWordPairs(next);
  return next;
}

export function updateWordPair(pair: WordPair): WordPair[] {
  const all = loadWordPairs();
  const next = all.map((p) => (p.id === pair.id ? pair : p));
  saveWordPairs(next);
  return next;
}

export function deleteWordPair(pairId: string): WordPair[] {
  const all = loadWordPairs();
  const next = all.filter((p) => p.id !== pairId);
  saveWordPairs(next);
  return next;
}

export function countWordsInCategory(categoryId: string): number {
  return loadWordPairs().filter((p) => p.categoryId === categoryId).length;
}

export function deleteHistoryEntry(id: string): GameHistoryEntry[] {
  const all = loadHistory();
  const next = all.filter((h) => h.id !== id);
  saveHistory(next);
  return next;
}

export function clearHistory(): void {
  saveHistory([]);
}
