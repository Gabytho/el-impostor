import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../domain/state/GameContext";
import {
  checkVictory,
  tallyVotes,
  scoringForElimination,
  createId,
} from "../domain/logic/gameLogic";
import { addHistoryEntry, loadCategories } from "../data/storage/storage";

type Stage = "VOTED" | "REVEALED";

export default function EliminationScreen() {
  const navigate = useNavigate();
  const { game, updateGame } = useGame();
  const [stage, setStage] = useState<Stage>("VOTED");

  useEffect(() => {
    if (!game) navigate("/");
  }, [game, navigate]);

  if (!game) return null;

  const votesThisRound = game.votes[game.roundNumber.toString()];
  const syntheticVotes: Record<string, string> = votesThisRound
    ? { current: votesThisRound }
    : {};
  const { eliminatedId, tie } = tallyVotes(syntheticVotes);

  const eliminated = game.players.find((p) => p.id === eliminatedId) ?? null;

  const handleReveal = () => {
    if (!eliminated) return;
    updateGame((g) => {
      let updatedPlayers = g.players.map((p) =>
        p.id === eliminated.id ? { ...p, isEliminated: true } : p,
      );
      if (g.config.scoringEnabled) {
        updatedPlayers = scoringForElimination(eliminated, updatedPlayers);
      }
      return { ...g, players: updatedPlayers };
    });
    setStage("REVEALED");
  };

  const handleContinue = () => {
    if (!eliminated) {
      // Empate sin eliminación: pasar a siguiente ronda
      updateGame((g) => ({
        ...g,
        roundNumber: g.roundNumber + 1,
        phase: "ROUND",
      }));
      navigate("/round");
      return;
    }

    const updatedPlayers = game.players.map((p) =>
      p.id === eliminated.id ? { ...p, isEliminated: true } : p,
    );
    const winner = checkVictory(updatedPlayers);

    if (winner) {
      addHistoryEntry({
        id: createId(),
        date: Date.now(),
        playerNames: game.players.map((p) => p.name),
        impostorNames: game.players
          .filter((p) => p.role === "IMPOSTOR")
          .map((p) => p.name),
        categoryName:
          loadCategories().find((c) => c.id === game.config.categoryId)?.name ??
          "",
        winner,
        rounds: game.roundNumber,
      });
      updateGame((g) => ({ ...g, phase: "GAME_OVER", winner }));
      navigate("/game-over");
    } else {
      updateGame((g) => ({
        ...g,
        roundNumber: g.roundNumber + 1,
        phase: "ROUND",
        startingPlayerId: null,
      }));
      navigate("/round");
    }
  };

  // Empate sin eliminación
  if (tie || !eliminated) {
    return (
      <div className="screen elimination-screen">
        <div className="elim-center">
          <div className="elim-icon tie-icon">🤝</div>
          <h1 className="elim-title">Empate</h1>
          <p className="elim-subtitle">
            {game.config.tieRule === "REVOTE"
              ? "Nadie fue eliminado. Vuelvan a discutir y votar."
              : "Nadie fue eliminado esta ronda."}
          </p>
        </div>
        <div className="round-footer">
          <button
            className="btn btn-primary btn-large btn-block"
            onClick={handleContinue}
          >
            Siguiente ronda
          </button>
        </div>
      </div>
    );
  }

  const isImpostor = eliminated.role === "IMPOSTOR";

  if (stage === "VOTED") {
    return (
      <div className="screen elimination-screen">
        <div className="elim-center">
          <p className="elim-label">El grupo eliminó a</p>
          <h1 className="elim-name">{eliminated.name}</h1>
          <p className="elim-instruction">Toca el botón para revelar su rol.</p>
        </div>
        <div className="round-footer">
          <button
            className="btn btn-primary btn-large btn-block"
            onClick={handleReveal}
          >
            Revelar rol
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`screen elimination-screen revealed ${isImpostor ? "is-impostor" : "is-player"}`}
    >
      <div className="elim-center">
        <p className="elim-label">{eliminated.name} era</p>
        <h1
          className={`elim-role ${isImpostor ? "role-impostor" : "role-player"}`}
        >
          {isImpostor ? "IMPOSTOR" : "JUGADOR"}
        </h1>
      </div>
      <div className="round-footer">
        <button
          className="btn btn-primary btn-large btn-block"
          onClick={handleContinue}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
