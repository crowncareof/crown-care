import { supabaseAdmin } from "./admin";

// Bucket names — must be created in Supabase dashboard
export const BUCKETS = {
  PORTFOLIO: "portfolio",
  SERVICES:  "services",
  GENERAL:   "general",
} as const;

type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

/**
 * Upload a file to Supabase Storage.
 * Returns the public URL of the uploaded file.
 */
export async function uploadFile(
  bucket: BucketName,
  path: string,
  file: File | Buffer,
  contentType?: string
): Promise<string> {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: true,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteFile(
  bucket: BucketName,
  path: string
): Promise<void> {
  const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
  if (error) throw new Error(`Storage delete failed: ${error.message}`);
}

/**
 * Generate a unique file path for uploads.
 * Format: {prefix}/{timestamp}-{random}.{ext}
 */
export function generateFilePath(
  prefix: string,
  originalName: string
): string {
  const ext = originalName.split(".").pop() ?? "jpg";
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}/${timestamp}-${random}.${ext}`;
}
