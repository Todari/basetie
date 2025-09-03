import { View, Text } from "react-native";
import { typography, colors } from "../../theme/design-tokens";

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={[typography.title, { color: colors.gray800 , paddingHorizontal: 8}]}>{title}</Text>
      {children}
    </View>
  );
}


