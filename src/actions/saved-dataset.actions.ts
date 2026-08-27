// actions/saved-dataset.actions.ts
// Server actions for the dataset save/bookmark (wishlist) feature.
'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/services/auth.service'
import { logger } from '@/lib/logger'

/**
 * Toggle save/unsave a dataset for the current user.
 * If already saved → deletes the row (unsaves).
 * If not saved → creates the row (saves).
 * Returns the new saved state.
 */
export async function toggleSaveDataset(datasetId: string) {
  const cookieStore = await cookies()
  const userId = await getSessionUserId(cookieStore)

  if (!userId) {
    return { error: 'You must be signed in to save datasets.' }
  }

  try {
    const existing = await prisma.savedDataset.findUnique({
      where: { userId_datasetId: { userId, datasetId } },
    })

    if (existing) {
      await prisma.savedDataset.delete({
        where: { id: existing.id },
      })
      logger.info({ userId, datasetId }, 'saved-dataset.actions: unsaved')
      revalidatePath('/profile')
      return { saved: false }
    }

    await prisma.savedDataset.create({
      data: { userId, datasetId },
    })
    logger.info({ userId, datasetId }, 'saved-dataset.actions: saved')
    revalidatePath('/profile')
    return { saved: true }
  } catch (err) {
    logger.error(
      { err: (err as Error).message, userId, datasetId },
      'saved-dataset.actions: toggleSaveDataset failed'
    )
    return { error: 'Could not save dataset. Please try again.' }
  }
}

/**
 * Get all saved datasets for the current user, with enough dataset
 * detail to render wishlist cards.
 */
export async function getSavedDatasets() {
  const cookieStore = await cookies()
  const userId = await getSessionUserId(cookieStore)

  if (!userId) {
    return { datasets: [] }
  }

  try {
    const saved = await prisma.savedDataset.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        dataset: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            datasetCode: true,
            industry: true,
            category: true,
            qualityScore: true,
            fileFormat: true,
            recordCount: true,
            recordUnit: true,
            languages: true,
            countries: true,
            compliance: true,
            sampleUrl: true,
            thumbnailUrl: true,
            updatedAt: true,
          },
        },
      },
    })

    const datasets = saved.map((s) => ({
      id: s.dataset.id,
      title: s.dataset.title,
      slug: s.dataset.slug,
      description: s.dataset.description,
      datasetCode: s.dataset.datasetCode,
      industry: s.dataset.industry,
      category: s.dataset.category,
      qualityScore: s.dataset.qualityScore,
      fileFormat: s.dataset.fileFormat,
      recordCount: s.dataset.recordCount ? Number(s.dataset.recordCount) : null,
      recordUnit: s.dataset.recordUnit,
      languages: s.dataset.languages,
      countries: s.dataset.countries,
      compliance: s.dataset.compliance,
      sampleAvailable: !!s.dataset.sampleUrl,
      thumbnailUrl: s.dataset.thumbnailUrl,
      updatedAt: s.dataset.updatedAt.toISOString(),
      savedAt: s.createdAt.toISOString(),
    }))

    return { datasets }
  } catch (err) {
    logger.error(
      { err: (err as Error).message, userId },
      'saved-dataset.actions: getSavedDatasets failed'
    )
    return { datasets: [] }
  }
}

/**
 * Check if a single dataset is saved by the current user.
 */
export async function isDatasetSaved(datasetId: string) {
  const cookieStore = await cookies()
  const userId = await getSessionUserId(cookieStore)

  if (!userId) {
    return { saved: false }
  }

  try {
    const existing = await prisma.savedDataset.findUnique({
      where: { userId_datasetId: { userId, datasetId } },
      select: { id: true },
    })
    return { saved: !!existing }
  } catch (err) {
    logger.error(
      { err: (err as Error).message, userId, datasetId },
      'saved-dataset.actions: isDatasetSaved failed'
    )
    return { saved: false }
  }
}

/**
 * Get the set of dataset IDs saved by the current user.
 * Useful for bulk-checking on list pages (explore).
 */
export async function getSavedDatasetIds(): Promise<Set<string>> {
  const cookieStore = await cookies()
  const userId = await getSessionUserId(cookieStore)

  if (!userId) return new Set()

  try {
    const rows = await prisma.savedDataset.findMany({
      where: { userId },
      select: { datasetId: true },
    })
    return new Set(rows.map((r) => r.datasetId))
  } catch (err) {
    logger.error(
      { err: (err as Error).message, userId },
      'saved-dataset.actions: getSavedDatasetIds failed'
    )
    return new Set()
  }
}
