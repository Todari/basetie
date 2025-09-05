/**
 * 인증 상태를 전역으로 관리하는 Context
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, AuthTokens } from '../types';

// 임시 메모리 저장소 (AsyncStorage 대신)
const memoryStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return (global as any).__authStorage?.[key] || null;
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (!(global as any).__authStorage) {
        (global as any).__authStorage = {};
      }
      (global as any).__authStorage[key] = value;
    } catch {
      // 무시
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      if ((global as any).__authStorage) {
        delete (global as any).__authStorage[key];
      }
    } catch {
      // 무시
    }
  },
  async multiRemove(keys: string[]): Promise<void> {
    try {
      if ((global as any).__authStorage) {
        keys.forEach(key => delete (global as any).__authStorage[key]);
      }
    } catch {
      // 무시
    }
  }
};

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  login: (tokens: AuthTokens, user: UserProfile) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEYS = {
  TOKENS: '@basetie_tokens',
  USER: '@basetie_user',
} as const;

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 토큰 유효성 검사
  const validateToken = useCallback(async (accessToken: string): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  // 인증 상태 확인
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const storedTokens = await memoryStorage.getItem(STORAGE_KEYS.TOKENS);
      const storedUser = await memoryStorage.getItem(STORAGE_KEYS.USER);
      
      if (storedTokens && storedUser) {
        const parsedTokens = JSON.parse(storedTokens);
        const parsedUser = JSON.parse(storedUser);
        
        // 토큰 유효성 검사
        const isValid = await validateToken(parsedTokens.access);
        
        if (isValid) {
          setTokens(parsedTokens);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          // 토큰이 유효하지 않으면 저장된 데이터 삭제
          await memoryStorage.multiRemove([STORAGE_KEYS.TOKENS, STORAGE_KEYS.USER]);
        }
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      // 에러 발생 시 로그아웃 상태로 설정
      await logout();
    } finally {
      setIsLoading(false);
    }
  }, [validateToken]);

  // 로그인
  const login = useCallback(async (newTokens: AuthTokens, newUser: UserProfile) => {
    try {
      await memoryStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(newTokens));
      await memoryStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      
      setTokens(newTokens);
      setUser(newUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  // 로그아웃
  const logout = useCallback(async () => {
    try {
      await memoryStorage.multiRemove([STORAGE_KEYS.TOKENS, STORAGE_KEYS.USER]);
      
      setTokens(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  // 앱 시작 시 인증 상태 확인
  useEffect(() => {
    // 로딩 상태를 true로 시작하여 RouteGuard가 제대로 작동하도록 함
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100); // 짧은 지연으로 로딩 상태 유지
    
    return () => clearTimeout(timer);
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    user,
    tokens,
    isLoading,
    login,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
