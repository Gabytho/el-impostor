import { createContext, useContext, useState, type ReactNode } from "react";
import type { GameState } from "../model/types";

interface GameContextValue {
  game: GameState | null;
  setGame: (g: GameState | null) => void;
  updateGame: (updater: (g: GameState) => GameState) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<GameState | null>(null);

  const updateGame = (updater: (g: GameState) => GameState) => {
    setGame((prev) => (prev ? updater(prev) : prev));
  };

  return (
    <GameContext.Provider value={{ game, setGame, updateGame }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame debe usarse dentro de GameProvider");
  return ctx;
}
