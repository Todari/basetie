import { View } from "react-native";
import { Text } from "../../shared/ui/Text";
import { YMDDate, Game } from "../../shared/types";
import { colors } from "../../theme/design-tokens";
import { Button } from "../../shared/ui/Button";
import { useGameSelection, GameList } from "../../features/games";
import { YMDToDisplayDate } from "../../shared/utils/date";

interface GameStepProps {
  setStep: (step: number) => void;
  date: YMDDate;
  selectedGame: Game | null;
  setSelectedGame: (game: Game | null) => void;
}

export function GameStep({ setStep, date, selectedGame, setSelectedGame }: GameStepProps) {  
  const { games, loading, error, selectGame } = useGameSelection({ date });

  const handleGameSelect = (game: Game) => {
    selectGame(game);
    setSelectedGame(game);
  };

  return (
    <>
      <View style={{ padding: 16, gap: 12, flex: 1 }}>
        <View style={{ paddingHorizontal: 8 }}>
          <Text variant="display">경기를 선택해 주세요</Text>
          <Text style={{ marginTop: 8, color: colors.gray500 }}>{YMDToDisplayDate(date)}</Text>
        </View>

        <GameList
          games={games}
          selectedGame={selectedGame}
          onGameSelect={handleGameSelect}
          loading={loading}
          error={error}
        />
      </View>
      
      <View style={{ 
        position: "absolute", 
        display: "flex", 
        flexDirection: "row", 
        gap: 16, 
        padding: 16, 
        paddingBottom: 48, 
        bottom: 0, 
        width: "100%", 
        backgroundColor: colors.white
      }}>
        <Button
          title="이전"
          size="lg"
          variant="secondary"
          onPress={() => setStep(1)}
          style={{ flex: 1 }}
        />
        <Button
          title="다음"
          size="lg"
          onPress={() => setStep(3)}
          style={{ flex: 1 }}
          disabled={!selectedGame}
        />
      </View>
    </>
  );
}