import { SafeAreaView, View, Text, ActivityIndicator } from "react-native";
import { Card } from "../../components/ui/Card";
import { useAuth } from "../../shared/store/auth";
import { useProfile } from "../../hooks/queries/useProfile";
import { colors } from "../../theme/design-tokens";

export default function ProfileTab() {
  const access = useAuth((s) => s.access);
  const { data: profileData, isLoading, error } = useProfile(access);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary500} />
        <Text style={{ marginTop: 16, color: colors.gray600 }}>프로필을 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  if (error || !profileData) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <Text style={{ color: colors.danger, textAlign: "center" }}>
          프로필을 불러오는데 실패했습니다.
        </Text>
      </SafeAreaView>
    );
  }

  const user = profileData.user;

  return (
    <SafeAreaView>
      <View style={{ padding: 16, gap: 12 }}>
        <Card>
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>프로필</Text>
          <Text style={{ marginBottom: 4 }}>이름: {user.name}</Text>
          <Text style={{ marginBottom: 4 }}>이메일: {user.email}</Text>
          {user.phone && <Text>전화번호: {user.phone}</Text>}
        </Card>
        <Card>
          <Text style={{ fontSize: 18, fontWeight: "700" }}>내 등록 티켓</Text>
          <Text style={{ color: colors.gray500, marginTop: 8 }}>등록된 티켓이 없습니다.</Text>
        </Card>
        <Card>
          <Text style={{ fontSize: 18, fontWeight: "700" }}>양도 내역</Text>
          <Text style={{ color: colors.gray500, marginTop: 8 }}>양도 내역이 없습니다.</Text>
        </Card>
      </View>
    </SafeAreaView>
  );
}


