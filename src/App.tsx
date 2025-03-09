
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { RadioProvider } from "./contexts/RadioContext";
import { TrackProvider } from "./contexts/TrackContext";
import Index from "./pages/Index";
import Stations from "./pages/Stations";
import AboutPage from "./pages/About";
import Login from "./pages/Login";
import BookShow from "./pages/BookShow";
import AdminDashboard from "./pages/AdminDashboard";
import StationDetails from "./pages/StationDetails";
import NotFound from "./pages/NotFound";
import Mixes from "./pages/Mixes";
import UploadTrack from "./pages/UploadTrack";
import ManageGenres from "./pages/ManageGenres";
import UserProfile from "./pages/UserProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <AuthProvider>
          <RadioProvider>
            <TrackProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/stations" element={<Stations />} />
                <Route path="/stations/:id" element={<StationDetails />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/book-show/:stationId" element={<BookShow />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/mixes" element={<Mixes />} />
                <Route path="/upload-track" element={<UploadTrack />} />
                <Route path="/manage-genres" element={<ManageGenres />} />
                <Route path="/user/:userId" element={<UserProfile />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TrackProvider>
          </RadioProvider>
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
