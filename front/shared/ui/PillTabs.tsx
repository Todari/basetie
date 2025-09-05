import { View, TouchableOpacity, ScrollView } from "react-native";
import { colors, radii, space } from "../../theme/design-tokens";
import { Text } from "./Text";

export function PillTabs({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 8 }}>
      {items.map((t) => {
        const active = t === value;
        return (
          <TouchableOpacity key={t} onPress={() => onChange(t)}>
            <View
              style={{
                paddingHorizontal: space.lg,
                paddingVertical: 8,
                borderRadius: radii.md,
                backgroundColor: active ? colors.primary800 : colors.gray100,
              }}
            >
              <Text weight="bold" color={active ? "inherit" : "secondary"}>{t}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}


