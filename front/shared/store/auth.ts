import { create } from "zustand";

type AuthState = {
  access?: string;
  refresh?: string;
  setTokens: (t: { access: string; refresh: string }) => void;
  clear: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  access: undefined,
  refresh: undefined,
  setTokens: (t) => set(t),
  clear: () => set({ access: undefined, refresh: undefined }),
}));


