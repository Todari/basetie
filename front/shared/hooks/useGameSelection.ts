/**
 * 게임 선택 관련 로직을 담당하는 훅
 */

import { useState, useCallback } from 'react';
import { useGamesByDate } from '../queries/useGamesByDate';
import { YMDToQueryDate } from '../utils/date';
import { Game, YMDDate } from '../types';

interface UseGameSelectionProps {
  date: YMDDate;
}

interface UseGameSelectionReturn {
  games: Game[];
  loading: boolean;
  error: Error | null;
  selectedGame: Game | null;
  selectGame: (game: Game) => void;
  clearSelection: () => void;
}

export function useGameSelection({ date }: UseGameSelectionProps): UseGameSelectionReturn {
  const { data: gamesData, isLoading, error } = useGamesByDate(YMDToQueryDate(date));
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const selectGame = useCallback((game: Game) => {
    if (validateGameSelection(game)) {
      setSelectedGame(game);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedGame(null);
  }, []);

  return {
    games: gamesData?.games || [],
    loading: isLoading,
    error,
    selectedGame,
    selectGame,
    clearSelection,
  };
}

/**
 * 게임 선택 유효성 검사
 */
function validateGameSelection(game: Game): boolean {
  // 시작 시간이 있는 게임만 선택 가능
  return !!game.start_time_local;
}
