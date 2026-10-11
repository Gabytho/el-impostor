import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../domain/state/GameContext";
import { useTimer, formatTime } from "../domain/logic/useTimer";
import { timerModeToSeconds } from "../domain/logic/gameLogic";
import { loadSettings } from "../data/storage/storage";

export default function RoundScreen() {
  const navigate = useNavigate();
  const { game, updateGame } = useGame();
  const [showStartBanner, setShowStartBanner] = useState(true);

  useEffect(() => {
    if (!game) navigate("/");
  }, [game, navigate]);

  const totalSeconds = game ? timerModeToSeconds(game.config.timerMode) : null;
  const { remaining, running, finished, start, pause, reset } =
    useTimer(totalSeconds);

  useEffect(() => {
    if (finished) {
      const settings = loadSettings();
      if (settings.vibrationEnabled && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, [finished]);

  if (!game) return null;

  const alivePlayers = game.players.filter((p) => !p.isEliminated);
  const startingPlayer = game.players.find(
    (p) => p.id === game.startingPlayerId,
  );
  const isFree = game.config.timerMode === "FREE";

  const handleGoToVoting = () => {
    updateGame((g) => ({ ...g, phase: "VOTING" }));
    navigate("/voting");
  };

  const progress = totalSeconds
    ? ((totalSeconds - remaining) / totalSeconds) * 100
    : 0;

  return (
    <div className="screen round-screen">
      <header className="screen-header">
        <span style={{ width: 40 }} />
        <h2>Ronda {game.roundNumber}</h2>
        <span style={{ width: 40 }} />
      </header>

      {showStartBanner && startingPlayer && (
        <div className="start-banner">
          <p className="start-label">Empieza</p>
          <p className="start-name">{startingPlayer.name}</p>
          <button
            className="btn-icon close-banner"
            onClick={() => setShowStartBanner(false)}
          >
            ×
          </button>
        </div>
      )}

      <section className="card timer-card">
        {isFree ? (
          <>
            <p className="timer-label">Discusión libre</p>
            <p className="timer-free">Sin límite de tiempo</p>
            <p className="hint center">
              Cuando terminen, toquen "Ir a votación".
            </p>
          </>
        ) : (
          <>
            <p className="timer-label">
              {finished
                ? "¡Tiempo agotado!"
                : running
                  ? "Discutiendo..."
                  : "En pausa"}
            </p>
            <div className="timer-display">
              <span className={finished ? "timer-finished" : ""}>
                {formatTime(remaining)}
              </span>
            </div>
            <div className="timer-progress">
              <div
                className="timer-progress-bar"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="timer-controls">
              {!running && remaining > 0 && (
                <button className="btn btn-primary" onClick={start}>
                  {remaining === totalSeconds ? "Iniciar" : "Continuar"}
                </button>
              )}
              {running && (
                <button className="btn btn-secondary" onClick={pause}>
                  Pausar
                </button>
              )}
              <button className="btn btn-secondary" onClick={reset}>
                Reiniciar
              </button>
            </div>
          </>
        )}
      </section>

      <section className="card">
        <div className="card-header">
          <h3>Jugadores en juego</h3>
          <span className="badge">{alivePlayers.length}</span>
        </div>
        <div className="alive-list">
          {alivePlayers.map((p) => (
            <div key={p.id} className="alive-item">
              <span className="alive-dot" />
              <span>{p.name}</span>
              {p.id === game.startingPlayerId && (
                <span className="alive-tag">Empieza</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="round-footer">
        <button
          className="btn btn-primary btn-large btn-block"
          onClick={handleGoToVoting}
        >
          Ir a votación
        </button>
      </div>
    </div>
  );
}
