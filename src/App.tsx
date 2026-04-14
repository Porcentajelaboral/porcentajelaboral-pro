import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Analysis from "./pages/Analysis";
import Results from "./pages/Results";
import History from "./pages/History";
import JobMatching from "./pages/JobMatching";
import Pricing from "./pages/Pricing";
import Enterprise from "./pages/Enterprise";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import MyData from "./pages/MyData";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/recuperar-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/precios" element={<Pricing />} />
              <Route path="/privacidad" element={<Privacy />} />
              <Route path="/terminos" element={<Terms />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/analisis" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
              <Route path="/resultados" element={<ProtectedRoute><Results /></ProtectedRoute>} />
              <Route path="/historial" element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="/ofertas" element={<ProtectedRoute><JobMatching /></ProtectedRoute>} />
              <Route path="/empresa" element={<ProtectedRoute><Enterprise /></ProtectedRoute>} />
              <Route path="/mis-datos" element={<ProtectedRoute><MyData /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
