import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../domain/state/GameContext";
import { loadSettings } from "../data/storage/storage";
import {
  loadCategories,
  loadWordPairs,
  loadLastPlayers,
  saveLastPlayers,
} from "../data/storage/storage";
import type {
  Category,
  GameConfig,
  TimerMode,
  ImpostorMode,
  StartMode,
  TieRule,
} from "../domain/model/types";
import {
  buildPlayers,
  assignRolesAndWords,
  pickStartingPlayer,
  suggestImpostorCount,
  maxImpostorCount,
} from "../domain/logic/gameLogic";

export default function SetupScreen() {
  const navigate = useNavigate();
  const { setGame } = useGame();
  const settings = loadSettings();
  const [categories] = useState<Category[]>(() => loadCategories());
  const [wordPairs] = useState(() => loadWordPairs());
  const [playerNames, setPlayerNames] = useState<string[]>(() => {
    const last = loadLastPlayers();
    if (last.length >= 3) return last;
    return ["", "", ""];
  });

  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id ?? "");
  const [impostorMode, setImpostorMode] = useState<ImpostorMode>(
    settings.defaultImpostorMode,
  );
  const [impostorCount, setImpostorCount] = useState<number>(1);
  const [timerMode, setTimerMode] = useState<TimerMode>(
    settings.defaultTimerMode,
  );
  const [startMode, setStartMode] = useState<StartMode>("RANDOM");
  const [tieRule, setTieRule] = useState<TieRule>("REVOTE");
  const [scoringEnabled, setScoringEnabled] = useState(
    settings.defaultScoringEnabled,
  );

  const validNames = useMemo(
    () => playerNames.map((n) => n.trim()).filter((n) => n.length > 0),
    [playerNames],
  );

  const validCount = validNames.length;

  const maxImpostors = validCount >= 3 ? maxImpostorCount(validCount) : 1;

  useEffect(() => {
    if (validCount < 3) return;
    const suggested = Math.min(
      suggestImpostorCount(validCount),
      maxImpostorCount(validCount),
    );
    setImpostorCount(suggested);
  }, [validCount]);

  const updateName = (index: number, value: string) => {
    setPlayerNames((prev) => prev.map((n, i) => (i === index ? value : n)));
  };

  const addPlayer = () => {
    if (playerNames.length >= 12) return;
    setPlayerNames((prev) => [...prev, ""]);
  };

  const removePlayer = (index: number) => {
    if (playerNames.length <= 3) return;
    setPlayerNames((prev) => prev.filter((_, i) => i !== index));
  };
  const selectedCategoryPairCount = wordPairs.filter(
    (w) => w.categoryId === categoryId,
  ).length;
  const categoryHasWords = selectedCategoryPairCount > 0;
  const canStart = validCount >= 3 && categoryId !== "" && categoryHasWords;
  const handleStart = () => {
    if (!canStart) return;
    const names = validNames;
    const players = buildPlayers(names);

    const config: GameConfig = {
      categoryId,
      impostorMode,
      impostorCount: Math.min(impostorCount, maxImpostorCount(names.length)),
      timerMode,
      startMode,
      tieRule,
      scoringEnabled,
    };

    const withRoles = assignRolesAndWords(players, config, wordPairs);
    const startingPlayerId =
      startMode === "RANDOM"
        ? pickStartingPlayer(withRoles)
        : (withRoles[0]?.id ?? null);

    saveLastPlayers(names);

    setGame({
      config,
      players: withRoles,
      phase: "REVEAL",
      currentRevealIndex: 0,
      startingPlayerId,
      votes: {},
      roundNumber: 1,
      lastEliminatedId: null,
      winner: null,
    });

    navigate("/reveal");
  };

  return (
    <div className="screen setup-screen">
      <header className="screen-header">
        <button className="btn-icon" onClick={() => navigate("/")}>
          ←
        </button>
        <h2>Configurar partida</h2>
        <span style={{ width: 40 }} />
      </header>

      <section className="card">
        <div className="card-header">
          <h3>Jugadores</h3>
          <span className="badge">{validCount}/12</span>
        </div>
        <div className="player-list">
          {playerNames.map((name, i) => (
            <div key={i} className="player-row">
              <span className="player-index">{i + 1}</span>
              <input
                className="input"
                type="text"
                placeholder={`Jugador ${i + 1}`}
                value={name}
                maxLength={16}
                onChange={(e) => updateName(i, e.target.value)}
              />
              <button
                className="btn-icon danger"
                disabled={playerNames.length <= 3}
                onClick={() => removePlayer(i)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          className="btn btn-secondary btn-block"
          disabled={playerNames.length >= 12}
          onClick={addPlayer}
        >
          + Agregar jugador
        </button>
      </section>

      <section className="card">
        <div className="card-header">
          <h3>Categoría</h3>
        </div>
        <select
          className="input"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </section>

      <section className="card">
        <div className="card-header">
          <h3>Impostores</h3>
          <span className="badge">{impostorCount}</span>
        </div>
        <div className="stepper">
          <button
            className="btn-icon"
            disabled={impostorCount <= 1}
            onClick={() => setImpostorCount((n) => Math.max(1, n - 1))}
          >
            −
          </button>
          <span className="stepper-value">{impostorCount}</span>
          <button
            className="btn-icon"
            disabled={impostorCount >= maxImpostors}
            onClick={() =>
              setImpostorCount((n) => Math.min(maxImpostors, n + 1))
            }
          >
            +
          </button>
        </div>
        <p className="hint">Máximo permitido: {maxImpostors}</p>

        <div className="option-group">
          <label className="option-label">Modo impostor</label>
          <div className="segmented">
            <button
              className={`segment ${impostorMode === "SIMILAR_WORD" ? "active" : ""}`}
              onClick={() => setImpostorMode("SIMILAR_WORD")}
            >
              Palabra similar
            </button>
            <button
              className={`segment ${impostorMode === "NO_WORD" ? "active" : ""}`}
              onClick={() => setImpostorMode("NO_WORD")}
            >
              Sin palabra
            </button>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <h3>Tiempo de discusión</h3>
        </div>
        <div className="chip-row">
          {(["MIN_1", "MIN_2", "MIN_3", "MIN_5", "FREE"] as TimerMode[]).map(
            (t) => (
              <button
                key={t}
                className={`chip ${timerMode === t ? "active" : ""}`}
                onClick={() => setTimerMode(t)}
              >
                {t === "FREE" ? "Libre" : `${t.replace("MIN_", "")} min`}
              </button>
            ),
          )}
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <h3>Quién empieza</h3>
        </div>
        <div className="segmented">
          <button
            className={`segment ${startMode === "RANDOM" ? "active" : ""}`}
            onClick={() => setStartMode("RANDOM")}
          >
            Aleatorio
          </button>
          <button
            className={`segment ${startMode === "MANUAL" ? "active" : ""}`}
            onClick={() => setStartMode("MANUAL")}
          >
            Manual
          </button>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <h3>Si hay empate</h3>
        </div>
        <div className="segmented">
          <button
            className={`segment ${tieRule === "REVOTE" ? "active" : ""}`}
            onClick={() => setTieRule("REVOTE")}
          >
            Revotar
          </button>
          <button
            className={`segment ${tieRule === "NO_ELIMINATION" ? "active" : ""}`}
            onClick={() => setTieRule("NO_ELIMINATION")}
          >
            Nadie eliminado
          </button>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <h3>Puntuación</h3>
          <label className="switch">
            <input
              type="checkbox"
              checked={scoringEnabled}
              onChange={(e) => setScoringEnabled(e.target.checked)}
            />
            <span className="slider" />
          </label>
        </div>
        <p className="hint">Opcional. Suma puntos al final de cada ronda.</p>
      </section>

      <div className="setup-footer">
        <button
          className="btn btn-primary btn-large btn-block"
          disabled={!canStart}
          onClick={handleStart}
        >
          {canStart
            ? "Comenzar partida"
            : validCount < 3
              ? "Necesitás al menos 3 jugadores"
              : !categoryHasWords
                ? "Elegí una categoría con palabras"
                : "Elegí una categoría"}
        </button>
      </div>
    </div>
  );
}
