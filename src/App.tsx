import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Analysis from "./pages/Analysis";
import Results from "./pages/Results";
import History from "./pages/History";
import JobMatching from "./pages/JobMatching";
import Pricing from "./pages/Pricing";
import Enterprise from "./pages/Enterprise";
import Privacy from "./pages/Privacy";
import MyData from "./pages/MyData";
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
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analisis" element={<Analysis />} />
              <Route path="/resultados" element={<Results />} />
              <Route path="/historial" element={<History />} />
              <Route path="/ofertas" element={<JobMatching />} />
              <Route path="/precios" element={<Pricing />} />
              <Route path="/empresa" element={<Enterprise />} />
              <Route path="/privacidad" element={<Privacy />} />
              <Route path="/mis-datos" element={<MyData />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
