import { openChatWebSocket, postChat } from "../api/chat";
import type { BackendKind, Source } from "../models/chat";

export type ChatMessage = { id: string; role: "user" | "assistant" | "system"; content: string };

export async function chatRest(
  question: string,
  backend: BackendKind,
  signal?: AbortSignal
): Promise<{ answer: string; sources: Source[] }> {
  const data = await postChat(question, backend, signal);
  return { answer: data.answer ?? "", sources: (data.sources ?? []) as Source[] };
}

export function chatStream(opts: {
  question: string;
  backend: BackendKind;
  onSources: (sources: Source[] | null) => void;
  onChunk: (chunk: string) => void;
  onDone: () => void;
  onError: (err: unknown) => void;
}): WebSocket {
  const ws = openChatWebSocket(
    (json: unknown) => {
      const payload = json as { type?: string; sources?: Source[] };
      if (payload?.type === "sources") {
        opts.onSources(Array.isArray(payload.sources) ? payload.sources : null);
      } else if (payload?.type === "done") {
        opts.onDone();
        ws.close();
      } else if (payload?.type === "error") {
        opts.onError(payload);
      }
    },
    (text: string) => opts.onChunk(text)
  );
  ws.onopen = () => {
    ws.send(JSON.stringify({ question: opts.question, backend: opts.backend }));
  };
  ws.onerror = (e: Event) => {
    try { ws.close(); } catch {}
    opts.onError(e);
  };
  return ws;
}
