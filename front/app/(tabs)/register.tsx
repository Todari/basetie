import { SafeAreaView, View, Text, TextInput, Button as RNButton } from "react-native";
import { Card } from "../../components/ui/Card";
import { useState } from "react";

export default function RegisterTab() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ game_id: "", team_id: "", section: "", row: "", seat_label: "", price: "", note: "" });
  return (
    <SafeAreaView>
      <View style={{ padding: 16, gap: 12 }}>
        <Card>
          <Text style={{ fontSize: 18, fontWeight: "700" }}>티켓 등록 (Step {step}/3)</Text>
          {step === 1 && (
            <View style={{ gap: 8 }}>
              <Text>경기 선택</Text>
              <TextInput placeholder="game_id" value={form.game_id} onChangeText={(v) => setForm({ ...form, game_id: v })} style={{ borderBottomWidth: 1, padding: 8 }} />
              <TextInput placeholder="team_id" value={form.team_id} onChangeText={(v) => setForm({ ...form, team_id: v })} style={{ borderBottomWidth: 1, padding: 8 }} />
            </View>
          )}
          {step === 2 && (
            <View style={{ gap: 8 }}>
              <Text>좌석 정보</Text>
              <TextInput placeholder="section" value={form.section} onChangeText={(v) => setForm({ ...form, section: v })} style={{ borderBottomWidth: 1, padding: 8 }} />
              <TextInput placeholder="row" value={form.row} onChangeText={(v) => setForm({ ...form, row: v })} style={{ borderBottomWidth: 1, padding: 8 }} />
              <TextInput placeholder="seat_label" value={form.seat_label} onChangeText={(v) => setForm({ ...form, seat_label: v })} style={{ borderBottomWidth: 1, padding: 8 }} />
            </View>
          )}
          {step === 3 && (
            <View style={{ gap: 8 }}>
              <Text>가격/메모</Text>
              <TextInput placeholder="price" value={form.price} onChangeText={(v) => setForm({ ...form, price: v })} style={{ borderBottomWidth: 1, padding: 8 }} />
              <TextInput placeholder="note" value={form.note} onChangeText={(v) => setForm({ ...form, note: v })} style={{ borderBottomWidth: 1, padding: 8 }} />
            </View>
          )}
          <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            {step > 1 && <RNButton title="이전" onPress={() => setStep((s) => s - 1)} />}
            {step < 3 ? (
              <RNButton title="다음" onPress={() => setStep((s) => s + 1)} />
            ) : (
              <RNButton title="등록(목)" onPress={() => { /* TODO: API 연동 */ }} />
            )}
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}


