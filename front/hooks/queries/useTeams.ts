import { useQuery } from "@tanstack/react-query";
import { api } from "../../shared/api/client";

type Team = {
  id: number;
  name: string;
  short_code: string;
  logo_url?: string;
};

export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: () => api<{ teams: Team[] }>("/v1/teams"),
    staleTime: 10 * 60_000, // 10분 - 팀 정보는 자주 변경되지 않음
  });
}
