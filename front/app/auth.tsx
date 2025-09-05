import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../shared/contexts/AuthContext';
import { useMe } from '../hooks/queries';
import { Button, Text, Card } from '../shared/ui';

export default function AuthScreen() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      
      // 1. 백엔드에서 Google OAuth URL 가져오기
      const urlResponse = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/v1/auth/oauth/google/url`);
      if (!urlResponse.ok) {
        throw new Error('OAuth URL을 가져올 수 없습니다.');
      }
      
      const { auth_url } = await urlResponse.json();
      
      // 2. 브라우저에서 Google OAuth 페이지 열기
      const result = await WebBrowser.openAuthSessionAsync(
        auth_url,
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/v1/auth/oauth/google/callback`
      );
      
      if (result.type === 'success' && result.url) {
        // 3. 콜백 URL에서 authorization code 추출
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        
        if (code) {
          // 4. 백엔드에서 토큰 교환 및 사용자 정보 가져오기
          const callbackResponse = await fetch(
            `${process.env.EXPO_PUBLIC_API_BASE_URL}/v1/auth/oauth/google/callback?code=${code}`
          );
          
          if (!callbackResponse.ok) {
            throw new Error('OAuth 콜백 처리에 실패했습니다.');
          }
          
          const { access, refresh, user_id, success } = await callbackResponse.json();
          
          if (success) {
            // 5. 사용자 상세 정보 조회
            const meResponse = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/v1/me`, {
              headers: {
                'Authorization': `Bearer ${access}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (!meResponse.ok) {
              throw new Error('사용자 정보 조회에 실패했습니다.');
            }
            
            const userData = await meResponse.json();
            
            // 6. 로그인 상태 업데이트
            await login(
              { access, refresh },
              userData
            );
            
            router.replace('/(tabs)/home');
          } else {
            throw new Error('OAuth 인증에 실패했습니다.');
          }
        } else {
          throw new Error('Authorization code를 받지 못했습니다.');
        }
      } else if (result.type === 'cancel') {
        console.log('Google login cancelled');
      } else {
        throw new Error('Google OAuth 인증에 실패했습니다.');
      }
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert('로그인 실패', 'Google 로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text variant="title" style={styles.title}>
          로그인
        </Text>
        
        <Text variant="body" style={styles.description}>
          KBO 티켓 거래를 시작하려면 로그인해주세요
        </Text>

        <Button
          onPress={handleGoogleLogin}
          title="Google로 로그인"
          variant="primary"
          disabled={isLoading}
          style={styles.button}
        />
        
        <Text variant="caption" style={styles.note}>
          Google OAuth는 백엔드에서 완전히 처리됩니다
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  button: {
    marginBottom: 16,
  },
  note: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
});