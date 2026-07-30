import React, { useState, useCallback, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "./AuthProvider";
import { ProtectedRoute } from "./ProtectedRoute";
import { SplashScreen } from "../components/loading/SplashScreen";
import { ChatWidget } from "../components/chatbot/ChatWidget";
import { GlobalDecorations } from "../components/layout/GlobalDecorations";
import "../lib/i18n";

// Lazy-loaded pages
const LandingPage = React.lazy(() => import("../pages/LandingPage"));
const LoginPage = React.lazy(() => import("../pages/LoginPage"));
const RegisterPage = React.lazy(() => import("../pages/RegisterPage"));
const DashboardPage = React.lazy(() => import("../pages/DashboardPage"));
const PracticeSetupPage = React.lazy(() => import("../pages/PracticeSetupPage"));
const PracticeRoomPage = React.lazy(() => import("../pages/PracticeRoomPage"));
const ScorecardPage = React.lazy(() => import("../pages/ScorecardPage"));
const ProgressAnalyticsPage = React.lazy(() => import("../pages/ProgressAnalyticsPage"));
const LearningModulesPage = React.lazy(() => import("../pages/LearningModulesPage"));
const ScriptTemplatesPage = React.lazy(() => import("../pages/ScriptTemplatesPage"));
const ProfilePage = React.lazy(() => import("../pages/ProfilePage"));
const OnboardingPage = React.lazy(() => import("../pages/OnboardingPage"));
const ScriptWriterPage = React.lazy(() => import("../pages/ScriptWriterPage"));

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds — data refreshes more frequently
      retry: 2,
      refetchOnWindowFocus: true, // Refresh data when user returns to tab
    },
  },
});

// Simple page loading fallback (blocky skeleton)
const PageLoader = () => (
  <div className="min-h-[100dvh] flex items-center justify-center bg-transparent">
    <div className="flex gap-2">
      <div className="w-3 h-3 bg-neutral dark:bg-white animate-blink-block-1" />
      <div className="w-3 h-3 bg-neutral dark:bg-white animate-blink-block-2" />
      <div className="w-3 h-3 bg-neutral dark:bg-white animate-blink-block-3" />
    </div>
  </div>
);

function App() {
  const [splashDone, setSplashDone] = useState(false);

  const handleSplashComplete = useCallback(() => {
    setSplashDone(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}

          <AuthProvider>
            <div className="min-h-[100dvh] bg-surface dark:bg-surface-dark relative flex flex-col w-full">
              <GlobalDecorations />
              <div className="relative z-10 flex-grow w-full flex flex-col">
                <ChatWidget />
                <AnimatePresence mode="wait">
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />

                      {/* Protected Routes */}
                      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                      <Route path="/practice/setup" element={<ProtectedRoute><PracticeSetupPage /></ProtectedRoute>} />
                      <Route path="/practice/room" element={<ProtectedRoute><PracticeRoomPage /></ProtectedRoute>} />
                      <Route path="/scorecard/:id" element={<ProtectedRoute><ScorecardPage /></ProtectedRoute>} />
                      <Route path="/progress" element={<ProtectedRoute><ProgressAnalyticsPage /></ProtectedRoute>} />
                      <Route path="/learning" element={<ProtectedRoute><LearningModulesPage /></ProtectedRoute>} />
                      <Route path="/templates" element={<ProtectedRoute><ScriptTemplatesPage /></ProtectedRoute>} />
                      <Route path="/script-writer" element={<ProtectedRoute><ScriptWriterPage /></ProtectedRoute>} />
                      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
                    </Routes>
                  </Suspense>
                </AnimatePresence>
              </div>
            </div>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
