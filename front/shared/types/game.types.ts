/**
 * 게임 관련 타입 정의
 */

export type GameStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

export interface Game {
  id: number;
  game_date: string;
  start_time_local?: string;
  stadium: string;
  home_team_id: number;
  away_team_id: number;
  home_team_name: string;
  away_team_name: string;
  status?: GameStatus;
}

// 기존 GameRow와의 호환성을 위한 별칭
export type GameRow = Game;

export interface GameSelectionProps {
  date: YMDDate;
  selectedGame: Game | null;
  setSelectedGame: (game: Game | null) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export interface GameCardProps {
  game: Game;
  isSelected: boolean;
  onPress: (game: Game) => void;
  variant?: 'default' | 'compact';
}
