import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { GameHistoryEntry } from "../domain/model/types";
import {
  loadHistory,
  deleteHistoryEntry,
  clearHistory,
} from "../data/storage/storage";

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "Hace un momento";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHour < 24) return `Hace ${diffHour} h`;
  if (diffDay < 7) return `Hace ${diffDay} d`;

  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function HistoryScreen() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<GameHistoryEntry[]>(() =>
    loadHistory(),
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleDelete = (id: string) => {
    const next = deleteHistoryEntry(id);
    setHistory(next);
    if (expandedId === id) setExpandedId(null);
  };

  const handleClearAll = () => {
    clearHistory();
    setHistory([]);
    setConfirmClear(false);
  };

  return (
    <div className="screen history-screen">
      <header className="screen-header">
        <button className="btn-icon" onClick={() => navigate("/")}>
          ←
        </button>
        <h2>Historial</h2>
        <span style={{ width: 40 }} />
      </header>

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📜</div>
          <p className="empty-title">Sin partidas todavía</p>
          <p className="empty-subtitle">
            Cuando termines una partida, va a aparecer acá.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/setup")}
          >
            Nueva partida
          </button>
        </div>
      ) : (
        <>
          <section className="card">
            <div className="card-header">
              <h3>Partidas jugadas</h3>
              <span className="badge">{history.length}</span>
            </div>
            <div className="history-list">
              {history.map((entry) => {
                const playersWon = entry.winner === "PLAYERS";
                const expanded = expandedId === entry.id;

                return (
                  <div key={entry.id} className="history-item">
                    <button
                      className="history-main"
                      onClick={() => setExpandedId(expanded ? null : entry.id)}
                    >
                      <div className="history-icon">
                        {playersWon ? "🟢" : "🔴"}
                      </div>
                      <div className="history-info">
                        <span className="history-winner">
                          {playersWon
                            ? "Ganaron los jugadores"
                            : "Ganaron los impostores"}
                        </span>
                        <span className="history-meta">
                          {entry.categoryName} · {entry.rounds}{" "}
                          {entry.rounds === 1 ? "ronda" : "rondas"} ·{" "}
                          {formatDate(entry.date)}
                        </span>
                      </div>
                      <span className="history-chevron">
                        {expanded ? "▾" : "▸"}
                      </span>
                    </button>

                    {expanded && (
                      <div className="history-detail">
                        <div className="history-section">
                          <p className="history-label">Jugadores</p>
                          <p className="history-value">
                            {entry.playerNames.join(", ")}
                          </p>
                        </div>
                        <div className="history-section">
                          <p className="history-label">Impostores</p>
                          <p className="history-value impostor">
                            {entry.impostorNames.join(", ")}
                          </p>
                        </div>
                        <button
                          className="btn btn-secondary btn-block btn-small"
                          onClick={() => handleDelete(entry.id)}
                        >
                          Borrar del historial
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <div className="history-footer">
            {confirmClear ? (
              <div className="confirm-row">
                <span className="confirm-text">¿Borrar todo el historial?</span>
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => setConfirmClear(false)}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary btn-small"
                  style={{ background: "var(--danger)" }}
                  onClick={handleClearAll}
                >
                  Sí, borrar
                </button>
              </div>
            ) : (
              <button
                className="btn btn-secondary btn-block"
                onClick={() => setConfirmClear(true)}
              >
                Borrar todo el historial
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
