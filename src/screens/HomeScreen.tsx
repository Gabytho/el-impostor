import { useNavigate } from "react-router-dom";

export default function HomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="screen home-screen">
      <div className="home-header">
        <h1 className="home-title">El Impostor</h1>
        <p className="home-subtitle">El juego de deducción</p>
      </div>

      <div className="home-menu">
        <button
          className="btn btn-primary btn-large"
          onClick={() => navigate("/setup")}
        >
          Nueva partida
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/categories")}
        >
          Categorías
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/history")}
        >
          Historial
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/settings")}
        >
          Ajustes
        </button>
      </div>

      <p className="home-version">v1.0 · Local · Offline</p>
    </div>
  );
}
