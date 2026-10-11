import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  loadSettings,
  saveSettings,
  DEFAULT_SETTINGS,
  type AppSettings,
} from "../data/storage/storage";

export default function SettingsScreen() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  const update = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  };

  const handleReset = () => {
    saveSettings(DEFAULT_SETTINGS);
    setSettings(DEFAULT_SETTINGS);
  };

  const applyTheme = (theme: AppSettings["theme"]) => {
    const root = document.documentElement;
    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
  };

  const handleTheme = (theme: AppSettings["theme"]) => {
    update("theme", theme);
    applyTheme(theme);
  };

  return (
    <div className="screen settings-screen">
      <header className="screen-header">
        <button className="btn-icon" onClick={() => navigate("/")}>
          ←
        </button>
        <h2>Ajustes</h2>
        <span style={{ width: 40 }} />
      </header>

      <section className="card">
        <div className="card-header">
          <h3>Tema</h3>
        </div>
        <div className="segmented">
          <button
            className={`segment ${settings.theme === "dark" ? "active" : ""}`}
            onClick={() => handleTheme("dark")}
          >
            Oscuro
          </button>
          <button
            className={`segment ${settings.theme === "light" ? "active" : ""}`}
            onClick={() => handleTheme("light")}
          >
            Claro
          </button>
          <button
            className={`segment ${settings.theme === "system" ? "active" : ""}`}
            onClick={() => handleTheme("system")}
          >
            Sistema
          </button>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <h3>Sonido</h3>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => update("soundEnabled", e.target.checked)}
            />
            <span className="slider" />
          </label>
        </div>
        <p className="hint">Reproducir sonidos en botones y eventos.</p>
      </section>

      <section className="card">
        <div className="card-header">
          <h3>Vibración</h3>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.vibrationEnabled}
              onChange={(e) => update("vibrationEnabled", e.target.checked)}
            />
            <span className="slider" />
          </label>
        </div>
        <p className="hint">Vibrar cuando termina el temporizador.</p>
      </section>

      <section className="card">
        <div className="card-header">
          <h3>Modo impostor por defecto</h3>
        </div>
        <div className="segmented">
          <button
            className={`segment ${settings.defaultImpostorMode === "SIMILAR_WORD" ? "active" : ""}`}
            onClick={() => update("defaultImpostorMode", "SIMILAR_WORD")}
          >
            Palabra similar
          </button>
          <button
            className={`segment ${settings.defaultImpostorMode === "NO_WORD" ? "active" : ""}`}
            onClick={() => update("defaultImpostorMode", "NO_WORD")}
          >
            Sin palabra
          </button>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <h3>Tiempo por defecto</h3>
        </div>
        <div className="chip-row">
          {(["MIN_1", "MIN_2", "MIN_3", "MIN_5", "FREE"] as const).map((t) => (
            <button
              key={t}
              className={`chip ${settings.defaultTimerMode === t ? "active" : ""}`}
              onClick={() => update("defaultTimerMode", t)}
            >
              {t === "FREE" ? "Libre" : `${t.replace("MIN_", "")} min`}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <h3>Puntuación por defecto</h3>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.defaultScoringEnabled}
              onChange={(e) =>
                update("defaultScoringEnabled", e.target.checked)
              }
            />
            <span className="slider" />
          </label>
        </div>
        <p className="hint">
          Activar la puntuación al iniciar una nueva partida.
        </p>
      </section>

      <div className="settings-footer">
        <button className="btn btn-secondary btn-block" onClick={handleReset}>
          Restaurar valores por defecto
        </button>
        <p className="hint center">El Impostor v1.0 · Local · Offline</p>
      </div>
    </div>
  );
}
