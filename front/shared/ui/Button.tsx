import { Pressable, PressableProps, ViewStyle } from "react-native";
import { colors, radii, sizes } from "../../theme/design-tokens";
import { Text } from "./Text";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

interface Props extends PressableProps {
  title: string;
  style?: ViewStyle;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  glass?: boolean;
} ;

export function Button({ title, style, variant = "primary", size = "md", fullWidth, loading, glass, ...props }: Props) {
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
      {...props}
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
            ...props.disabled ? { opacity: 0.2 } : {},
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


