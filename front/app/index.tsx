import { useEffect, useState } from "react";
import { SafeAreaView, Text } from "react-native";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8089";

export default function Home() {
  const [status, setStatus] = useState<string>("...");
  
  useEffect(() => {
    fetch(`${API_BASE_URL}/healthz`).then(async (r) => {
      setStatus(`${r.status}`);
    }).catch(() => setStatus("ERR"));
  }, []);

  return (
    <SafeAreaView style={{ padding: 24 }}>
      <Text>Basetie</Text>
      <Text>/healthz: {status}</Text>
    </SafeAreaView>
  );
}


