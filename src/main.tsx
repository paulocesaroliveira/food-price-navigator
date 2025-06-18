
import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Otimizar carregamento inicial
const root = createRoot(rootElement);

// Renderizar com otimizações de performance
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service Worker otimizado para cache
if ('serviceWorker' in navigator && 'caches' in window) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })
    .then((registration) => {
      console.log('SW registered: ', registration);
      
      // Atualizar SW automaticamente
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nova versão disponível
              newWorker.postMessage({ action: 'skipWaiting' });
            }
          });
        }
      });
    })
    .catch((registrationError) => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

// Otimizações de performance crítica
document.addEventListener('DOMContentLoaded', () => {
  // Preload recursos críticos
  const criticalResources = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
  ];
  
  criticalResources.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = 'style';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });

  // Remover CSS não utilizado após carregamento
  setTimeout(() => {
    const unusedStyles = document.querySelectorAll('style[data-unused]');
    unusedStyles.forEach(style => style.remove());
  }, 3000);

  // Otimizar imagens lazy loading
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (!img.hasAttribute('loading')) {
      img.loading = 'lazy';
    }
  });
});

// Monitorar performance
if (typeof window !== 'undefined' && 'performance' in window) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      console.log('Page Load Performance:', {
        loadTime: perfData.loadEventEnd - perfData.loadEventStart,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime
      });
    }, 1000);
  });
}
