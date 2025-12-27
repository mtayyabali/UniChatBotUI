// Chat-related models
export type BackendKind = "chroma" | "weaviate";
export type Source = { file?: string; page?: number };
export type ChatResponse = { answer: string; sources?: Source[]; backend?: BackendKind };
export type ChatMessage = { id: string; role: "user" | "assistant" | "system"; content: string };

