import { SafeAreaView, View, Text, FlatList, TouchableOpacity, Pressable } from "react-native";
import { Card } from "../../components/ui/Card";
import { router } from "expo-router";
import { AppBar } from "../../components/ui/AppBar";
import { SearchBar } from "../../components/ui/SearchBar";
import { Section } from "../../components/ui/Section";
import { PillTabs } from "../../components/ui/PillTabs";
import { colors } from "../../theme/design-tokens";

const MOCK = [
  { id: 1, game: "LG vs DOO", time: "2025-09-01 18:30", teamId: 1, seat: "S석 105열 12", price: 30000 },
  { id: 2, game: "KIA vs SAM", time: "2025-09-02 18:30", teamId: 3, seat: "1루 203열 7", price: 28000 },
];

export default function HomeTab() {
  return (
    <SafeAreaView>
      {/* <AppBar title="배스티" /> */}
      <View style={{ padding: 16, gap: 12, height: "100%" }}>
        <SearchBar placeholder="팀, 날짜, 구장 검색" />
        {/* <PillTabs items={["하루 특가", "셀러 특가", "할인 기획전"]} value={"하루 특가"} onChange={() => {}} /> */}
        <Section title="양도 중인 티켓">
          <Card>
            <Text>목데이터 프로모션 카드</Text>
          </Card>
        </Section>
        <FlatList
          data={MOCK}
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
        {/* Floating Button */}
        <Pressable
          onPress={() => router.push("/register")}
          style={{ position: "absolute", right: 16, bottom: 24, backgroundColor: colors.primary800, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 24, shadowColor: "#000", shadowOpacity: 0.2, shadowOffset: { width: 0, height: 8 }, shadowRadius: 8 }}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>티켓 등록</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}


