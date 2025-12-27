import { useState, useRef, useEffect } from "react";
import type { ReactElement } from "react";
import { runUpload } from "../services/uploadService";

export function UploadPdfs(): ReactElement {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect((): void => {
    if (files.length === 0 && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [files.length]);

  function onSelect(e: React.ChangeEvent<HTMLInputElement>): void {
    const list = e.target.files;
    if (!list || list.length === 0) {
      setFiles([]);
      return;
    }
    setFiles(Array.from(list));
  }

  function openPicker(): void {
    inputRef.current?.click();
  }

  function removeAt(index: number): void {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0 && inputRef.current) {
        inputRef.current.value = "";
      }
      return next;
    });
  }

  async function onUpload(): Promise<void> {
    if (!files || files.length === 0) {
      setStatus("Please choose one or more PDF files to upload.");
      return;
    }
    setBusy(true);
    setStatus("Uploading PDFs…");
    try {
      const data = await runUpload(files);
      const saved = Array.isArray(data?.saved) ? data.saved.length : 0;
      const skipped = Array.isArray(data?.skipped) ? data.skipped.length : 0;
      const dest = data?.dest_dir ?? "server";
      setStatus(`Uploaded: ${saved}, Skipped: ${skipped}. Saved under ${dest}.`);
      setFiles([]);
      if (inputRef.current) inputRef.current.value = "";
    } catch (e: unknown) {
      setStatus("Failed to upload. Ensure the server is reachable and accepts multipart/form-data.");
    } finally {
      setBusy(false);
    }
  }

  const countLabel: string = files.length === 0 ? "No files selected" : files.length === 1 ? "1 file" : `${files.length} files`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          onChange={onSelect}
          className="sr-only"
          aria-label="Choose PDF files"
        />
        <button
          type="button"
          onClick={openPicker}
          className="rounded border border-gray-300 px-3 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Choose files
        </button>
        <span className="text-xs text-gray-600 dark:text-gray-300">{countLabel}</span>
        <button
          onClick={onUpload}
          disabled={busy}
          className="rounded bg-secondary text-white px-4 py-2 disabled:opacity-50 hover:opacity-90"
        >
          {busy ? "Uploading…" : "Upload PDFs"}
        </button>
      </div>

      {files.length > 0 && (
        <ul className="text-sm text-gray-700 dark:text-gray-200 space-y-1">
          {files.map((f: File, i: number) => (
            <li key={i} className="flex items-center justify-between">
              <span className="truncate max-w-[70%]">{f.name}</span>
              <button
                type="button"
                onClick={(): void => removeAt(i)}
                className="ml-3 inline-flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                aria-label={`Remove ${f.name}`}
                title={`Remove ${f.name}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {status && <div className="text-sm text-gray-700 dark:text-gray-200">{status}</div>}
    </div>
  );
}
