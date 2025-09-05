import { ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "../../components/ui/Text";
import { useEffect, useRef, useState } from "react";
import { CaretLeftIcon, CaretRightIcon } from "phosphor-react-native";
import { colors } from "../../theme/design-tokens";
import { Button } from "../../components/ui/Button";
import { YMDDate } from ".";
import { useGamesByDate } from "../../hooks/queries/useGamesByDate";
import { Card } from "../../components/ui/Card";
import { YMDToDisplayDate, YMDToQueryDate } from "../../shared/utils/date";

interface GameStepProps {
  setStep: (step: number) => void;
  date: YMDDate;
}

export function GameStep({ setStep, date }: GameStepProps) {  
  const { data: games, isLoading, error } = useGamesByDate(YMDToQueryDate(date));

  return (
    <>
    <View style={{ padding: 16, gap: 12, flex: 1 }}>
        <View style={{ paddingHorizontal: 8 }}>
          <Text variant="display">경기를 선택해 주세요</Text>
          <Text style={{ marginTop: 8, color: colors.gray500 }}>{YMDToDisplayDate(date)}</Text>
        </View>

        <ScrollView>
        {games?.games.map((game) => (
          <Card key={game.id}>
            <Text>{game.home_team_name} vs {game.away_team_name}</Text>
            </Card>
          ))}
        </ScrollView>
      </View>
      <View style={{ position: "absolute", display: "flex", flexDirection: "row", gap: 16, padding: 16, paddingBottom: 48, bottom: 0, width: "100%" , backgroundColor: colors.white}}>
        <Button
          title={"이전"}
          size="lg"
          variant="secondary"
          onPress={async () => {
            setStep(1);
          }}
          style={{ flex: 1 }}
        />
        <Button
          title={"다음"}
          size="lg"
          onPress={async () => {
            setStep(3);
          }}
          style={{ flex: 1 }}
        />
      </View>
    </>
  );
}