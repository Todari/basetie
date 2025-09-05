import { Pressable, ViewStyle } from "react-native";
import { colors, radii, sizes } from "../../theme/design-tokens";
import { Text } from "./Text";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

type Props = {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  glass?: boolean;
};

export function Button({ title, onPress, style, variant = "primary", size = "md", fullWidth, loading, glass }: Props) {
  const height = sizes[size];
  const stylesByVariant: Record<Variant, ViewStyle> = {
    primary: { backgroundColor: colors.primary800, borderWidth: 0, },
    secondary: { backgroundColor: colors.gray200, borderWidth: 0 },
    ghost: { backgroundColor: "transparent", borderWidth: 0 },
    outline: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.primary800 },
  } as const;
  const isGlass = glass === true;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          borderRadius: radii.md,
          paddingHorizontal: 16,
          height,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.85 : 1,
          ...(isGlass
            ? ({ backgroundColor: "transparent", borderWidth: 1, borderColor: colors.primary800 } as ViewStyle)
            : (stylesByVariant[variant] as ViewStyle)),
          width: fullWidth ? "100%" : undefined,
        },
        style,
      ]}
    >
      <Text
        variant={size === "lg" ? "title" : "body"}
        weight="bold"
        color={isGlass ? "primary" : variant === "primary" ? "white" : variant === "secondary" ? "inherit" : "primary"}
      >
        {title}
      </Text>
    </Pressable>
  );
}


