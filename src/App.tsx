
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { SecurityProvider } from "@/components/SecurityProvider";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
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
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </SecurityProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
