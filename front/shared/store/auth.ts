/**
 * @deprecated Use AuthContext instead
 * This file is kept for backward compatibility during migration
 */

import { create } from "zustand";

type AuthState = {
  access?: string;
  refresh?: string;
  setTokens: (t: { access: string; refresh: string }) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  access: undefined,
  refresh: undefined,
  setTokens: (t) => set(t),
  clear: () => set({ access: undefined, refresh: undefined }),
}));

// Backward compatibility
export const useAuth = useAuthStore;


