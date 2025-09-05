import { SafeAreaView, Alert } from "react-native";
import { useRef, useState } from "react";
import { router } from "expo-router";
import { AppBar } from "../../shared/ui/AppBar";
import { colors } from "../../theme/design-tokens";
import { DateStep } from "./DateStep";
import { GameStep } from "./GameStep";
import { DetailsStep } from "./DetailsStep";
import { Game, YMDDate, TicketFormData } from "../../shared/types";
import { useCreateListing } from "../../hooks/queries/useCreateListing";
import { RouteGuard } from "../../shared/components/RouteGuard";


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

  const createListingMutation = useCreateListing();

  // 폼 제출 처리
  const handleSubmit = async () => {
    if (!selectedGame) {
      Alert.alert("오류", "경기를 선택해주세요.");
      return;
    }

    try {
      const requestData = {
        game_id: selectedGame.id.toString(),
        team_id: selectedGame.home_team_id.toString(),
        section: form.section,
        row: form.row,
        seat_label: form.seat_label,
        price: form.price,
        note: form.note,
      };

      await createListingMutation.mutateAsync(requestData);
      
      Alert.alert(
        "등록 완료", 
        "티켓이 성공적으로 등록되었습니다.",
        [
          {
            text: "확인",
            onPress: () => router.back()
          }
        ]
      );
    } catch (error: any) {
      Alert.alert("등록 실패", error.message || "티켓 등록에 실패했습니다.");
    }
  };

  // 선택된 게임이 변경될 때 폼 업데이트
  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
    setForm(prev => ({
      ...prev,
      game_id: game.id.toString(),
      team_id: game.home_team_id.toString(),
    }));
  };
  
  return (
    <RouteGuard requireAuth={true}>
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
        {step === 3 && (
          <DetailsStep
            date={date}
            setStep={setStep}
            selectedGame={selectedGame}
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            isSubmitting={createListingMutation.isPending}
          />
        )}
      </SafeAreaView>
    </RouteGuard>
  );
}


