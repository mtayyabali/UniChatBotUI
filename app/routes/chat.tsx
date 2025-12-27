import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/chat";
import type { BackendKind, Source, ChatMessage } from "../models/chat";
import { chatRest, chatStream } from "../services/chatService";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "UniChatBot" },
    { name: "description", content: "University chatbot powered by RAG" },
  ];
}

export default function ChatRoute() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<string>("idle");
  const [sources, setSources] = useState<Source[] | null>(null);
  const [backend, setBackend] = useState<BackendKind>("weaviate");
  const wsRef = useRef<WebSocket | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && status !== "sending", [input, status]);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
      abortRef.current?.abort();
    };
  }, []);

  function appendAssistantChunk(chunk: string) {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === "assistant") {
        return [...prev.slice(0, -1), { ...last, content: last.content + chunk }];
      }
      return [...prev, { id: crypto.randomUUID(), role: "assistant", content: chunk }];
    });
  }

  function removeTrailingEmptyAssistant() {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === "assistant" && last.content.length === 0) {
        return prev.slice(0, -1);
      }
      return prev;
    });
  }

  function replaceTrailingAssistantContent(content: string) {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === "assistant") {
        return [...prev.slice(0, -1), { ...last, content }];
      }
      return [...prev, { id: crypto.randomUUID(), role: "assistant", content }];
    });
  }

  async function sendQuestionWS(question: string) {
    setStatus("connecting");
    setSources(null);

    try {
      const ws = chatStream({
        question,
        backend,
        onSources: (srcs) => setSources(srcs),
        onChunk: (chunk) => appendAssistantChunk(chunk),
        onDone: () => {
          setStatus("idle");
        },
        onError: () => {
          setStatus("idle");
          sendQuestionREST(question, /*replacePlaceholder*/ false);
        },
      });
      wsRef.current = ws;
      ws.onclose = () => setStatus("idle");
    } catch (e) {
      setStatus("idle");
      sendQuestionREST(question, /*replacePlaceholder*/ false);
    }
  }

  async function sendQuestionREST(question: string, replacePlaceholder = false) {
    setStatus("sending");
    setSources(null);
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const { answer, sources: srcs } = await chatRest(question, backend, abortRef.current.signal);
      setSources(srcs ?? null);
      if (replacePlaceholder) {
        replaceTrailingAssistantContent(answer);
      } else {
        setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: answer }]);
      }
    } catch (e) {
      const fallback = "Sorry, I couldn't get a response right now.";
      if (replacePlaceholder) {
        replaceTrailingAssistantContent(fallback);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: fallback },
        ]);
      }
    } finally {
      setStatus("idle");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    setInput("");
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", content: q }]);
    await sendQuestionWS(q);
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <header className="mb-4 flex items-center gap-3">
        <Link
          to="/"
          className="rounded px-3 py-2 border border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          ← Back
        </Link>
        <h1 className="text-xl font-semibold">UniChatBot</h1>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm">Backend:</label>
          <select
            className="border rounded px-2 py-1"
            value={backend}
            onChange={(e) => setBackend(e.target.value as BackendKind)}
          >
            <option value="chroma">Chroma</option>
            <option value="weaviate">Weaviate</option>
          </select>
        </div>
      </header>

      <section className="border rounded-lg p-4 space-y-3 min-h-[300px]">
        {messages.length === 0 ? (
          <>
            <p className="text-gray-600">Ask me about courses, policies, and more.</p>
            {(status === "streaming" || status === "sending" || status === "connecting") && (
              <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                <span
                  aria-label="Loading"
                  className="inline-block w-4 h-4 border-2 border-gray-500/60 border-t-gray-900 dark:border-gray-300/60 dark:border-t-white rounded-full animate-spin"
                />
                <span className="text-xs">Thinking…</span>
              </div>
            )}
          </>
        ) : (
          <ul className="space-y-2">
            {messages.map((m) => (
              m.role === "assistant" && m.content.length === 0 ? null : (
                <li key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
                  <div
                    className={
                      "inline-block max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 " +
                      (m.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100")
                    }
                  >
                    {m.content}
                  </div>
                </li>
              )
            ))}
            {(status === "streaming" || status === "sending") && (
              <li className="text-left">
                <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                  <span
                    aria-label="Loading"
                    className="inline-block w-4 h-4 border-2 border-gray-500/60 border-t-gray-900 dark:border-gray-300/60 dark:border-t-white rounded-full animate-spin"
                  />
                  <span className="text-xs">Thinking…</span>
                </div>
              </li>
            )}
          </ul>
        )}

        {sources && sources.length > 0 && (
          <div className="pt-2 text-xs text-gray-600">
            <span className="font-medium">Sources:</span>{" "}
            {sources.map((s, i) => (
              <span key={i} className="mr-2">
                {s.file ?? "unknown"}
                {typeof s.page === "number" ? ` p.${s.page}` : ""}
              </span>
            ))}
          </div>
        )}
      </section>

      <form onSubmit={onSubmit} className="mt-4 flex items-center gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Type your question…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          disabled={!canSend}
          type="submit"
        >
          {status === "sending" || status === "streaming" ? "Sending…" : "Send"}
        </button>
      </form>
    </main>
  );
}
