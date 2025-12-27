import type { UploadResult } from "../models/upload";

const BACKEND_HTTP = import.meta.env.VITE_BACKEND_HTTP ?? "https://unichatbot.onrender.com";

export async function uploadPdfs(files: FileList): Promise<UploadResult> {
  const form = new FormData();
  for (const file of Array.from(files)) {
    form.append("files", file, file.name);
  }
  const res = await fetch(`${BACKEND_HTTP}/upload-pdfs`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<UploadResult>;
}
