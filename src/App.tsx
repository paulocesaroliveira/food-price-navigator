
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from "next-themes";
import { SecurityProvider } from "./components/SecurityProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import PerformanceMonitor from "./components/PerformanceMonitor";
import PerformanceOptimizer from "./components/PerformanceOptimizer";
import SecurityMonitor from "./components/security/SecurityMonitor";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SecureAuth from "./pages/SecureAuth";
import Dashboard from "./pages/Dashboard";
import Ingredients from "./pages/Ingredients";
import Recipes from "./pages/Recipes";
import Products from "./pages/Products";
import Pricing from "./pages/Pricing";
import Orders from "./pages/Orders";
import Sales from "./pages/Sales";
import AccountsPayable from "./pages/AccountsPayable";
import Customers from "./pages/Customers";
import Resale from "./pages/Resale";
import Relatorios from "./pages/Relatorios";
import Financeiro from "./pages/Financeiro";

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <PerformanceOptimizer>
        <HelmetProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SecurityProvider>
              <SecurityMonitor />
              <PerformanceMonitor showMetrics={false} />
              <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/secure-auth" element={<SecureAuth />} />
                      <Route path="/app" element={<AppLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="ingredients" element={<Ingredients />} />
                        <Route path="recipes" element={<Recipes />} />
                        <Route path="products" element={<Products />} />
                        <Route path="pricing" element={<Pricing />} />
                        <Route path="orders" element={<Orders />} />
                        <Route path="sales" element={<Sales />} />
                        <Route path="financeiro" element={<Financeiro />} />
                        <Route path="accounts-payable" element={<AccountsPayable />} />
                        <Route path="customers" element={<Customers />} />
                        <Route path="resale" element={<Resale />} />
                        <Route path="relatorios" element={<Relatorios />} />
                      </Route>
                    </Routes>
                  </BrowserRouter>
                  <Toaster />
                  <Sonner />
                </TooltipProvider>
              </QueryClientProvider>
            </SecurityProvider>
          </ThemeProvider>
        </HelmetProvider>
      </PerformanceOptimizer>
    </ErrorBoundary>
  );
}

export default App;
