import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "../shared/contexts/AuthContext";

export default function Layout() {
  const [qc] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5분
      },
    },
  }));
  
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="listing/[id]" />
          <Stack.Screen name="register/index" />
          <Stack.Screen name="auth" />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}


