
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Stations from "@/pages/Stations";
import StationDetails from "@/pages/StationDetails";
import Mixes from "@/pages/Mixes";
import DJs from "@/pages/DJs";
import UserProfile from "@/pages/UserProfile";
import HostProfile from "@/pages/HostProfile";
import UploadTrack from "@/pages/UploadTrack";
import EditTrack from "@/pages/EditTrack";
import ManageGenres from "@/pages/ManageGenres";
import BookShow from "@/pages/BookShow";
import GoLive from "@/pages/GoLive";
import HostDashboard from "@/pages/HostDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import CookiePolicy from "@/pages/CookiePolicy";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/stations" element={<Stations />} />
      <Route path="/stations/:id" element={<StationDetails />} />
      <Route path="/mixes" element={<Mixes />} />
      <Route path="/djs" element={<DJs />} />
      <Route path="/profile/:userId" element={<UserProfile />} />
      <Route path="/host/:hostId" element={<HostProfile />} />
      <Route path="/user/:userId" element={<UserProfile />} />
      
      {/* Upload paths */}
      <Route path="/upload" element={<UploadTrack />} />
      <Route path="/upload-track" element={<UploadTrack />} />
      <Route path="/uploads" element={<Navigate to="/upload" replace />} />
      
      {/* Edit paths */}
      <Route path="/edit/:trackId" element={<EditTrack />} />
      <Route path="/edit-track/:trackId" element={<EditTrack />} />
      
      {/* Genre management */}
      <Route path="/manage-genres" element={<ManageGenres />} />
      <Route path="/genres" element={<ManageGenres />} />
      
      {/* Booking and station routes */}
      <Route path="/book-show/:stationId?" element={<BookShow />} />
      <Route path="/book/:stationId?" element={<BookShow />} />
      <Route path="/go-live/:stationId?" element={<GoLive />} />
      <Route path="/live/:stationId?" element={<GoLive />} />
      
      {/* Dashboard routes */}
      <Route path="/dashboard" element={<HostDashboard />} />
      <Route path="/host-dashboard" element={<HostDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      
      {/* Legal pages with alternate paths */}
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/cookies" element={<CookiePolicy />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
