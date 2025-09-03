import { View, TextInput } from "react-native";
import { radii, colors } from "../../theme/design-tokens";
import { MagnifyingGlass } from "phosphor-react-native";

export function SearchBar({ placeholder, onChangeText }: { placeholder?: string; onChangeText?: (t: string) => void }) {
  return (
    <View style={{ backgroundColor: colors.gray100, borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
      <MagnifyingGlass size={18} color={colors.gray500} weight="regular" />
      <TextInput placeholder={placeholder} onChangeText={onChangeText} style={{ fontSize: 16, flex: 1 }} />
    </View>
  );
}


