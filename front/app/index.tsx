import { useEffect, useState } from "react";
import { SafeAreaView, View, Text } from "react-native";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8089";

export default function Home() {
  const [status, setStatus] = useState<string>("...");
  useEffect(() => {
    fetch(`${API_BASE_URL}/healthz`).then(async (r) => {
      setStatus(`${r.status}`);
    }).catch(() => setStatus("ERR"));
  }, []);
  return (
    <SafeAreaView>
      <View style={{ padding: 16, gap: 16 }}>
        <Card>
          <Text style={{ fontSize: 24, fontWeight: "700", color: "#111827" }}>Basetie</Text>
          <Text style={{ color: "#111827" }}>/healthz: {status}</Text>
        </Card>
        <Button glass title="Primary" />
      </View>
    </SafeAreaView>
  );
}


