/**
 * scripts/verify-dodo-products.ts
 *
 * Guarantees EVERY dataset is purchasable: for each row it checks that
 * `dodoProductId` is set AND that the product actually resolves in Dodo
 * (`dodo.products.retrieve`). A missing OR stale/invalid id (e.g. created in a
 * different Dodo account/environment) is (re)created via `createDatasetProduct`
 * and written back — so checkout can never 400 with "not available for purchase"
 * or hit a Dodo error on an unknown product.
 *
 * Run: npx tsx scripts/verify-dodo-products.ts
 *      npx tsx scripts/verify-dodo-products.ts --dry-run
 */
import './load-env'

import { prisma } from '../src/lib/prisma'
import { dodo } from '../src/lib/dodo'
import { createDatasetProduct } from '../src/services/payment.service'

async function productExists(productId: string): Promise<boolean> {
  try {
    await dodo.products.retrieve(productId)
    return true
  } catch {
    // Any error (404 unknown product, wrong environment, etc.) → treat as invalid.
    return false
  }
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run')
  console.log(`\nVerifying Dodo products for every dataset ${isDryRun ? '(DRY RUN)' : ''}...\n`)

  const datasets = await prisma.dataset.findMany({
    select: { id: true, title: true, price: true, currency: true, dodoProductId: true },
    orderBy: { datasetCode: 'asc' },
  })

  let valid = 0
  let created = 0
  let recreated = 0
  let failed = 0

  for (const d of datasets) {
    const ok = d.dodoProductId ? await productExists(d.dodoProductId) : false

    if (ok) {
      console.log(`  ✓ ${d.title} — ${d.dodoProductId}`)
      valid++
      continue
    }

    const reason = d.dodoProductId ? `invalid id (${d.dodoProductId})` : 'no id'
    console.log(`  ⟳ ${d.title} — ${reason}, needs a product`)

    if (isDryRun) {
      d.dodoProductId ? recreated++ : created++
      continue
    }

    try {
      const productId = await createDatasetProduct({
        title: d.title,
        price: Number(d.price),
        currency: d.currency || 'USD',
      })
      await prisma.dataset.update({ where: { id: d.id }, data: { dodoProductId: productId } })
      console.log(`     → set ${productId}`)
      d.dodoProductId ? recreated++ : created++
    } catch (error) {
      console.error(`     ✗ failed to create product for "${d.title}":`, error)
      failed++
    }
  }

  console.log(
    `\nDone: ${valid} already valid, ${created} created (was missing), ${recreated} recreated (was invalid), ${failed} failed — ${datasets.length} datasets total.`
  )
}

main()
  .catch((e) => {
    console.error('verify-dodo-products failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
