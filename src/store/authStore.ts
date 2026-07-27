import { create } from "zustand";

interface AuthState {
  user: {
    id: string;
    email: string;
    displayName?: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsOnboarding: boolean;
  setUser: (user: AuthState["user"]) => void;
  setLoading: (loading: boolean) => void;
  setNeedsOnboarding: (needs: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  needsOnboarding: false,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setNeedsOnboarding: (needsOnboarding) => set({ needsOnboarding }),
  logout: () => set({ user: null, isAuthenticated: false, isLoading: false, needsOnboarding: false }),
}));
