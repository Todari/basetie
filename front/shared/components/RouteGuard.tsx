/**
 * 인증이 필요한 라우트를 보호하는 컴포넌트
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Text } from '../ui/Text';
import { colors } from '../../theme/design-tokens';
import { router } from 'expo-router';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export function RouteGuard({ 
  children, 
  requireAuth = false, 
  fallback,
  loadingComponent 
}: RouteGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // 인증이 필요한데 로그인되지 않은 경우 로그인 화면으로 리다이렉트
  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      console.log('RouteGuard: Redirecting to auth - requireAuth:', requireAuth, 'isAuthenticated:', isAuthenticated);
      router.replace('/auth');
    }
  }, [isLoading, requireAuth, isAuthenticated]);

  // 로딩 중일 때
  if (isLoading) {
    return loadingComponent || (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: colors.white 
      }}>
        <ActivityIndicator size="large" color={colors.primary500} />
        <Text style={{ marginTop: 16, color: colors.gray600 }}>
          인증 상태를 확인하는 중...
        </Text>
      </View>
    );
  }

  // 인증이 필요한데 로그인되지 않은 경우 - 즉시 리다이렉트
  if (requireAuth && !isAuthenticated) {
    console.log('RouteGuard: Blocking access - requireAuth:', requireAuth, 'isAuthenticated:', isAuthenticated);
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: colors.white 
      }}>
        <ActivityIndicator size="large" color={colors.primary500} />
        <Text style={{ marginTop: 16, color: colors.gray600 }}>
          로그인 화면으로 이동 중...
        </Text>
      </View>
    );
  }

  // 인증이 필요하지 않거나 로그인된 경우
  console.log('RouteGuard: Allowing access - requireAuth:', requireAuth, 'isAuthenticated:', isAuthenticated);
  return <React.Fragment>{children}</React.Fragment>;
}

