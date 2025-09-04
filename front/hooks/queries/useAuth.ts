import { useMutation } from "@tanstack/react-query";
import { api } from "../../shared/api/client";

type AuthResponse = {
  access: string;
  refresh: string;
};

type GoogleAuthRequest = {
  id_token: string;
};

export function useGoogleAuth() {
  return useMutation({
    mutationFn: async (data: GoogleAuthRequest) => {
      return api<AuthResponse>("/v1/auth/oauth/google", {
        method: "POST",
        body: data,
      });
    },
  });
}
