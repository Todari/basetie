import { SafeAreaView, View, Text, FlatList, TouchableOpacity, Pressable, ActivityIndicator } from "react-native";
import { Card } from "../../components/ui/Card";
import { router } from "expo-router";
import { AppBar } from "../../components/ui/AppBar";
import { SearchBar } from "../../components/ui/SearchBar";
import { Section } from "../../components/ui/Section";
import { PillTabs } from "../../components/ui/PillTabs";
import { colors } from "../../theme/design-tokens";
import { Button } from "../../components/ui/Button";
import { useListings } from "../../hooks/queries/useListings";

export default function HomeTab() {
  const { data: listingsData, isLoading, error, refetch } = useListings();

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary500} />
        <Text style={{ marginTop: 16, color: colors.gray600 }}>티켓 목록을 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <Text style={{ color: colors.danger, textAlign: "center", marginBottom: 16 }}>
          티켓 목록을 불러오는데 실패했습니다.
        </Text>
        <Button title="다시 시도" onPress={() => refetch()} />
      </SafeAreaView>
    );
  }

  const listings = listingsData?.listings || [];

  return (
    <SafeAreaView>
      {/* <AppBar title="배스티" /> */}
      <View style={{ padding: 16, gap: 12, height: "100%" }}>
        <SearchBar placeholder="팀, 날짜, 구장 검색" />
        {/* <PillTabs items={["하루 특가", "셀러 특가", "할인 기획전"]} value={"하루 특가"} onChange={() => {}} /> */}
        <Section title="양도 중인 티켓">
          <Card>
            <Text>프로모션 카드</Text>
          </Card>
        </Section>
        {listings.length === 0 ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: colors.gray500, textAlign: "center" }}>
              현재 양도 중인 티켓이 없습니다.
            </Text>
          </View>
        ) : (
          <FlatList
            data={listings}
            keyExtractor={(i) => String(i.id)}
            contentContainerStyle={{ gap: 12 }}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => router.push(`/listing/${item.id}`)}>
                <Card style={{ gap: 8 }}>
                  <Text style={{ fontWeight: "700" }}>{item.game}</Text>
                  <Text>{item.time}</Text>
                  <Text>{item.seat}</Text>
                  <Text style={{ fontWeight: "700" }}>{item.price.toLocaleString()}원</Text>
                </Card>
              </TouchableOpacity>
            )}
          />
        )}
        {/* Floating Button */}
        <Button
          onPress={() => router.push("/register")}
          title="티켓 등록"
          variant="primary"
          style={{ position: "absolute", right: 16, bottom: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 8 }}
        />
      </View>
    </SafeAreaView>
  );
}


