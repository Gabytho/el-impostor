import { HashRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "./domain/state/GameContext";
import HomeScreen from "./screens/HomeScreen";
import SetupScreen from "./screens/SetupScreen";
import RevealScreen from "./screens/RevealScreen";
import RoundScreen from "./screens/RoundScreen";
import VotingScreen from "./screens/VotingScreen";
import EliminationScreen from "./screens/EliminationScreen";
import GameOverScreen from "./screens/GameOverScreen";
import CategoriesScreen from "./screens/CategoriesScreen";
import HistoryScreen from "./screens/HistoryScreen";
import SettingsScreen from "./screens/SettingsScreen";
import CategoryDetailScreen from "./screens/CategoryDetailScreen";

function App() {
  return (
    <GameProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/setup" element={<SetupScreen />} />
          <Route path="/reveal" element={<RevealScreen />} />
          <Route path="/round" element={<RoundScreen />} />
          <Route path="/voting" element={<VotingScreen />} />
          <Route path="/elimination" element={<EliminationScreen />} />
          <Route path="/game-over" element={<GameOverScreen />} />
          <Route path="/categories" element={<CategoriesScreen />} />
          <Route path="/history" element={<HistoryScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route
            path="/categories/:categoryId"
            element={<CategoryDetailScreen />}
          />
        </Routes>
      </HashRouter>
    </GameProvider>
  );
}

export default App;
