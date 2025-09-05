import { TouchableOpacity, View } from "react-native";
import { Text } from "../../shared/ui/Text";
import { useState } from "react";
import { CaretLeftIcon, CaretRightIcon } from "phosphor-react-native";
import { colors } from "../../theme/design-tokens";
import { Button } from "../../shared/ui/Button";
import { YMDDate } from "../../shared/types";
import { YMDToDisplayDate } from "../../shared/utils/date";

interface DateStepProps {
  setStep: (step: number) => void;
  setDate: (date: YMDDate) => void;
  date: YMDDate;
} 

export function DateStep({ setStep, setDate, date }: DateStepProps) {
  const { year, month, day } = date;
  const [calYear, setCalYear] = useState<number>(year);
  const [calMonth, setCalMonth] = useState<number>(month);

  return (
    <>
    <View style={{ padding: 16, gap: 12, flex: 1 }}>
        <View style={{ paddingHorizontal: 8 }}>
          <Text variant="display">경기 날짜를 선택해 주세요</Text>
          <Text style={{ marginTop: 8, color: colors.gray500 }}>{YMDToDisplayDate(date)}</Text>
        </View>

        {/* 캘린더 */}
        <View style={{ marginTop: 12, paddingHorizontal: 8 }}>
          {/* 캘린더 헤더: 월 변경 */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <TouchableOpacity
              onPress={() => {
                const prev = new Date(calYear, calMonth - 2, 1);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (prev < today) return;
                setCalYear(prev.getFullYear());
                setCalMonth(prev.getMonth() + 1);
              }}
              style={{ 
                padding: 8, 
                opacity: (new Date(calYear, calMonth - 2, 1) < new Date()) ? 0.3 : 1 
              }}
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
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const selectable = cellDate >= today;
                cells.push({ label: String(d), selectable, y: calYear, m: calMonth, d });
              }
              return cells.map((c, idx) => (
                <TouchableOpacity
                  key={idx}
                  disabled={!c.selectable || !c.label}
                  onPress={() => { if (c.d){ setDate({year: c.y, month: c.m, day: c.d}); setCalYear(c.y); setCalMonth(c.m); } }}
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
          title={`${String(calMonth).padStart(2, "0")}월 ${String(day).padStart(2, "0")}일 경기 선택`}
          size="lg"
          onPress={async () => {
            setStep(2);
          }}
        />
      </View>
    </>
  );
}