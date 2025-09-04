export const colors = {
  primary50: "#e9ecff",
  primary100 : "#c8ceff",
  primary200: "#a1afff",
  primary300: "#768eff",
  primary400: "#5073ff",
  primary500: "#1b57fd",
  primary600: "#134ef1",
  primary700: "#0043e4",
  primary800: "#0037d9",
  primary900: "#001ec9",
  gray50: "#F3F4F6",
  gray100: "#E3E3E7",
  gray200: "#D9DADC",
  gray300: "#C7C8CA",
  gray400: "#9FA0A2",
  gray500: "#77787A",
  gray600: "#4F5052",
  gray700: "#36383D",
  gray800: "#27282A",
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
    bg: colors.white,
    fg: colors.gray800,
    card: colors.gray50,
    primary: colors.primary800,
    muted: colors.gray300,
    divider: colors.gray200,
  },
  dark: {
    bg: colors.gray800,
    fg: colors.gray50,
    card: colors.gray800,
    primary: colors.primary800,
    muted: colors.gray600,
    divider: colors.gray700,
  },
};

export const typography = {
  display: { fontSize: 24, lineHeight: 36, fontWeight: "800" as const },
  title: { fontSize: 20, lineHeight: 30, fontWeight: "700" as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: "500" as const },
  caption: { fontSize: 12, lineHeight: 18, fontWeight: "500" as const },
};

export const shadow = {
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  } as const,
};


