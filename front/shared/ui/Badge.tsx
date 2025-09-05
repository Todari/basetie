import { View, Text } from "react-native";
import { colors, radii, space } from "../../theme/design-tokens";

type Props = { children: React.ReactNode; style?: any };

export function Badge({ children, style }: Props) {
  return (
    <View style={[{ backgroundColor: "#F3F4F680", paddingHorizontal: space.md, paddingVertical: 6, borderRadius: radii.xl, alignItems: "center", justifyContent: "center" }, style]}>
      <Text style={{ color: colors.gray800 }}>{children}</Text>
    </View>
  );
}


