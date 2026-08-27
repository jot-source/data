/**
 * scripts/inspect-samples.ts — READ-ONLY
 *
 * Prints the current state of dataset samples:
 *   1. every object already in the public `dataset-samples` bucket
 *   2. every dataset's title / slug / fileFormat / current sampleUrl
 *
 * Run: npx tsx scripts/inspect-samples.ts
 */
import './load-env'

import { createClient } from '@supabase/supabase-js'
import { prisma } from '../src/lib/prisma'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function main() {
  console.log('\n=== Objects in dataset-samples bucket ===')
  const { data: objects, error } = await supabase.storage
    .from('dataset-samples')
    .list('samples', { limit: 1000 })

  if (error) {
    console.error('  Could not list bucket:', error.message)
  } else if (!objects || objects.length === 0) {
    console.log('  (empty)')
  } else {
    for (const o of objects) {
      console.log(`  samples/${o.name}  (${o.metadata?.size ?? '?'} bytes)`)
    }
  }

  console.log('\n=== Datasets ===')
  const datasets = await prisma.dataset.findMany({
    select: { title: true, slug: true, fileFormat: true, sampleUrl: true },
    orderBy: { datasetCode: 'asc' },
  })

  for (const d of datasets) {
    console.log(
      `  [${d.fileFormat ?? '—'}] ${d.title}\n      slug: ${d.slug}\n      sampleUrl: ${d.sampleUrl ?? 'null'}`
    )
  }
  console.log(`\n  Total: ${datasets.length} datasets`)
}

main()
  .catch((e) => {
    console.error('inspect-samples failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
