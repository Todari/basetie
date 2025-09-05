/**
 * 게임 목록을 표시하는 컴포넌트
 */

import React from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '../ui/Text';
import { GameCard } from './GameCard';
import { Game } from '../types';
import { colors } from '../../theme/design-tokens';

interface GameListProps {
  games: Game[];
  selectedGame: Game | null;
  onGameSelect: (game: Game) => void;
  loading?: boolean;
  error?: Error | null;
}

export function GameList({ 
  games, 
  selectedGame, 
  onGameSelect, 
  loading = false,
  error = null 
}: GameListProps) {
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: colors.gray600 }}>경기 목록을 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: colors.danger, textAlign: "center" }}>
          경기 목록을 불러오는데 실패했습니다.
        </Text>
      </View>
    );
  }

  if (games.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: colors.gray500, textAlign: "center" }}>
          해당 날짜에 경기가 없습니다.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      {games.map((game) => (
        <View key={game.id} style={{ marginBottom: 12 }}>
          <GameCard
            game={game}
            isSelected={selectedGame?.id === game.id}
            onPress={onGameSelect}
          />
        </View>
      ))}
    </ScrollView>
  );
}
