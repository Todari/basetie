import React from "react";
import { Text as RNText, TextProps as RNTextProps } from "react-native";
import { colors, typography } from "../../theme/design-tokens";

export type TextVariant = "display" | "title" | "body" | "caption";
export type TextColor = "default" | "primary" | "secondary" | "inherit";

export type AppTextProps = RNTextProps & {
  variant?: TextVariant;
  color?: TextColor;
  weight?: "normal" | "medium" | "semibold" | "bold";
};

export function Text({
  variant = "body",
  color = "default",
  weight,
  style,
  children,
  ...rest
}: AppTextProps) {
  const base = typography[variant];
  const colorValue =
    color === "primary"
      ? colors.primary800
      : color === "secondary"
      ? colors.gray600
      : color === "inherit"
      ? undefined
      : colors.gray800;

  return (
    <RNText
      {...rest}
      style={[
        { color: colorValue },
        base,
        weight ? { fontWeight: mapWeight(weight) } : null,
        style,
      ]}
    >
      {children}
    </RNText>
  );
}

function mapWeight(w: NonNullable<AppTextProps["weight"]>) {
  switch (w) {
    case "normal":
      return "400" as const;
    case "medium":
      return "500" as const;
    case "semibold":
      return "600" as const;
    case "bold":
      return "700" as const;
  }
}


