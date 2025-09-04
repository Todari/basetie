import { SafeAreaView, View, Text, TextInput, Button as RNButton, FlatList, TouchableOpacity } from "react-native";
import { Card } from "../../components/ui/Card";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../shared/api/client";
import { useAuth } from "../../shared/store/auth";

type GameRow = {
  id: number;
  game_date: string;
  start_time_local?: string;
  stadium: string;
  home_team_id: number;
  away_team_id: number;
  home_team_name: string;
  away_team_name: string;
};

export default function RegisterTab() {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<string>("");
  const [games, setGames] = useState<GameRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ game_id: "", team_id: "", section: "", row: "", seat_label: "", price: "", note: "" });
  const access = useAuth((s) => s.access);
  return (
    <SafeAreaView>
      <View style={{ padding: 16, gap: 12 }}>
        <Card>
          <Text style={{ fontSize: 18, fontWeight: "700" }}>티켓 등록 (Step {step}/3)</Text>
          {step === 1 && (
            <View style={{ gap: 8 }}>
              <Text>날짜 선택 (YYYY-MM-DD)</Text>
              <TextInput placeholder="예: 2025-09-05" value={date} onChangeText={setDate} style={{ borderBottomWidth: 1, padding: 8 }} />
              <RNButton title="해당 날짜 경기 보기" onPress={async () => {
                if (!date) return;
                setLoading(true);
                try {
                  const res = await api<{ games: GameRow[] }>(`/v1/games?date=${date}`);
                  setGames(res.games || []);
                  setStep(2);
                } catch (e) {
                  console.warn(e);
                } finally {
                  setLoading(false);
                }
              }} />
              {loading && <Text>불러오는 중...</Text>}
            </View>
          )}
          {step === 2 && (
            <View style={{ gap: 8 }}>
              <Text>경기 선택</Text>
              <FlatList
                data={games}
                keyExtractor={(g) => String(g.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => {
                    setForm({ ...form, game_id: String(item.id), team_id: String(item.home_team_id) });
                    setStep(3);
                  }}>
                    <Card>
                      <Text>{item.start_time_local || "-"}  {item.away_team_name} @ {item.home_team_name}</Text>
                      <Text style={{ color: "#555" }}>{item.stadium}</Text>
                    </Card>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
          {step === 3 && (
            <View style={{ gap: 8 }}>
              <Text>가격/메모</Text>
              <Text>좌석 정보</Text>
              <TextInput placeholder="section" value={form.section} onChangeText={(v) => setForm({ ...form, section: v })} style={{ borderBottomWidth: 1, padding: 8 }} />
              <TextInput placeholder="row" value={form.row} onChangeText={(v) => setForm({ ...form, row: v })} style={{ borderBottomWidth: 1, padding: 8 }} />
              <TextInput placeholder="seat_label" value={form.seat_label} onChangeText={(v) => setForm({ ...form, seat_label: v })} style={{ borderBottomWidth: 1, padding: 8 }} />
              <TextInput placeholder="price" value={form.price} onChangeText={(v) => setForm({ ...form, price: v })} style={{ borderBottomWidth: 1, padding: 8 }} />
              <TextInput placeholder="note" value={form.note} onChangeText={(v) => setForm({ ...form, note: v })} style={{ borderBottomWidth: 1, padding: 8 }} />
            </View>
          )}
          <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            {step > 1 && <RNButton title="이전" onPress={() => setStep((s) => s - 1)} />}
            {step < 3 ? (
              <RNButton title="다음" onPress={() => setStep((s) => s + 1)} />
            ) : (
              <RNButton title="등록" onPress={async () => {
                try {
                  const body = {
                    game_id: Number(form.game_id),
                    team_id: Number(form.team_id),
                    section: form.section,
                    row: form.row,
                    seat_label: form.seat_label,
                    price: Number(form.price),
                    note: form.note || undefined,
                  };
                  await api<{ listing: any }>(`/v1/listings`, { method: "POST", body, token: access });
                  setStep(1);
                  setDate("");
                  setGames([]);
                  setForm({ game_id: "", team_id: "", section: "", row: "", seat_label: "", price: "", note: "" });
                  alert("등록 완료");
                } catch (e: any) {
                  alert(e.message || "등록 실패");
                }
              }} />
            )}
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}


