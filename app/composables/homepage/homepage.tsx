import { Link } from "react-router";
import { useState } from "react";
import type { BackendKind } from "../../models/chat";
import { runIngest } from "../../services/ingestService";
import { UploadPdfs } from "../../components/UploadPdfs";

export function HomePage() {
  const [backend, setBackend] = useState<BackendKind>("weaviate");
  const [forceReset, setForceReset] = useState<boolean>(true);
  const [ingestStatus, setIngestStatus] = useState<string>("");
  const [ingesting, setIngesting] = useState<boolean>(false);

  async function ingest() {
    setIngestStatus("Running ingestion…");
    setIngesting(true);
    try {
      const data = await runIngest(backend, forceReset);
      const idx = typeof data?.chunks_indexed === "number" ? data.chunks_indexed : "?";
      const files = typeof data?.files_indexed === "number" ? data.files_indexed : "?";
      const status = data?.status ?? "unknown";
      const be = data?.backend ?? backend;
      setIngestStatus(`Done Ingesting. Indexed ${idx} chunks from ${files} files on ${be} (status: ${status}).`);
    } catch (e) {
      setIngestStatus("Failed to ingest. Check server logs and configuration.");
    } finally {
      setIngesting(false);
    }
  }

  return (
    <main className="flex items-center justify-center pt-12 pb-4">
      <div className="flex-1 flex flex-col items-center gap-8 min-h-0 px-4">
        <header className="flex flex-col items-center gap-3 text-center">
          <picture>
            <source srcSet="/logo-dark.svg" media="(prefers-color-scheme: dark)" />
            <img
              src="/logo-light.svg"
              alt="UniChatBot Logo"
              className="h-14 w-14 select-none"
            />
          </picture>
          <h1 className="text-3xl font-bold tracking-tight">UniChatBot</h1>
          <p className="max-w-2xl text-gray-700 dark:text-gray-200 text-sm">
            Your university course & policy assistant. Ask questions about grading,
            credits, attendance, exam retakes, and more—answers are grounded in
            official PDFs via a RAG pipeline.
          </p>
          <div className="flex items-center gap-2 mt-1">{/* reduced gap and margin */}
            <Link
              to="/chat"
              className="inline-block rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
            >
              Open Chat
            </Link>
          </div>
        </header>

        {/* Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-4xl">{/* reduced gap */}
          {/* RAG Answers */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <h2 className="font-semibold mb-1">RAG Answers</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Retrieval-augmented generation over official university PDFs.
            </p>
          </div>
          {/* Streaming Responses */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <h2 className="font-semibold mb-1">Streaming Responses</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Real-time answers via WebSocket with source citations.
            </p>
          </div>
          {/* Configurable Backends */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <h2 className="font-semibold mb-1">Configurable Backends</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Choose Chroma (local) or Weaviate (remote) vector DB.
            </p>
          </div>
          {/* Upload PDFs */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <h2 className="font-semibold mb-1">Upload PDFs</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Send one or more PDF files to the server; they’re saved under PDFS_DIR for ingestion.
            </p>
          </div>
          {/* Ingest PDFs */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <h2 className="font-semibold mb-1">Ingest PDFs</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Index uploaded PDFs into the selected backend with metrics and status feedback.
            </p>
          </div>
        </section>

        {/* Upload PDFs */}
        <section className="w-full max-w-4xl">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">{/* slightly tighter padding */}
            <h3 className="font-semibold">Upload PDFs</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Upload one or more PDF files to the server. They will be saved under the server's PDFS_DIR and can be ingested below.
            </p>
            <UploadPdfs />
          </div>
        </section>

        {/* Ingest PDFs */}
        <section className="w-full max-w-4xl">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">{/* slightly tighter padding */}
            <h3 className="font-semibold">Ingest PDFs</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Trigger indexing of PDFs on the backend. Use force reset to rebuild the vector store when changing embeddings or backend.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm">Backend:</label>
              <select
                className="border rounded px-2 py-1"
                value={backend}
                onChange={(e) => setBackend(e.target.value as BackendKind)}
              >
                <option value="chroma">Chroma</option>
                <option value="weaviate">Weaviate</option>
              </select>
              <label className="flex items-center gap-2 text-sm ml-2">
                <input
                  type="checkbox"
                  checked={forceReset}
                  onChange={(e) => setForceReset(e.target.checked)}
                />
                Force reset
              </label>
              <button
                onClick={ingest}
                disabled={ingesting}
                className="ml-auto rounded bg-primary text-white px-4 py-2 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Ingest PDFs
                {ingesting && (
                  <span
                    aria-label="Loading"
                    className="inline-block w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin"
                  />
                )}
              </button>
            </div>
            {ingestStatus && (
              <div className="text-sm text-gray-700 dark:text-gray-200">{ingestStatus}</div>
            )}
          </div>
        </section>

        {/* How it works */}
        <section className="w-full max-w-4xl">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5">{/* slightly tighter padding */}
            <h3 className="font-semibold mb-2">How it works</h3>
            <ul className="list-disc ml-5 text-sm text-gray-700 dark:text-gray-200 space-y-1">
              <li>Discover and load PDFs from the server’s PDFS_DIR.</li>
              <li>Split documents into chunks and compute embeddings.</li>
              <li>Produce chunks and index them into the selected backend (Chroma or Weaviate).</li>
              <li>Track ingest metrics: documents_loaded, files_indexed, chunks_produced, and chunks_indexed.</li>
              <li>Return status and any errors; rerun with Force reset when changing providers/backends.</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
