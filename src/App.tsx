import * as React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { SecurityProvider } from "@/components/SecurityProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import { BlockedOnlyRoute } from "@/components/BlockedOnlyRoute";
import AppLayout from "@/components/AppLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Ingredients from "./pages/Ingredients";
import Orders from "./pages/Orders";
import Relatorios from "./pages/Relatorios";
import Recipes from "./pages/Recipes";
import Packaging from "./pages/Packaging";
import Pricing from "./pages/Pricing";
import Sales from "./pages/Sales";
import Customers from "./pages/Customers";
import Resale from "./pages/Resale";
import AccountsPayable from "./pages/AccountsPayable";
import FluxoCaixa from "./pages/FluxoCaixa";
import CostUpdate from "./pages/CostUpdate";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Suporte from "./pages/Suporte";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Performance optimization component integrated directly
const usePerformanceOptimization = () => {
  React.useEffect(() => {
    // Otimizar carregamento de recursos críticos
    const optimizeResources = () => {
      // Preload de fontes críticas com display swap
      const linkFont = document.createElement('link');
      linkFont.rel = 'preload';
      linkFont.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
      linkFont.as = 'style';
      linkFont.crossOrigin = 'anonymous';
      linkFont.onload = () => {
        linkFont.rel = 'stylesheet';
      };
      document.head.appendChild(linkFont);

      // Prefetch recursos importantes
      const resources = ['/favicon.ico'];
      resources.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        document.head.appendChild(link);
      });

      // Lazy loading de imagens
      if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach((img: any) => {
          img.src = img.dataset.src;
          img.loading = 'lazy';
          img.removeAttribute('data-src');
        });
      }
    };

    // Debounce para eventos de scroll
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        // Lógica de scroll otimizada
      }, 16); // ~60fps
    };

    // Throttle para eventos de resize
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Lógica de resize otimizada
      }, 250);
    };

    // Intersection Observer para lazy loading
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.loading = 'lazy';
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      // Observar imagens lazy
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }

    // Executar otimizações
    optimizeResources();

    // Event listeners otimizados
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      clearTimeout(scrollTimeout);
      clearTimeout(resizeTimeout);
    };
  }, []);
};

function App() {
  // Use performance optimization hook
  usePerformanceOptimization();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SecurityProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route element={<ProtectedRoute />}>
                <Route element={
                  <BlockedOnlyRoute>
                    <AppLayout />
                  </BlockedOnlyRoute>
                }>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/ingredients" element={<Ingredients />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/relatorios" element={<Relatorios />} />
                  <Route path="/recipes" element={<Recipes />} />
                  <Route path="/packaging" element={<Packaging />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/resale" element={<Resale />} />
                  <Route path="/accounts-payable" element={<AccountsPayable />} />
                  <Route path="/fluxo-caixa" element={<FluxoCaixa />} />
                  <Route path="/cost-update" element={<CostUpdate />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/suporte" element={<Suporte />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </SecurityProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
