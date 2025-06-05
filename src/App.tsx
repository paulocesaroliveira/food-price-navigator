
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
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
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
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
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
