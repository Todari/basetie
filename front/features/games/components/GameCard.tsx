/**
 * 게임 카드 컴포넌트 (features/games로 이동)
 */

import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Card } from '../../../shared/ui/Card';
import { Text } from '../../../shared/ui/Text';
import { colors } from '../../../theme/design-tokens';
import { GameCardProps } from '../../../shared/types';

export function GameCard({ 
  game, 
  isSelected, 
  onPress, 
  variant = 'default' 
}: GameCardProps) {
  const cardStyle = {
    borderWidth: isSelected ? 2 : 1,
    borderColor: isSelected ? colors.primary500 : colors.gray200,
    backgroundColor: isSelected ? colors.primary50 : colors.gray50,
  };

  const isCompact = variant === 'compact';

  return (
    <TouchableOpacity onPress={() => onPress(game)}>
      <Card style={cardStyle}>
        <View style={{ gap: isCompact ? 4 : 8 }}>
          <Text 
            variant={isCompact ? "body" : "title"} 
            style={{ textAlign: "center", fontWeight: "700" }}
          >
            {game.home_team_name} vs {game.away_team_name}
          </Text>
          
          {game.start_time_local && (
            <Text 
              style={{ 
                textAlign: "center", 
                color: colors.gray600,
                fontSize: isCompact ? 12 : 14,
              }}
            >
              {game.start_time_local}
            </Text>
          )}
          
          <Text 
            style={{ 
              textAlign: "center", 
              color: colors.gray600,
              fontSize: isCompact ? 12 : 14,
            }}
          >
            {game.stadium}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
