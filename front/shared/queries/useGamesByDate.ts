import { useQuery } from "@tanstack/react-query";
import { api } from "../../shared/api/client";

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

export function useGamesByDate(date: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["games", date],
    queryFn: () => api<{ games: GameRow[] }>(`/v1/games?date=${date}`),
    enabled,
    staleTime: 60_000,
  });
}


