import { SafeAreaView, View, FlatList } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../shared/api/client";
import { useAuth } from "../../shared/store/auth";
import { router } from "expo-router";
import { AppBar } from "../../components/ui/AppBar";
import { colors } from "../../theme/design-tokens";
import { Text } from "../../components/ui/Text";
import { Button } from "../../components/ui/Button";

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
  const now = new Date();
  const defaultYear = now.getFullYear();
  const [year] = useState<number>(defaultYear);
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [day, setDay] = useState<number>(now.getDate());
  const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const [games, setGames] = useState<GameRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ game_id: "", team_id: "", section: "", row: "", seat_label: "", price: "", note: "" });
  const access = useAuth((s) => s.access);
  const itemHeight = 44;
  const wheelHeight = itemHeight * 5; // 항상 5개 아이템이 보이도록 고정
  const overlayHPad = 16; // 강조 바 좌우 동일 패딩(두 컬럼 동일 길이)

  // Wheel picker (center selection, snap)
  const Wheel = ({ data, value, onChange }: { data: number[]; value: number; onChange: (v: number) => void }) => {
    const initialIndex = Math.max(0, data.findIndex((d) => d === value));
    return (
      <View style={{ position: "relative", height: wheelHeight }}>
        <FlatList
          data={data}
          keyExtractor={(v) => String(v)}
          initialScrollIndex={initialIndex === -1 ? 0 : initialIndex}
          getItemLayout={(_, index) => ({ length: itemHeight, offset: itemHeight * index, index })}
          showsVerticalScrollIndicator={false}
          snapToInterval={itemHeight}
          decelerationRate="fast"
          onMomentumScrollEnd={(e) => {
            const offsetY = e.nativeEvent.contentOffset.y;
            const idx = Math.round(offsetY / itemHeight);
            const v = data[Math.min(Math.max(idx, 0), data.length - 1)];
            if (v !== undefined) onChange(v);
          }}
          contentContainerStyle={{ paddingTop: (wheelHeight - itemHeight) / 2, paddingBottom: (wheelHeight - itemHeight) / 2 }}
          renderItem={({ item }) => (
            <View style={{ height: itemHeight, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 18, fontWeight: item === value ? "800" : "400", color: item === value ? colors.primary800 : "#111827" }}>
                {String(item).padStart(2, "0")}
              </Text>
            </View>
          )}
        />
        {/* top/bottom fade to indicate scrollable */}
        <LinearGradient
          pointerEvents="none"
          colors={["#FFFFFF", "#FFFFFF00"]}
          style={{ position: "absolute", left: 0, right: 0, top: 0, height: (wheelHeight - itemHeight) / 2 }}
        />
        <LinearGradient
          pointerEvents="none"
          colors={["#FFFFFF00", "#FFFFFF"]}
          style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: (wheelHeight - itemHeight) / 2 }}
        />
      </View>
    );
  };
  return (
    <SafeAreaView style={{ backgroundColor: colors.white, height: "100%" }}>
      <AppBar canGoBack={router.canGoBack()} onBack={() => router.back()} title="" />
      <View style={{ padding: 16, gap: 12, flex: 1 }}>
        <View style={{ paddingHorizontal: 8 }}>
          <Text variant="display">경기 날짜를 선택해 주세요</Text>
          <Text style={{ marginTop: 8, color: "#667085" }}>{date}</Text>
        </View>

        <View style={{ flexDirection: "row", marginTop: 12, flex: 1, marginHorizontal: "auto" }}>
          {/* 월 휠: 오늘 이후의 월만 */}
          <View style={{ borderRadius: 12, paddingVertical: 8 , width: 128}}>
            <Text style={{ textAlign: "center", fontWeight: "700", marginBottom: 8 }}>월</Text>
            <Wheel
              data={Array.from({ length: 12 - (now.getMonth() + 1) + 1 }, (_, i) => now.getMonth() + 1 + i)}
              value={month}
              onChange={(m) => {
                setMonth(m);
                const minDay = m === (now.getMonth() + 1) ? now.getDate() : 1;
                if (day < minDay) setDay(minDay);
              }}
            />
          </View>

          {/* 일 휠: 선택 월이 현재 월일 때 오늘 이후만 */}
          <View style={{  borderRadius: 12, paddingVertical: 8 , width: 128}}>
            <Text style={{ textAlign: "center", fontWeight: "700", marginBottom: 8 }}>일</Text>
            <Wheel
              data={(() => {
                const last = new Date(year, month, 0).getDate();
                const start = month === (now.getMonth() + 1) ? now.getDate() : 1;
                return Array.from({ length: last - start + 1 }, (_, i) => start + i);
              })()}
              value={day}
              onChange={setDay}
            />
          </View>
        </View>
      </View>
      <View style={{ position: "absolute", padding: 16, paddingBottom: 48, bottom: 0, width: "100%" }}>
        <Button
          title={loading ? "불러오는 중..." : "해당 날짜 경기 보기"}
          size="lg"
          onPress={async () => {
            setLoading(true);
            try {
              const res = await api<{ games: GameRow[] }>(`/v1/games?date=${date}`);
              // TODO: 다음 단계 화면로 이동 및 games 전달/상태 저장
              setGames(res.games || []);
              // 임시로 알림만 표시
              if (!res.games || res.games.length === 0) {
                alert("해당 날짜의 경기가 없습니다");
              } else {
                alert(`${res.games.length}개의 경기를 찾았습니다.`);
              }
            } catch (e) {
              alert("게임 목록을 불러오지 못했습니다");
            } finally {
              setLoading(false);
            }
          }}
        />
      </View>
      
    </SafeAreaView>
  );
}


