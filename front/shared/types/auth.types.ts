/**
 * 인증 관련 타입 정의
 */

export interface UserProfile {
  id: number;
  email: string;
  phone?: string;
  status: string;
  created_at: string;
  updated_at: string;
  nickname?: string;
  favorite_team_id?: number;
  bio?: string;
  rating_avg: number;
  ratings_count: number;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface GoogleAuthRequest {
  id_token: string;
}

export interface AuthState {
  user: UserProfile | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
}
