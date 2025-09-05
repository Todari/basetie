/**
 * 티켓 등록을 위한 React Query mutation 훅
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../shared/api/client";
import { CreateTicketRequest } from "../../shared/types";
import { QUERY_KEYS } from "../../shared/constants";
import { useAuth } from "../../shared/contexts/AuthContext";

interface CreateListingResponse {
  listing: {
    id: number;
    game: string;
    time: string;
    seat: string;
    price: number;
    description?: string;
    seller_id: number;
    created_at: string;
    updated_at: string;
  };
  message: string;
  success: boolean;
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  const { tokens } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateTicketRequest): Promise<CreateListingResponse> => {
      if (!tokens?.access) {
        throw new Error("로그인이 필요합니다.");
      }
      
      return api<CreateListingResponse>('/v1/listings', {
        method: 'POST',
        token: tokens.access,
        body: data,
      });
    },
    onSuccess: () => {
      // 등록 성공 시 목록 새로고침
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LISTINGS] });
    },
  });
}
