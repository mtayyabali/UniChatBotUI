import type { BackendKind } from "../models/chat";
import { ingestPdfs } from "../api/ingest";
import type { IngestResponse } from "../models/ingest";

export async function runIngest(backend: BackendKind, force_reset: boolean): Promise<IngestResponse> {
  const data = await ingestPdfs({ backend, force_reset });
  return data;
}
