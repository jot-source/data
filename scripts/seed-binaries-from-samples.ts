/**
 * scripts/seed-binaries-from-samples.ts
 *
 * PLACEHOLDER binaries: until real dataset files are uploaded, this makes the
 * paid "Download dataset" flow work by copying each dataset's public SAMPLE into
 * the PRIVATE `dataset-binaries` bucket and pointing `dataset.binaryUrl` at it.
 * The gated /download endpoint then signs a real private URL as normal.
 *
 * So for now the "main dataset" download === the sample content. Swap in real
 * binaries later by re-uploading + updating `binaryUrl` (this script is a stopgap).
 *
 * Run: npx tsx scripts/seed-binaries-from-samples.ts
 *      npx tsx scripts/seed-binaries-from-samples.ts --dry-run
 */
import './load-env'

import { createClient } from '@supabase/supabase-js'
import { prisma } from '../src/lib/prisma'

const SAMPLES_BUCKET = 'dataset-samples'
const BINARIES_BUCKET = 'dataset-binaries'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const CONTENT_TYPES: Record<string, string> = {
  csv: 'text/csv',
  json: 'application/json',
  zip: 'application/zip',
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run')
  console.log(`\nSeeding private binaries from samples ${isDryRun ? '(DRY RUN)' : ''}...\n`)

  const datasets = await prisma.dataset.findMany({
    where: { sampleUrl: { not: null } },
    select: { id: true, slug: true, sampleUrl: true },
    orderBy: { datasetCode: 'asc' },
  })

  let ok = 0
  let failed = 0

  for (const d of datasets) {
    // The sample's object path is everything after the bucket name in the URL.
    const marker = `/${SAMPLES_BUCKET}/`
    const idx = d.sampleUrl!.indexOf(marker)
    if (idx === -1) {
      console.warn(`  ✗ ${d.slug}: can't parse sample path from ${d.sampleUrl}`)
      failed++
      continue
    }
    const samplePath = d.sampleUrl!.slice(idx + marker.length)
    const ext = samplePath.split('.').pop()?.toLowerCase() || 'csv'
    const binaryPath = `datasets/${d.slug}.${ext}`

    if (isDryRun) {
      console.log(`  [DRY RUN] ${samplePath}  →  ${BINARIES_BUCKET}/${binaryPath}`)
      ok++
      continue
    }

    // Pull the sample bytes back down (works for generated samples and the
    // manually-uploaded one alike) and push them into the private bucket.
    const { data: blob, error: dlErr } = await supabase.storage.from(SAMPLES_BUCKET).download(samplePath)
    if (dlErr || !blob) {
      console.error(`  ✗ ${d.slug}: download failed — ${dlErr?.message}`)
      failed++
      continue
    }
    const buffer = Buffer.from(await blob.arrayBuffer())

    const { error: upErr } = await supabase.storage.from(BINARIES_BUCKET).upload(binaryPath, buffer, {
      upsert: true,
      contentType: CONTENT_TYPES[ext] ?? 'application/octet-stream',
    })
    if (upErr) {
      console.error(`  ✗ ${d.slug}: upload failed — ${upErr.message}`)
      failed++
      continue
    }

    await prisma.dataset.update({
      where: { id: d.id },
      data: { binaryUrl: binaryPath, fileSizeBytes: BigInt(buffer.byteLength) },
    })

    console.log(`  ✓ ${d.slug} → ${BINARIES_BUCKET}/${binaryPath} (${buffer.byteLength} bytes)`)
    ok++
  }

  console.log(`\nDone: ${ok} seeded, ${failed} failed — ${datasets.length} datasets with a sample.`)
}

main()
  .catch((e) => {
    console.error('seed-binaries-from-samples failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
