export const colors = {
  primary: "#1A56A1",
  primaryHover: "#174B8E",
  primaryPress: "#123E77",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",
  white: "#FFFFFF",
  black: "#000000",
  success: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
} as const;

export const radii = { sm: 12, md: 16, lg: 20, xl: 24 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const sizes = { sm: 32, md: 44, lg: 56 } as const;
export const z = { base: 0, overlay: 1000, modal: 2000 } as const;

export const theme = {
  light: {
    bg: "#FFFFFF90",
    fg: colors.gray900,
    card: "#FFFFFFB3",
    primary: colors.primary,
    muted: "#F3F4F680",
  },
  dark: {
    bg: "#0B1220CC",
    fg: colors.gray50,
    card: "#0F172ABD",
    primary: colors.primary,
    muted: "#11182780",
  },
};


