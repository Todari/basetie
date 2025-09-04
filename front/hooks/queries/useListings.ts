import { useQuery } from "@tanstack/react-query";
import { api } from "../../shared/api/client";

type Listing = {
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

type ListingsResponse = {
  listings: Listing[];
  total: number;
  page: number;
  limit: number;
};

export function useListings(params?: { page?: number; limit?: number; team?: string; date?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.team) searchParams.set("team", params.team);
  if (params?.date) searchParams.set("date", params.date);

  const queryString = searchParams.toString();
  const url = `/v1/listings${queryString ? `?${queryString}` : ""}`;

  return useQuery({
    queryKey: ["listings", params],
    queryFn: () => api<ListingsResponse>(url),
    staleTime: 30_000, // 30초
  });
}

export function useListing(id: number) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: () => api<{ listing: Listing }>(`/v1/listings/${id}`),
    enabled: !!id,
    staleTime: 60_000, // 1분
  });
}
