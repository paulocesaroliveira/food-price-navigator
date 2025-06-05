
import React from 'react'
import ReactDOM from 'react-dom/client'
import { 
  createBrowserRouter, 
  RouterProvider,
  createRoutesFromElements,
  Route
} from 'react-router-dom'
import './index.css'

// Core app layout
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Products from './pages/Products'
import Recipes from './pages/Recipes'
import Ingredients from './pages/Ingredients'
import Packaging from './pages/Packaging'
import Customers from './pages/Customers'
import Pricing from './pages/Pricing'
import Settings from './pages/Settings'
import Sales from './pages/Sales'
import Index from './pages/Index'
import Auth from './pages/Auth'
import NotFound from './pages/NotFound'
import AccountsPayable from './pages/AccountsPayable'
import Resale from './pages/Resale'
import Relatorios from './pages/Relatorios'
import CostUpdate from './pages/CostUpdate'
import FluxoCaixa from './pages/FluxoCaixa'

// Providers
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create the query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route index element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      
      {/* Admin app routes - protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="ingredients" element={<Ingredients />} />
          <Route path="packaging" element={<Packaging />} />
          <Route path="customers" element={<Customers />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="settings" element={<Settings />} />
          <Route path="sales" element={<Sales />} />
          <Route path="accounts-payable" element={<AccountsPayable />} />
          <Route path="resale" element={<Resale />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="fluxo-caixa" element={<FluxoCaixa />} />
          <Route path="cost-update" element={<CostUpdate />} />
        </Route>
      </Route>
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Route>
  )
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
