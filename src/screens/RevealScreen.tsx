import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../domain/state/GameContext";

type Step = "HANDOVER" | "READY" | "SHOWING";

export default function RevealScreen() {
  const navigate = useNavigate();
  const { game, updateGame } = useGame();
  const [step, setStep] = useState<Step>("HANDOVER");
  const [holding, setHolding] = useState(false);
  const holdTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!game) navigate("/");
  }, [game, navigate]);

  useEffect(() => {
    return () => {
      if (holdTimer.current) window.clearTimeout(holdTimer.current);
    };
  }, []);

  if (!game) return null;

  const { players, currentRevealIndex } = game;
  const currentPlayer = players[currentRevealIndex];

  if (!currentPlayer) {
    return (
      <div className="screen">
        <p>Error: jugador no encontrado.</p>
        <button className="btn btn-secondary" onClick={() => navigate("/")}>
          Volver
        </button>
      </div>
    );
  }

  const isLastPlayer = currentRevealIndex === players.length - 1;

  const cancelHold = () => {
    if (holdTimer.current) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    setHolding(false);
  };

  const beginHold = () => {
    cancelHold();
    setHolding(true);
    holdTimer.current = window.setTimeout(() => {
      holdTimer.current = null;
      setHolding(false);
      setStep("SHOWING");
    }, 400);
  };

  const handleNext = () => {
    if (isLastPlayer) {
      updateGame((g) => ({ ...g, phase: "ROUND" }));
      navigate("/round");
    } else {
      updateGame((g) => ({
        ...g,
        currentRevealIndex: g.currentRevealIndex + 1,
      }));
      setStep("HANDOVER");
    }
  };

  if (step === "HANDOVER") {
    return (
      <div className="screen reveal-screen">
        <div className="reveal-center">
          <p className="reveal-label">Pasale el celular a</p>
          <h1 className="reveal-name">{currentPlayer.name}</h1>
          <p className="reveal-progress">
            {currentRevealIndex + 1} de {players.length}
          </p>
        </div>
        <div className="reveal-footer">
          <button
            type="button"
            className="btn btn-primary btn-large btn-block"
            onClick={() => setStep("READY")}
          >
            Soy {currentPlayer.name}
          </button>
          <p className="hint center">Nadie más debe mirar la pantalla.</p>
        </div>
      </div>
    );
  }

  if (step === "READY") {
    return (
      <div className="screen reveal-screen">
        <div className="reveal-center">
          <h1 className="reveal-name">{currentPlayer.name}</h1>
          <p className="reveal-instruction">
            Mantené presionado el botón para ver tu rol y tu palabra.
          </p>
        </div>
        <div className="reveal-footer">
          <button
            type="button"
            className={`btn btn-primary btn-large btn-block hold-btn ${holding ? "holding" : ""}`}
            onPointerDown={(e) => {
              e.preventDefault();
              beginHold();
            }}
            onPointerUp={cancelHold}
            onPointerCancel={cancelHold}
            onPointerLeave={cancelHold}
            onContextMenu={(e) => e.preventDefault()}
          >
            {holding ? "Soltá para cancelar" : "Mantené presionado"}
          </button>
          <p className="hint center">
            Se revela después de mantener 0.4 segundos.
          </p>
        </div>
      </div>
    );
  }

  const isImpostor = currentPlayer.role === "IMPOSTOR";
  const noWord = isImpostor && currentPlayer.word === null;

  return (
    <div
      className={`screen reveal-screen showing ${isImpostor ? "is-impostor" : "is-player"}`}
    >
      <div className="reveal-center">
        <p className="reveal-label">Tu rol es</p>
        <h1
          className={`reveal-role ${isImpostor ? "role-impostor" : "role-player"}`}
        >
          {isImpostor ? "IMPOSTOR" : "JUGADOR"}
        </h1>
        <div className="reveal-word-box">
          {noWord ? (
            <>
              <p className="reveal-word-label">No tenés palabra</p>
              <p className="reveal-word-hint">
                Improvisá y hacete pasar por uno más.
              </p>
            </>
          ) : (
            <>
              <p className="reveal-word-label">Tu palabra</p>
              <p className="reveal-word">{currentPlayer.word}</p>
            </>
          )}
        </div>
      </div>
      <div className="reveal-footer">
        <button
          type="button"
          className="btn btn-primary btn-large btn-block"
          onClick={handleNext}
        >
          {isLastPlayer ? "Todos listos, empezar" : "Entendido, siguiente"}
        </button>
        <p className="hint center">Memorizá tu palabra antes de continuar.</p>
      </div>
    </div>
  );
}
