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
                  <AppLayout>
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
                  </AppLayout>
                  
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
