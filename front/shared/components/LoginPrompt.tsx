/**
 * 로그인을 유도하는 컴포넌트
 */

import React from 'react';
import { View, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';
import { colors } from '../../theme/design-tokens';

interface LoginPromptProps {
  title?: string;
  message?: string;
  showCancelButton?: boolean;
  onCancel?: () => void;
}

export function LoginPrompt({ 
  title = "로그인이 필요합니다",
  message = "이 기능을 사용하려면 로그인해주세요",
  showCancelButton = true,
  onCancel
}: LoginPromptProps) {
  const { login } = useAuth();

  const handleLogin = () => {
    router.push('/auth');
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: colors.white,
      padding: 24 
    }}>
      <View style={{ 
        backgroundColor: colors.gray50,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        maxWidth: 300,
        width: '100%'
      }}>
        <Text variant="title" style={{ 
          textAlign: 'center', 
          marginBottom: 12,
          color: colors.gray800
        }}>
          {title}
        </Text>
        
        <Text style={{ 
          textAlign: 'center', 
          color: colors.gray500,
          marginBottom: 24,
          lineHeight: 20
        }}>
          {message}
        </Text>
        
        <View style={{ width: '100%', gap: 12 }}>
          <Button
            title="로그인하기"
            onPress={handleLogin}
            size="lg"
            style={{ width: '100%' }}
          />
          
          {showCancelButton && (
            <Button
              title="취소"
              onPress={handleCancel}
              size="lg"
              variant="secondary"
              style={{ width: '100%' }}
            />
          )}
        </View>
      </View>
    </View>
  );
}

