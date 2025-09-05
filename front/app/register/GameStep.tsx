import { ScrollView, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { Text } from "../../components/ui/Text";
import { YMDDate, GameRow } from ".";
import { colors } from "../../theme/design-tokens";
import { Button } from "../../components/ui/Button";
import { useGamesByDate } from "../../hooks/queries/useGamesByDate";
import { Card } from "../../components/ui/Card";
import { YMDToDisplayDate, YMDToQueryDate } from "../../shared/utils/date";

interface GameStepProps {
  setStep: (step: number) => void;
  date: YMDDate;
  selectedGame: GameRow | null;
  setSelectedGame: (game: GameRow | null) => void;
}

export function GameStep({ setStep, date, selectedGame, setSelectedGame }: GameStepProps) {  
  const { data: gamesData, isLoading, error } = useGamesByDate(YMDToQueryDate(date));

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary500} />
        <Text style={{ marginTop: 16, color: colors.gray600 }}>경기 목록을 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <Text style={{ color: colors.danger, textAlign: "center", marginBottom: 16 }}>
          경기 목록을 불러오는데 실패했습니다.
        </Text>
        <Button title="다시 시도" onPress={() => setStep(1)} />
      </View>
    );
  }

  const games = gamesData?.games || [];

  return (
    <>
      <View style={{ padding: 16, gap: 12, flex: 1 }}>
        <View style={{ paddingHorizontal: 8 }}>
          <Text variant="display">경기를 선택해 주세요</Text>
          <Text style={{ marginTop: 8, color: colors.gray500 }}>{YMDToDisplayDate(date)}</Text>
        </View>

        {games.length === 0 ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: colors.gray500, textAlign: "center" }}>
              해당 날짜에 경기가 없습니다.
            </Text>
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }}>
            {games.map((game) => (
              <TouchableOpacity
                key={game.id}
                onPress={() => setSelectedGame(game)}
                style={{ marginBottom: 12 }}
              >
                <Card 
                  style={{
                    ringWidth: selectedGame?.id === game.id ? 2 : 0,
                    ringColor: selectedGame?.id === game.id ? colors.primary500 : colors.gray200,
                    backgroundColor: selectedGame?.id === game.id ? colors.primary50 : colors.gray50,
                    
                  }}
                >
                  <View style={{ gap: 8 }}>
                    <Text variant="title" style={{ textAlign: "center" }}>
                      {game.home_team_name} vs {game.away_team_name}
                    </Text>
                    {game.start_time_local && (
                      <Text style={{ textAlign: "center", color: colors.gray600 }}>
                        {game.start_time_local}
                      </Text>
                    )}
                    <Text style={{ textAlign: "center", color: colors.gray600 }}>
                      {game.stadium}
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
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