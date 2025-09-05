import { SafeAreaView } from "react-native";
import { useRef, useState } from "react";
import { router } from "expo-router";
import { AppBar } from "../../shared/ui/AppBar";
import { colors } from "../../theme/design-tokens";
import { DateStep } from "./DateStep";
import { GameStep } from "./GameStep";
import { Game, YMDDate, TicketFormData } from "../../shared/types";


export default function RegisterTab() {
  const [step, setStep] = useState(1);
  const nowRef = useRef(new Date());
  const now = nowRef.current;
  const [date, setDate] = useState<YMDDate>({
    year: now.getFullYear(), 
    month: now.getMonth() + 1, 
    day: now.getDate()
  });
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [form, setForm] = useState<TicketFormData>({ 
    game_id: "", 
    team_id: "", 
    section: "", 
    row: "", 
    seat_label: "", 
    price: "", 
    note: "" 
  });
  
  return (
    <SafeAreaView style={{ backgroundColor: colors.white, height: "100%" }}>
      <AppBar canGoBack={router.canGoBack()} onBack={() => router.back()} title="" />
      {step === 1 && <DateStep setDate={setDate} date={date} setStep={setStep} />}
      {step === 2 && (
        <GameStep 
          date={date} 
          setStep={setStep} 
          selectedGame={selectedGame}
          setSelectedGame={setSelectedGame}
        />
      )}
    </SafeAreaView>
  );
}


