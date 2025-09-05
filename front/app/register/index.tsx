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
import { DateStep } from "./DateStep";
import { GameStep } from "./GameStep";

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

export type YMDDate = {
  year: number;
  month: number;
  day: number;
};


export default function RegisterTab() {
  const [step, setStep] = useState(1);
  const nowRef = useRef(new Date());
  const now = nowRef.current;
  const [date, setDate] = useState<YMDDate>({year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate()});
  const [form, setForm] = useState({ game_id: "", team_id: "", section: "", row: "", seat_label: "", price: "", note: "" });
  
  return (
    <SafeAreaView style={{ backgroundColor: colors.white, height: "100%" }}>
      <AppBar canGoBack={router.canGoBack()} onBack={() => router.back()} title="" />
      {step === 1 && <DateStep setDate={setDate} date={date} setStep={setStep} />}
      {step === 2 && <GameStep date={date} setStep={setStep} />}
    </SafeAreaView>
  );
}


