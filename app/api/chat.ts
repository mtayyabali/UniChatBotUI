import type { BackendKind, ChatResponse } from "../models/chat";

const BACKEND_HTTP = import.meta.env.VITE_BACKEND_HTTP ?? "https://unichatbot.onrender.com";
const WS_URL = BACKEND_HTTP.replace(/^http/, BACKEND_HTTP.startsWith("https") ? "wss" : "ws") + "/ws/chat";

export async function postChat(
  question: string,
  backend: BackendKind,
  signal?: AbortSignal
): Promise<ChatResponse> {
  const res = await fetch(`${BACKEND_HTTP}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, backend }),
    signal,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<ChatResponse>;
}

export function openChatWebSocket(
  onJSON: (payload: unknown) => void,
  onText: (chunk: string) => void
): WebSocket {
  const ws = new WebSocket(WS_URL);
  ws.onmessage = (ev: MessageEvent<string>) => {
    const msg = ev.data as string;
    if (msg.startsWith("{")) {
      try {
        onJSON(JSON.parse(msg));
        return;
      } catch { /* fall through */ }
    }
    onText(msg);
  };
  return ws;
}
