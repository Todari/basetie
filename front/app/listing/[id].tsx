import { SafeAreaView, View, Text, ViewStyle, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Card } from "../../shared/ui/Card";
import { colors, radii } from "../../theme/design-tokens";
import { AppBar } from "../../shared/ui/AppBar";
import { useListing } from "../../hooks/queries/useListings";

export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const listingId = id ? parseInt(id, 10) : 0;
  const { data: listingData, isLoading, error } = useListing(listingId);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary500} />
        <Text style={{ marginTop: 16, color: colors.gray600 }}>티켓 정보를 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  if (error || !listingData) {
    return (
      <SafeAreaView>
        <AppBar canGoBack={router.canGoBack()} onBack={() => router.back()} title="" />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
          <Text style={{ color: colors.danger, textAlign: "center" }}>
            티켓 정보를 불러오는데 실패했습니다.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const listing = listingData.listing;

  return (
    <SafeAreaView>
      <AppBar canGoBack={router.canGoBack()} onBack={() => router.back()} title="" />
      <View style={{ padding: 16, gap: 12, paddingBottom: 92 }}>
        <Card>
          <Text style={{ fontSize: 20, fontWeight: "700" }}>{listing.game}</Text>
          <Text style={{ marginTop: 8, color: colors.gray600 }}>{listing.time}</Text>
          <Text style={{ marginTop: 4, color: colors.gray600 }}>{listing.seat}</Text>
          <Text style={{ marginTop: 8, fontSize: 18, fontWeight: "700", color: colors.primary800 }}>
            {listing.price.toLocaleString()}원
          </Text>
          {listing.description && (
            <Text style={{ marginTop: 12, color: colors.gray700 }}>{listing.description}</Text>
          )}
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


