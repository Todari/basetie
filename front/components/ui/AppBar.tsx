import { View, Text, Pressable } from "react-native";
import { CaretLeft } from "phosphor-react-native";
import { typography, colors } from "../../theme/design-tokens";

export function AppBar({
  title,
  subtitle,
  canGoBack,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  canGoBack?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
      <View style={{ paddingHorizontal: 24, paddingVertical: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {canGoBack ? (
            <Pressable onPress={onBack} hitSlop={8} accessibilityRole="button" accessibilityLabel="뒤로가기">
              <CaretLeft size={24} color={colors.gray800} weight="bold" />
            </Pressable>
          ) : null}
          <View>
            <Text style={[typography.display, { color: colors.gray800,}]}>{title}</Text>
            {subtitle ? (
              <Text style={{ fontSize: 12, color: colors.gray600, marginTop: 2 }}>{subtitle}</Text>
            ) : null}
          </View>
        </View>
        <View>{right}</View>
      </View>
  );
}


