const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8089";

export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export async function api<T>(path: string, options: { method?: HttpMethod; body?: any; token?: string } = {}): Promise<T> {
  const { method = "GET", body, token } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let errText = "Request failed";
    try { const j = await res.json(); errText = j.error || errText; } catch {}
    throw new Error(`${res.status} ${errText}`);
  }
  try { return (await res.json()) as T; } catch { return undefined as unknown as T; }
}


