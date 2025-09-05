import React, { createContext, useContext, useMemo } from "react";
import { theme } from "../../theme/design-tokens";

type Mode = "light" | "dark";
type Tokens = (typeof theme)[Mode];

const ThemeContext = createContext<{ mode: Mode; t: Tokens }>({ mode: "light", t: theme.light });

export function ThemeProvider({ mode = "light", children }: { mode?: Mode; children: React.ReactNode }) {
  const value = useMemo(() => ({ mode, t: theme[mode] }), [mode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}


