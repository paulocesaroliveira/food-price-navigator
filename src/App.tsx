
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Ingredients from "./pages/Ingredients";
import Recipes from "./pages/Recipes";
import Products from "./pages/Products";
import Packaging from "./pages/Packaging";
import Orders from "./pages/Orders";
import Sales from "./pages/Sales";
import Customers from "./pages/Customers";
import Pricing from "./pages/Pricing";
import CostUpdate from "./pages/CostUpdate";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import AccountsPayable from "./pages/AccountsPayable";
import Resale from "./pages/Resale";
import FluxoCaixa from "./pages/FluxoCaixa";
import Relatorios from "./pages/Relatorios";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AppLayout from "./components/AppLayout";
import { SecurityProvider } from "./components/SecurityProvider";
import { CSRFProvider } from "./components/security/CSRFProtection";
import { EnhancedSecurityHeaders } from "./components/security/EnhancedSecurityHeaders";
import { ErrorBoundary } from "./components/ErrorBoundary";
import PerformanceMonitor from "./components/PerformanceMonitor";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <CSRFProvider>
              <SecurityProvider>
                <EnhancedSecurityHeaders />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route element={<ProtectedRoute />}>
                      <Route element={<AppLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/ingredients" element={<Ingredients />} />
                        <Route path="/recipes" element={<Recipes />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/packaging" element={<Packaging />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/sales" element={<Sales />} />
                        <Route path="/customers" element={<Customers />} />
                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="/cost-update" element={<CostUpdate />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/help" element={<Help />} />
                        <Route path="/accounts-payable" element={<AccountsPayable />} />
                        <Route path="/resale" element={<Resale />} />
                        <Route path="/fluxo-caixa" element={<FluxoCaixa />} />
                        <Route path="/relatorios" element={<Relatorios />} />
                        <Route 
                          path="/admin" 
                          element={
                            <AdminRoute>
                              <Admin />
                            </AdminRoute>
                          } 
                        />
                      </Route>
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
                <Toaster />
                <Sonner />
                <PerformanceMonitor />
              </SecurityProvider>
            </CSRFProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
