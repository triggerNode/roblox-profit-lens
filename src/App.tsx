import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Support from "./pages/Support";
import AuthLayout from "./components/AuthLayout";
import NotFound from "./pages/NotFound";
import { Pricing } from "./pages/Pricing";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<AuthLayout type="signup" />} />
          <Route path="/login" element={<AuthLayout type="login" />} />
          <Route path="/pricing" element={
            <ProtectedRoute>
              <Pricing />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute requiresSubscription>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute requiresSubscription>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/support" element={
            <ProtectedRoute requiresSubscription>
              <Support />
            </ProtectedRoute>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;