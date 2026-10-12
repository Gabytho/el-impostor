import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import { loadSettings } from "./data/storage/storage";

const settings = loadSettings();
if (settings.theme !== "system") {
  document.documentElement.setAttribute("data-theme", settings.theme);
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

import { ErrorBoundary } from "./components/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
// Evitar el menú contextual (copiar/pegar) en toda la app
document.addEventListener("contextmenu", (e) => {
  const target = e.target as HTMLElement;
  // Permitir en inputs para que se pueda pegar
  if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
  e.preventDefault();
});
