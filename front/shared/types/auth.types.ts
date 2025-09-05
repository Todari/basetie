/**
 * 인증 관련 타입 정의
 */

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
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
