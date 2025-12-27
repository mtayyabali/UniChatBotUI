// Ingest-related models
import type { BackendKind } from "./chat";

export type IngestRequest = { backend: BackendKind; force_reset: boolean };
export type IngestResponse = {
  backend: BackendKind;
  chunks_indexed: number;
  chunks_produced: number;
  documents_loaded: number;
  errors: [];
  files_indexed: number;
  status: string;
};

