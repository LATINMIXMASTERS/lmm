
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/auth/AuthContext";
import { RadioProvider } from "@/contexts/radio/RadioProvider";
import { TrackProvider } from "@/contexts/track/TrackProvider";
import { ThemeProvider } from "@/lib/ThemeProvider";
import AppRoutes from "./AppRoutes";
import { Toaster } from "@/components/ui/toaster";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <ThemeProvider defaultTheme="light" storageKey="latinmixmasters-theme">
            <AuthProvider>
              <RadioProvider>
                <TrackProvider>
                  <AppRoutes />
                  <Toaster />
                </TrackProvider>
              </RadioProvider>
            </AuthProvider>
          </ThemeProvider>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
