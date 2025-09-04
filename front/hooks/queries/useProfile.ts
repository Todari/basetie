import { useQuery } from "@tanstack/react-query";
import { api } from "../../shared/api/client";

type UserProfile = {
  id: number;
  email: string;
  name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
};

export function useProfile(token?: string) {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => api<{ user: UserProfile }>("/v1/auth/me", { token }),
    enabled: !!token,
    staleTime: 5 * 60_000, // 5분
  });
}
