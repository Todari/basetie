import { View } from "react-native";
import { BlurView } from "expo-blur";
import { radii, colors } from "../../theme/design-tokens";

type Props = { glass?: boolean; children: React.ReactNode; style?: any; padding?: number };

export function Card({ glass = true, children, style, padding = 16 }: Props) {
  if (glass) {
    return (
      <BlurView intensity={30} tint="light" style={{ borderRadius: radii.lg, overflow: "hidden" }}>
        <View style={[{ backgroundColor: colors.white, padding }, style]}>
          {children}
        </View>
      </BlurView>
    );
  }
  return (
    <View style={[{ backgroundColor: colors.white, borderRadius: radii.lg, padding }, style]}>
      {children}
    </View>
  );
}


