import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../domain/state/GameContext";
import { loadWordPairs, loadCategories } from "../data/storage/storage";
import { rebuildGameForRematch } from "../domain/logic/gameLogic";

export default function GameOverScreen() {
  const navigate = useNavigate();
  const { game, setGame } = useGame();
  const [showRoles, setShowRoles] = useState(false);

  useEffect(() => {
    if (!game || !game.winner) navigate("/");
  }, [game, navigate]);

  if (!game || !game.winner) return null;

  const playersWon = game.winner === "PLAYERS";
  const categoryName =
    loadCategories().find((c) => c.id === game.config.categoryId)?.name ?? "";
  const sortedByScore = [...game.players].sort((a, b) => b.score - a.score);

  const handleRematch = () => {
    const wordPairs = loadWordPairs();
    const next = rebuildGameForRematch(game, wordPairs);
    setGame(next);
    navigate("/reveal");
  };

  const handleHome = () => {
    setGame(null);
    navigate("/");
  };

  return (
    <div
      className={`screen gameover-screen ${playersWon ? "players-win" : "impostors-win"}`}
    >
      <div className="gameover-center">
        <p className="gameover-label">Fin de la partida</p>
        <h1 className="gameover-winner">
          {playersWon ? "¡Ganaron los jugadores!" : "¡Ganaron los impostores!"}
        </h1>
        <p className="gameover-subtitle">
          Categoría: {categoryName} · {game.roundNumber} ronda
          {game.roundNumber !== 1 ? "s" : ""}
        </p>
      </div>

      <section className="card">
        <div className="card-header">
          <h3>Roles</h3>
          <button className="btn-link" onClick={() => setShowRoles((v) => !v)}>
            {showRoles ? "Ocultar" : "Mostrar"}
          </button>
        </div>
        <div className="roles-list">
          {game.players.map((p) => {
            const isImpostor = p.role === "IMPOSTOR";
            return (
              <div
                key={p.id}
                className={`role-item ${isImpostor ? "role-item-impostor" : ""}`}
              >
                <div className="role-item-left">
                  <span className="role-item-name">{p.name}</span>
                  {p.isEliminated && (
                    <span className="role-item-tag">Eliminado</span>
                  )}
                </div>
                {showRoles ? (
                  <div className="role-item-right">
                    <span
                      className={`role-tag ${isImpostor ? "tag-impostor" : "tag-player"}`}
                    >
                      {isImpostor ? "Impostor" : "Jugador"}
                    </span>
                    <span className="role-item-word">
                      {p.word ?? "Sin palabra"}
                    </span>
                  </div>
                ) : (
                  <span className="role-hidden">•••</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {game.config.scoringEnabled && (
        <section className="card">
          <div className="card-header">
            <h3>Puntuación</h3>
          </div>
          <div className="score-list">
            {sortedByScore.map((p, i) => (
              <div key={p.id} className="score-item">
                <span className="score-rank">#{i + 1}</span>
                <span className="score-name">{p.name}</span>
                <span className="score-value">{p.score}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="gameover-footer">
        <button
          className="btn btn-primary btn-large btn-block"
          onClick={handleRematch}
        >
          Revancha
        </button>
        <button className="btn btn-secondary btn-block" onClick={handleHome}>
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
