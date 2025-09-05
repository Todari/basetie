import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS, QUERY_KEYS } from '../../shared/constants';
import { UserProfile } from '../../shared/types';

interface UseMeOptions {
  accessToken: string;
  enabled?: boolean;
}

export function useMe({ accessToken, enabled = true }: UseMeOptions) {
  return useQuery<UserProfile>({
    queryKey: [QUERY_KEYS.ME],
    queryFn: async () => {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/v1/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('사용자 정보를 가져올 수 없습니다.');
      }

      return response.json();
    },
    enabled: enabled && !!accessToken,
  });
}
