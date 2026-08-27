import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getSessionUser } from '@/services/auth.service'
import { createDatasetUploadUrl } from '@/services/storage.service'
import { uploadUrlSchema } from '@/validations/dataset.schema'
import { logger } from '@/lib/logger'

/**
 * POST /api/v1/datasets/upload-url
 *
 * Step 1 of the two-step dataset upload. Mints a short-lived signed URL the
 * client uses to upload ONE dataset file (binary or sample) DIRECTLY to Supabase
 * Storage — the bytes never pass through this server (Vercel body-size limit).
 *
 * Restricted to seller / admin (same gate as creating the dataset).
 *
 * Request (JSON):  { title, kind: 'binary' | 'sample', fileName }
 * Response (JSON): { success, data: { bucket, path, token, signedUrl } }
 *
 * The client then uploads with the Supabase JS client:
 *   supabase.storage.from(bucket).uploadToSignedUrl(path, token, file)
 * and finally calls POST /api/v1/datasets with the returned `path`.
 */
export async function POST(request: NextRequest) {
  // ── 1. Auth — seller/admin only ───────────────────────────
  const cookieStore = await cookies()
  const user = await getSessionUser(cookieStore)

  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  if (!['seller', 'admin'].includes(user.role)) {
    logger.warn(
      { userId: user.id, role: user.role },
      'POST /api/v1/datasets/upload-url — forbidden attempt'
    )
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  // ── 2. Parse + validate JSON body ─────────────────────────
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Request body must be valid JSON.' },
      { status: 400 }
    )
  }

  const parsed = uploadUrlSchema.safeParse(body)

  if (!parsed.success) {
    logger.warn(
      { userId: user.id, issues: parsed.error.issues },
      'POST /api/v1/datasets/upload-url — validation failed'
    )
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid request.',
        details: parsed.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
      { status: 400 }
    )
  }

  const { title, kind, fileName } = parsed.data
  logger.info({ userId: user.id, kind, title }, 'POST /api/v1/datasets/upload-url — request received')

  // ── 3. Mint the signed upload URL ─────────────────────────
  try {
    const upload = await createDatasetUploadUrl(kind, title, fileName)
    return NextResponse.json({ success: true, data: upload }, { status: 200 })
  } catch (error) {
    logger.error(
      { error, userId: user.id, kind, title },
      'POST /api/v1/datasets/upload-url — failed to mint URL'
    )
    return NextResponse.json(
      { success: false, error: 'Could not create an upload URL. Please try again later.' },
      { status: 500 }
    )
  }
}
