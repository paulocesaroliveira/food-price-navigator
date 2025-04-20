
import React from 'react'
import ReactDOM from 'react-dom/client'
import { 
  createBrowserRouter, 
  RouterProvider,
  createRoutesFromElements,
  Route,
  Navigate
} from 'react-router-dom'
import './index.css'

// Core app layout
import AppLayout from './components/AppLayout'

// Pages
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Products from './pages/Products'
import Recipes from './pages/Recipes'
import Ingredients from './pages/Ingredients'
import Packaging from './pages/Packaging'
import ProductionSchedule from './pages/ProductionSchedule'
import Customers from './pages/Customers'
import Pricing from './pages/Pricing'
import Settings from './pages/Settings'
import Website from './pages/Website'
import Index from './pages/Index'
import NotFound from './pages/NotFound'

// Public site
import PublicSitePage from './pages/PublicSite'

// Providers
import { Toaster } from '@/components/ui/toaster'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route index element={<Index />} />
      
      {/* Admin app routes */}
      <Route path="/" element={<AppLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="products" element={<Products />} />
        <Route path="recipes" element={<Recipes />} />
        <Route path="ingredients" element={<Ingredients />} />
        <Route path="packaging" element={<Packaging />} />
        <Route path="production-schedule" element={<ProductionSchedule />} />
        <Route path="customers" element={<Customers />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="settings" element={<Settings />} />
        <Route path="website" element={<Website />} />
      </Route>
      
      {/* Public website route */}
      <Route path="/site" element={<PublicSitePage />} />
      <Route path="/site/:storeId" element={<PublicSitePage />} />
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Route>
  )
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <Toaster />
  </React.StrictMode>
)
