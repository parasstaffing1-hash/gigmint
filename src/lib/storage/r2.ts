import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";

// ---------------------------------------------------------------------------
// Cloudflare R2 — S3-compatible object storage.
// Env: R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET,
//      NEXT_PUBLIC_R2_URL (public base URL, optional if using presigned GETs)
// ---------------------------------------------------------------------------

export const R2_CONFIG = {
  endpoint: process.env.R2_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  bucket: process.env.R2_BUCKET,
  publicUrl: process.env.NEXT_PUBLIC_R2_URL,
};

export function isR2Configured(): boolean {
  return Boolean(
    R2_CONFIG.endpoint &&
      R2_CONFIG.accessKeyId &&
      R2_CONFIG.secretAccessKey &&
      R2_CONFIG.bucket
  );
}

let __r2Client: S3Client | undefined;

function r2(): S3Client {
  if (!isR2Configured()) {
    throw new Error(
      "R2 is not configured. Set R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET."
    );
  }
  __r2Client ??= new S3Client({
    region: "auto",
    endpoint: R2_CONFIG.endpoint!,
    credentials: {
      accessKeyId: R2_CONFIG.accessKeyId!,
      secretAccessKey: R2_CONFIG.secretAccessKey!,
    },
  });
  return __r2Client;
}

// ---- Validation ------------------------------------------------------------

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
  "application/pdf": [".pdf"],
  "video/mp4": [".mp4"],
  "video/quicktime": [".mov"],
  "application/zip": [".zip"],
};

export function validateFile(file: {
  name: string;
  type: string;
  size: number;
}): { ok: true } | { ok: false; error: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: `File exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` };
  }
  if (!(file.type in ALLOWED_MIME_TYPES)) {
    return { ok: false, error: `File type ${file.type || "unknown"} is not allowed` };
  }
  return { ok: true };
}

/** Sanitize a filename and prefix with a timestamp + random suffix to avoid collisions. */
export function buildKey(scope: string, filename: string): string {
  const safe = filename
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(-120);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${scope}/${Date.now()}-${rand}-${safe}`;
}

// ---- Operations ------------------------------------------------------------

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

/** Server-side upload (small files, server actions). */
export async function uploadFile(
  scope: string,
  file: { name: string; type: string; size: number; buffer: Buffer }
): Promise<UploadResult> {
  const check = validateFile(file);
  if (!check.ok) throw new Error(check.error);

  const key = buildKey(scope, file.name);
  await r2().send(
    new PutObjectCommand({
      Bucket: R2_CONFIG.bucket!,
      Key: key,
      Body: file.buffer,
      ContentType: file.type,
    })
  );
  return { key, url: getPublicUrl(key), size: file.size, contentType: file.type };
}

/** Presigned PUT — browser uploads directly to R2, server never proxies bytes. */
export async function getPresignedUploadUrl(
  scope: string,
  filename: string,
  contentType: string
): Promise<{ key: string; uploadUrl: string; publicUrl: string }> {
  if (!(contentType in ALLOWED_MIME_TYPES)) {
    throw new Error(`File type ${contentType || "unknown"} is not allowed`);
  }
  const key = buildKey(scope, filename);
  const command = new PutObjectCommand({
    Bucket: R2_CONFIG.bucket!,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(r2(), command, { expiresIn: 600 });
  return { key, uploadUrl, publicUrl: getPublicUrl(key) };
}

/** Presigned GET — time-limited read access for private objects. */
export async function getPresignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({ Bucket: R2_CONFIG.bucket!, Key: key });
  return getSignedUrl(r2(), command, { expiresIn });
}

export async function deleteFile(key: string): Promise<void> {
  await r2().send(new DeleteObjectCommand({ Bucket: R2_CONFIG.bucket!, Key: key }));
}

export async function healthCheck(): Promise<boolean> {
  try {
    await r2().send(new HeadBucketCommand({ Bucket: R2_CONFIG.bucket! }));
    return true;
  } catch {
    return false;
  }
}

export function getPublicUrl(key: string): string {
  if (R2_CONFIG.publicUrl) {
    return `${R2_CONFIG.publicUrl.replace(/\/$/, "")}/${key}`;
  }
  // No public URL configured — expose via the app's download route.
  return `/api/files/${encodeURIComponent(key)}`;
}

/** Convert a web ReadableStream to Buffer (for API-route uploads). */
export async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks);
}
