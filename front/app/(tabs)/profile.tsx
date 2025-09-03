import { SafeAreaView, View, Text } from "react-native";
import { Card } from "../../components/ui/Card";

const MY_LISTINGS = [
  { id: 10, status: "listed", title: "LG vs DOO - S석" },
  { id: 11, status: "completed", title: "KIA vs SAM - 1루" },
];
const MY_DEALS = [
  { id: 201, status: "accepted", title: "삼성전 요청" },
];

export default function ProfileTab() {
  return (
    <SafeAreaView>
      <View style={{ padding: 16, gap: 12 }}>
        <Card>
          <Text style={{ fontSize: 18, fontWeight: "700" }}>내 등록 티켓</Text>
          {MY_LISTINGS.map((l) => (
            <Text key={l.id}>#{l.id} [{l.status}] {l.title}</Text>
          ))}
        </Card>
        <Card>
          <Text style={{ fontSize: 18, fontWeight: "700" }}>양도 내역</Text>
          {MY_DEALS.map((d) => (
            <Text key={d.id}>#{d.id} [{d.status}] {d.title}</Text>
          ))}
        </Card>
      </View>
    </SafeAreaView>
  );
}


