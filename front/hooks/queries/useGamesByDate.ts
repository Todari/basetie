import { useQuery } from "@tanstack/react-query";
import { api } from "../../shared/api/client";
import { Game } from "../../shared/types";

export function useGamesByDate(date: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["games", date],
    queryFn: () => api<{ games: Game[] }>(`/v1/games?date=${date}`),
    enabled,
    staleTime: 60_000,
  });
}


