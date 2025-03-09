
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { RadioProvider } from "./contexts/RadioContext";
import Index from "./pages/Index";
import Stations from "./pages/Stations";
import AboutPage from "./pages/About";
import Login from "./pages/Login";
import GoLive from "./pages/GoLive";
import BookShow from "./pages/BookShow";
import AdminDashboard from "./pages/AdminDashboard";
import StationDetails from "./pages/StationDetails";
import NotFound from "./pages/NotFound";
import Mixes from "./pages/Mixes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <RadioProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/stations" element={<Stations />} />
              <Route path="/stations/:id" element={<StationDetails />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/go-live" element={<GoLive />} />
              <Route path="/book-show/:stationId" element={<BookShow />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/mixes" element={<Mixes />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </RadioProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
