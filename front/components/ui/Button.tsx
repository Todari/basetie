import { Pressable, Text, ViewStyle } from "react-native";
import { colors, radii } from "../../theme/design-tokens";

type Props = {
  glass?: boolean;
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
};

export function Button({ glass, title, onPress, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{
        borderRadius: radii.md,
        backgroundColor: glass ? "transparent" : colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: glass ? 1 : 0,
        borderColor: colors.primary,
        opacity: pressed ? 0.85 : 1,
      }, style]}
    >
      <Text style={{ color: glass ? colors.primary : colors.white, fontWeight: "600" }}>{title}</Text>
    </Pressable>
  );
}


