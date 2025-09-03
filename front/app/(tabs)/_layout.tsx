import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="home" options={{ title: "홈" , headerShown: false}} />
      <Tabs.Screen name="register" options={{ title: "등록" , headerShown: false}} />
      <Tabs.Screen name="profile" options={{ title: "프로필" , headerShown: false}} />
    </Tabs>
  );
}
