import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { AppShell } from "../components/layout/AppShell";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, needsOnboarding } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    // Show a minimal loading state while Supabase checks the session
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-surface dark:bg-surface-dark">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-neutral dark:bg-white animate-blink-block-1" />
          <div className="w-3 h-3 bg-neutral dark:bg-white animate-blink-block-2" />
          <div className="w-3 h-3 bg-neutral dark:bg-white animate-blink-block-3" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login but save the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // (Onboarding redirection removed per user request)

  return <AppShell>{children}</AppShell>;
};
