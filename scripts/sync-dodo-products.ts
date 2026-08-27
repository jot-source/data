/**
 * scripts/sync-dodo-products.ts
 *
 * Standalone CLI script to backfill Dodo Payment Product IDs for existing datasets
 * in the database that have `dodoProductId === null`.
 *
 * Usage:
 *   npx tsx scripts/sync-dodo-products.ts
 *   npx tsx scripts/sync-dodo-products.ts --dry-run
 */

// Load env files FIRST — this import must stay above all app imports.
// ES module imports are hoisted and evaluated in order, so an inline
// dotenv.config() here would run *after* the app imports below (defeating
// its purpose). Isolating it in a module and importing it first fixes that:
// tsx doesn't auto-load env files the way Next.js does, so without this the
// Dodo client throws "DODO_PAYMENTS_API_KEY is missing".
import './load-env'

import { prisma } from '../src/lib/prisma'
import { createDatasetProduct } from '../src/services/payment.service'
import { logger } from '../src/lib/logger'

async function main() {
  const isDryRun = process.argv.includes('--dry-run')
  console.log(`Starting Dodo Product Sync Backfill ${isDryRun ? '(DRY RUN)' : ''}...`)

  const datasetsWithoutProduct = await prisma.dataset.findMany({
    where: {
      OR: [
        { dodoProductId: null },
        { dodoProductId: '' },
      ],
    },
    select: {
      id: true,
      title: true,
      price: true,
      currency: true,
      dodoProductId: true,
    },
  })

  console.log(`Found ${datasetsWithoutProduct.length} dataset(s) missing Dodo Product IDs.`)

  let successCount = 0
  let failCount = 0

  for (const dataset of datasetsWithoutProduct) {
    const priceNum = Number(dataset.price)
    const currency = dataset.currency || 'USD'

    console.log(`Processing: "${dataset.title}" (ID: ${dataset.id}) — Price: $${priceNum} ${currency}`)

    if (isDryRun) {
      console.log(`  [DRY RUN] Would create Dodo Product for "${dataset.title}"`)
      successCount++
      continue
    }

    try {
      const dodoProductId = await createDatasetProduct({
        title: dataset.title,
        price: priceNum,
        currency,
      })

      await prisma.dataset.update({
        where: { id: dataset.id },
        data: { dodoProductId },
      })

      console.log(`  ✓ Created Dodo Product ID: ${dodoProductId}`)
      successCount++
    } catch (error) {
      console.error(`  ✗ Failed to process "${dataset.title}":`, error)
      failCount++
    }
  }

  console.log(`\nSync Summary: ${successCount} succeeded, ${failCount} failed out of ${datasetsWithoutProduct.length} total.`)
}

main()
  .catch((e) => {
    logger.error({ error: e }, 'sync-dodo-products script failed')
    console.error('Fatal error during sync script execution:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
