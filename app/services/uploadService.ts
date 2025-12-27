import { uploadPdfs } from "../api/upload";
import type { UploadResult } from "../models/upload";

export async function runUpload(files: FileList | File[]): Promise<UploadResult> {
  let fileList: FileList;
  if (Array.isArray(files)) {
    const dt = new DataTransfer();
    for (const f of files) dt.items.add(f);
    fileList = dt.files;
  } else {
    fileList = files;
  }
  const data = await uploadPdfs(fileList);
  return data as UploadResult;
}
