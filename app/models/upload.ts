// Upload-related models
export type UploadResult = {
  saved?: Array<{ filename: string }>;
  skipped?: Array<{ filename: string }>;
  dest_dir?: string;
};

