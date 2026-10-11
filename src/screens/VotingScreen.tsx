import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../domain/state/GameContext";

export default function VotingScreen() {
  const navigate = useNavigate();
  const { game, updateGame } = useGame();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!game) {
    navigate("/");
    return null;
  }

  const alivePlayers = game.players.filter((p) => !p.isEliminated);

  const handleConfirm = () => {
    if (!selectedId) return;
    updateGame((g) => {
      const votes = { ...g.votes, [g.roundNumber.toString()]: selectedId };
      return {
        ...g,
        votes,
        lastEliminatedId: selectedId,
        phase: "ELIMINATION",
      };
    });
    navigate("/elimination");
  };

  return (
    <div className="screen voting-screen">
      <header className="screen-header">
        <span style={{ width: 40 }} />
        <h2>Votación</h2>
        <span style={{ width: 40 }} />
      </header>

      <p className="voting-question">¿A quién quieren eliminar?</p>

      <div className="vote-list">
        {alivePlayers.map((p) => (
          <button
            key={p.id}
            className={`vote-item ${selectedId === p.id ? "selected" : ""}`}
            onClick={() => setSelectedId(p.id)}
          >
            <span className="vote-avatar">
              {p.name.charAt(0).toUpperCase()}
            </span>
            <span className="vote-name">{p.name}</span>
            {selectedId === p.id && <span className="vote-check">✓</span>}
          </button>
        ))}
      </div>

      <div className="round-footer">
        <button
          className="btn btn-primary btn-large btn-block"
          disabled={!selectedId}
          onClick={handleConfirm}
        >
          {selectedId ? "Confirmar voto" : "Elegí un jugador"}
        </button>
      </div>
    </div>
  );
}
