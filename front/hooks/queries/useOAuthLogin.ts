import { useMutation } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../../shared/constants';

interface OAuthLoginRequest {
  id_token: string;
  provider: 'google' | 'apple' | 'kakao';
}

interface OAuthLoginResponse {
  access: string;
  refresh: string;
  user_id: number;
}

export function useOAuthLogin() {
  return useMutation<OAuthLoginResponse, Error, OAuthLoginRequest>({
    mutationFn: async ({ id_token, provider }) => {
      const endpoint = `${API_ENDPOINTS.BASE_URL}/v1/auth/oauth/${provider}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_token, provider }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'OAuth 로그인에 실패했습니다.');
      }

      return response.json();
    },
  });
}
