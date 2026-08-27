// storage.service.ts — Supabase Storage access for dataset files.
//
// Files are uploaded DIRECTLY from the browser to Supabase Storage using a
// short-lived signed upload URL minted here — the large dataset binary never
// passes through the Next.js server (which on Vercel has a small request-body
// limit and a short function timeout). This service does two things:
//   1. mint signed upload URLs (createDatasetUploadUrl)
//   2. inspect / derive URLs for objects the client has already uploaded
//      (getStoredObject, getSamplePublicUrl) when the dataset row is created.
//
// Thumbnails are intentionally NOT handled here for now.

import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { slugify } from '@/utils/slugify'

// Service-role client: server-only, bypasses RLS so we can write to the private
// binaries bucket and read object metadata. NEVER import this into client code.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

/**
 * The two kinds of dataset files we store:
 *   - `binary` → the actual paid dataset, in the PRIVATE `dataset-binaries`
 *     bucket. We persist the storage path and sign a download URL on demand.
 *   - `sample` → a free preview, in the PUBLIC `dataset-samples` bucket. We
 *     persist the permanent CDN URL.
 */
export type DatasetFileKind = 'binary' | 'sample'

const FILE_KIND_CONFIG: Record<DatasetFileKind, { bucket: string; prefix: string }> = {
  binary: { bucket: 'dataset-binaries', prefix: 'datasets' },
  sample: { bucket: 'dataset-samples', prefix: 'samples' },
}

// Escapes a string for safe interpolation into a RegExp.
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Pulls a safe extension (1–10 alphanumerics) off a file name. Anything weird —
// path segments, dotfiles, missing extension — falls back to `bin`, so a crafted
// `fileName` can't smuggle characters into the object key.
function safeExtension(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  return /^[a-z0-9]{1,10}$/.test(ext) ? ext : 'bin'
}

/**
 * Deterministic object key for a dataset file: `${prefix}/${slug}.${ext}`.
 * Derived entirely server-side from the dataset title + uploaded file name, so
 * the same title always maps to the same key (one file per dataset per kind).
 */
export function buildObjectPath(kind: DatasetFileKind, title: string, fileName: string): string {
  const slug = slugify(title)
  const ext = safeExtension(fileName)
  return `${FILE_KIND_CONFIG[kind].prefix}/${slug}.${ext}`
}

/**
 * Validates that a client-supplied object path is exactly the key we would have
 * generated for this dataset title — `${prefix}/${slug}.${ext}` and nothing else.
 * Guards against a client pointing the dataset row at some other tenant's file.
 */
export function isExpectedPath(kind: DatasetFileKind, title: string, path: string): boolean {
  const { prefix } = FILE_KIND_CONFIG[kind]
  const slug = slugify(title)
  const pattern = new RegExp(`^${escapeRegex(prefix)}/${escapeRegex(slug)}\\.[a-z0-9]{1,10}$`)
  return pattern.test(path)
}

export interface SignedUpload {
  bucket: string
  path: string
  token: string
  signedUrl: string
}

/**
 * Mints a short-lived signed upload URL the browser uses to send the file bytes
 * straight to Supabase Storage. `upsert: true` lets a seller re-upload (replace)
 * the file for the same dataset without erroring on a duplicate key.
 */
export async function createDatasetUploadUrl(
  kind: DatasetFileKind,
  title: string,
  fileName: string
): Promise<SignedUpload> {
  const { bucket } = FILE_KIND_CONFIG[kind]
  const path = buildObjectPath(kind, title, fileName)

  logger.info({ bucket, path, kind }, 'storage.service: creating signed upload URL')

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path, { upsert: true })

  if (error || !data) {
    logger.error(
      { err: error?.message, bucket, path },
      'storage.service: failed to create signed upload URL'
    )
    throw new Error(`Could not create upload URL: ${error?.message ?? 'unknown error'}`)
  }

  logger.info({ bucket, path }, 'storage.service: signed upload URL created')
  return { bucket, path, token: data.token, signedUrl: data.signedUrl }
}

export interface StoredObject {
  path: string
  sizeBytes: number | null
}

/**
 * Confirms an object actually exists in storage (the client claims it uploaded
 * one) and returns its size. Returns `null` when the object isn't found — the
 * caller should treat that as a bad request (file never uploaded), not a 500.
 */
export async function getStoredObject(
  kind: DatasetFileKind,
  path: string
): Promise<StoredObject | null> {
  const { bucket } = FILE_KIND_CONFIG[kind]

  const { data, error } = await supabase.storage.from(bucket).info(path)

  if (error || !data) {
    logger.warn(
      { err: error?.message, bucket, path },
      'storage.service: object not found in storage'
    )
    return null
  }

  return { path, sizeBytes: data.size ?? null }
}

/**
 * Permanent public CDN URL for an object in the (public) samples bucket.
 * No network call — the URL is derived from the path.
 */
export function getSamplePublicUrl(path: string): string {
  const { bucket } = FILE_KIND_CONFIG.sample
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

/**
 * Mints a short-lived signed URL to DOWNLOAD an object from a private bucket —
 * used for the paid `binary` file, whose bucket is private, so a stored path
 * (not a public URL) is what we sign on demand at download time. `download: true`
 * makes the browser save the file (Content-Disposition: attachment) rather than
 * render it. Returns `null` on failure so the caller can 404/500 cleanly.
 */
export async function createSignedDownloadUrl(
  kind: DatasetFileKind,
  path: string,
  expiresInSeconds = 60
): Promise<string | null> {
  const { bucket } = FILE_KIND_CONFIG[kind]

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds, { download: true })

  if (error || !data) {
    logger.error(
      { err: error?.message, bucket, path },
      'storage.service: failed to create signed download URL'
    )
    return null
  }

  return data.signedUrl
}
