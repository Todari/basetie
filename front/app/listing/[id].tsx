import { SafeAreaView, View, Text, ViewStyle } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Card } from "../../components/ui/Card";
import { colors, radii } from "../../theme/design-tokens";
import { AppBar } from "../../components/ui/AppBar";

export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <SafeAreaView>
      <AppBar canGoBack={router.canGoBack()} onBack={() => router.back()} title="상세" />
      <View style={{ padding: 16, gap: 12, paddingBottom: 92 }}>
        <Card>
          <Text style={{ fontSize: 20, fontWeight: "700" }}>리스트 상세 #{id}</Text>
          <Text>목데이터 상세 설명...</Text>
        </Card>
      </View>
      <View style={bottomBar}>
        <View style={{ flex: 1, backgroundColor: colors.gray100, borderRadius: radii.lg, padding: 14, alignItems: "center" }}>
          <Text>문의하기</Text>
        </View>
        <View style={{ width: 12 }} />
        <View style={{ flex: 1, backgroundColor: colors.primary800, borderRadius: radii.lg, padding: 14, alignItems: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>구매하기</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const bottomBar: ViewStyle = {
  position: "absolute",
  left: 16,
  right: 16,
  bottom: 16,
  flexDirection: "row",
};


