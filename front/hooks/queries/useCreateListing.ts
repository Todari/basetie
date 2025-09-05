/**
 * 티켓 등록을 위한 React Query mutation 훅
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../shared/api/client";
import { CreateTicketRequest } from "../../shared/types";
import { QUERY_KEYS } from "../../shared/constants";

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

  return useMutation({
    mutationFn: async (data: CreateTicketRequest): Promise<CreateListingResponse> => {
      return api<CreateListingResponse>('/v1/listings', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      // 등록 성공 시 목록 새로고침
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LISTINGS] });
    },
  });
}
