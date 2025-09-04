import { SafeAreaView, View, TouchableOpacity } from "react-native";
import { useRef, useState } from "react";
import { useAuth } from "../../shared/store/auth";
import { router } from "expo-router";
import { AppBar } from "../../components/ui/AppBar";
import { colors } from "../../theme/design-tokens";
import { Text } from "../../components/ui/Text";
import { Button } from "../../components/ui/Button";
import { useGamesByDate } from "../../hooks/queries/useGamesByDate";
import { CaretLeftIcon, CaretRightIcon } from "phosphor-react-native";

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
  const nowRef = useRef(new Date());
  const now = nowRef.current;
  const defaultYear = now.getFullYear();
  const [year] = useState<number>(defaultYear);
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [day, setDay] = useState<number>(now.getDate());
  const queryDate = `${year}년 ${String(month).padStart(2, "0")}월 ${String(day).padStart(2, "0")}일`;
  const [form, setForm] = useState({ game_id: "", team_id: "", section: "", row: "", seat_label: "", price: "", note: "" });
  const access = useAuth((s) => s.access);
  const [calYear, setCalYear] = useState<number>(year);
  const [calMonth, setCalMonth] = useState<number>(month);

  // react-query: 특정 날짜 경기 목록 (버튼 클릭 시 fetch)
  const { data: gamesResp, isFetching, refetch } = useGamesByDate(queryDate, false);

  return (
    <SafeAreaView style={{ backgroundColor: colors.white, height: "100%" }}>
      <AppBar canGoBack={router.canGoBack()} onBack={() => router.back()} title="" />
      <View style={{ padding: 16, gap: 12, flex: 1 }}>
        <View style={{ paddingHorizontal: 8 }}>
          <Text variant="display">경기 날짜를 선택해 주세요</Text>
          <Text style={{ marginTop: 8, color: colors.gray500 }}>{queryDate}</Text>
        </View>

        {/* 캘린더 */}
        <View style={{ marginTop: 12, paddingHorizontal: 8 }}>
          {/* 캘린더 헤더: 월 변경 */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <TouchableOpacity
              onPress={() => {
                const prev = new Date(calYear, calMonth - 2, 1);
                const min = new Date(year, month - 1, 1);
                if (prev < min) return;
                setCalYear(prev.getFullYear());
                setCalMonth(prev.getMonth() + 1);
              }}
              style={{ padding: 8, opacity: (new Date(calYear, calMonth - 2, 1) < new Date(year, month - 1, 1)) ? 0.3 : 1 }}
            >
              <CaretLeftIcon size={16} color={colors.gray800} weight="bold" />
            </TouchableOpacity>
            <Text variant="title">{`${calYear}년 ${String(calMonth).padStart(2, "0")}월`}</Text>
            <TouchableOpacity
              onPress={() => {
                const next = new Date(calYear, calMonth, 1);
                setCalYear(next.getFullYear());
                setCalMonth(next.getMonth() + 1);
              }}
              style={{ padding: 8 }}
            >
              <CaretRightIcon size={16} color={colors.gray800} weight="bold" />
            </TouchableOpacity>
          </View>
          {/* 요일 헤더 */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 }}>
            {["일","월","화","수","목","금","토"].map((w) => (
              <View key={w} style={{ width: `${100/7}%`, alignItems: "center" }}><Text variant="caption" color="secondary">{w}</Text></View>
            ))}
          </View>
          {/* 날짜 그리드 */}
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {(() => {
              const first = new Date(calYear, calMonth - 1, 1);
              const lastDay = new Date(calYear, calMonth, 0).getDate();
              const offset = first.getDay();
              const cells: Array<{ label: string; selectable: boolean; y: number; m: number; d: number }>=[];
              for (let i=0;i<offset;i++) cells.push({ label: "", selectable: false, y: calYear, m: calMonth, d: 0 });
              for (let d=1; d<=lastDay; d++) {
                const cellDate = new Date(calYear, calMonth-1, d);
                const selectable = cellDate >= new Date(year, month-1, now.getDate());
                cells.push({ label: String(d), selectable, y: calYear, m: calMonth, d });
              }
              return cells.map((c, idx) => (
                <TouchableOpacity
                  key={idx}
                  disabled={!c.selectable || !c.label}
                  onPress={() => { if (c.d){ setMonth(c.m); setDay(c.d); setCalYear(c.y); setCalMonth(c.m); } }}
                  style={{ 
                    width: `${100/7}%`, 
                    height: 44, 
                    alignItems: "center", 
                    justifyContent: "center", 
                    opacity: c.selectable ? 1 : 0.3, 
                    borderRadius: 16, 
                    marginVertical: 4,
                    backgroundColor: c.d===day && c.m===month && c.y===year ? colors.primary50 : "transparent",
                  }}
                >
                  <Text 
                    variant="body" 
                    color={c.d===day && c.m===month && c.y===year ? "primary" : "secondary"} 
                    weight={c.d===day && c.m===month && c.y===year ? "bold" : "normal"}
                    style={{ 
                      fontSize: 14,
                      color: c.d===day && c.m===month && c.y===year ? colors.primary800 : colors.gray600
                    }}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ));
            })()}
          </View>
        </View>
      </View>
      <View style={{ position: "absolute", padding: 16, paddingBottom: 48, bottom: 0, width: "100%" }}>
        <Button
          title={isFetching ? "불러오는 중..." : "해당 날짜 경기 보기"}
          size="lg"
          onPress={async () => {
            const r = await refetch();
            const gs = r.data?.games ?? [];
            if (gs.length === 0) alert("해당 날짜의 경기가 없습니다");
            else alert(`${gs.length}개의 경기를 찾았습니다.`);
          }}
        />
      </View>
      
    </SafeAreaView>
  );
}


