import React, { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";
import api from "../lib/api";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setUser, setLoading, setNeedsOnboarding } = useAuthStore();

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncUser(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setNeedsOnboarding(false);
        return;
      }

      if (session?.user) {
        syncUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync Supabase user to our backend database
  const syncUser = async (authUser: any) => {
    const displayName =
      authUser.user_metadata?.display_name ||
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      "";

    // Determine if this is a Google/OAuth user (no password identity)
    const isOAuthUser = authUser.app_metadata?.provider !== "email";

    try {
      // Upsert user in backend
      const { data } = await api.post("/api/users/sync", {
        id: authUser.id,
        email: authUser.email,
        displayName: displayName,
      });

      const userFromBackend = data.data;

      setUser({
        id: userFromBackend.id,
        email: userFromBackend.email,
        displayName: userFromBackend.displayName,
      });

      // (Onboarding redirection removed per user request)
      setNeedsOnboarding(false);
    } catch (error) {
      console.error("Failed to sync user to backend:", error);
      // Fallback — store basic info so user can still use the app
      setUser({
        id: authUser.id,
        email: authUser.email || "",
        displayName: displayName,
      });

      // (Onboarding redirection removed per user request)
      setNeedsOnboarding(false);
    } finally {
      setLoading(false);
    }
  };

  return <>{children}</>;
};
