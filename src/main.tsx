
import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import PerformanceOptimizer from "./components/PerformanceOptimizer";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Otimizar carregamento inicial
const root = createRoot(rootElement);

// Renderizar com otimizações de performance
root.render(
  <React.StrictMode>
    <PerformanceOptimizer />
    <App />
  </React.StrictMode>
);

// Registrar service worker para cache
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Otimizações adicionais de performance
document.addEventListener('DOMContentLoaded', () => {
  // Remover CSS não utilizado após carregamento
  setTimeout(() => {
    const unusedStyles = document.querySelectorAll('style[data-unused]');
    unusedStyles.forEach(style => style.remove());
  }, 3000);
});
