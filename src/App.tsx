
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import AppLayout from "./components/AppLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { SecurityProvider } from "./components/SecurityProvider";
import PerformanceMonitor from "./components/PerformanceMonitor";
import ProtectedRoute from "./components/ProtectedRoute";

// Import all page components
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Ingredients from "./pages/Ingredients";
import Recipes from "./pages/Recipes";
import Packaging from "./pages/Packaging";
import Products from "./pages/Products";
import Pricing from "./pages/Pricing";
import Orders from "./pages/Orders";
import Sales from "./pages/Sales";
import Resale from "./pages/Resale";
import Customers from "./pages/Customers";
import AccountsPayable from "./pages/AccountsPayable";
import FluxoCaixa from "./pages/FluxoCaixa";
import Relatorios from "./pages/Relatorios";
import CostUpdate from "./pages/CostUpdate";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on auth errors
        if (error?.message?.includes('auth') || error?.message?.includes('403')) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

function App() {
  const handleSlowPerformance = (metrics: any) => {
    console.warn('Slow performance detected:', metrics);
    // In production, send to monitoring service
  };

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <QueryClientProvider client={queryClient}>
            <SecurityProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route element={<ProtectedRoute />}>
                      <Route element={<AppLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/admin" element={
                          <AdminRoute>
                            <Admin />
                          </AdminRoute>
                        } />
                        <Route path="/ingredients" element={<Ingredients />} />
                        <Route path="/recipes" element={<Recipes />} />
                        <Route path="/packaging" element={<Packaging />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/sales" element={<Sales />} />
                        <Route path="/resale" element={<Resale />} />
                        <Route path="/customers" element={<Customers />} />
                        <Route path="/accounts-payable" element={<AccountsPayable />} />
                        <Route path="/fluxo-caixa" element={<FluxoCaixa />} />
                        <Route path="/relatorios" element={<Relatorios />} />
                        <Route path="/cost-update" element={<CostUpdate />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/help" element={<Help />} />
                      </Route>
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  
                  {/* Performance Monitor - only show in development */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="fixed bottom-4 right-4 z-50">
                      <PerformanceMonitor 
                        showMetrics={true}
                        onSlowPerformance={handleSlowPerformance}
                      />
                    </div>
                  )}
                </BrowserRouter>
              </TooltipProvider>
            </SecurityProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
