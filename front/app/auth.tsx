import { SafeAreaView, View, Text, Alert } from "react-native";
import { Button } from "../components/ui/Button";
import { AppBar } from "../components/ui/AppBar";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useEffect } from "react";
import { api } from "../shared/api/client";
import { useAuth } from "../shared/store/auth";

export default function AuthScreen() {
  const setTokens = useAuth((s) => s.setTokens);
  WebBrowser.maybeCompleteAuthSession();
  const [req, res, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    const run = async () => {
      if (res?.type === "success" && res.params?.id_token) {
        try {
          const data = await api<{ access: string; refresh: string }>(`/v1/auth/oauth/google`, { method: "POST", body: { id_token: res.params.id_token } });
          setTokens(data);
          Alert.alert("로그인", "구글 로그인 성공");
        } catch (e: any) { Alert.alert("오류", e.message); }
      }
    };
    run();
  }, [res]);

  return (
    <SafeAreaView>
      <AppBar canGoBack={router.canGoBack()} onBack={() => router.back()} title="로그인" />
      <View style={{ padding: 16, gap: 12 }}>
        <Button title="Google 로그인" onPress={() => promptAsync()} />
        {/* Apple 로그인은 후속 재도입(패키지 버전 호환 확인 후) */}
      </View>
    </SafeAreaView>
  );
}


