import type { IngestRequest, IngestResponse } from "../models/ingest";

const BACKEND_HTTP = import.meta.env.VITE_BACKEND_HTTP ?? "https://unichatbot.onrender.com";

export async function ingestPdfs(opts: IngestRequest): Promise<IngestResponse> {
  const res = await fetch(`${BACKEND_HTTP}/ingest-pdfs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<IngestResponse>;
}
