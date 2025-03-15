
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
import EditTrack from "./pages/EditTrack";
import ManageGenres from "./pages/ManageGenres";
import UserProfile from "./pages/UserProfile";
import HostProfile from "./pages/HostProfile";
import HostDashboard from "./pages/HostDashboard";
import DJs from "./pages/DJs";
import GoLive from "./pages/GoLive";

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
                <Route path="/edit-track/:trackId" element={<EditTrack />} />
                <Route path="/manage-genres" element={<ManageGenres />} />
                <Route path="/user/:userId" element={<UserProfile />} />
                <Route path="/host/:userId" element={<HostProfile />} />
                <Route path="/host-dashboard" element={<HostDashboard />} />
                <Route path="/djs" element={<DJs />} />
                <Route path="/go-live" element={<GoLive />} />
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
