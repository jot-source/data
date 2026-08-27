// download.service.ts — the `Download` audit trail.
//
// One row is written each time a buyer's browser is handed a signed URL for the
// paid binary (see GET /api/v1/datasets/[id]/download). The `ipAddress` +
// `downloadedAt` columns capture *who* pulled the file and *when* — which is why
// the row is created here, at real download time, and NOT in the Dodo webhook
// (that request comes from Dodo's servers, so it would record the wrong IP and
// conflate "paid" with "downloaded").
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function recordDownload(params: {
  userId: string
  datasetId: string
  orderId: string
  ipAddress: string | null
}) {
  const { userId, datasetId, orderId, ipAddress } = params

  logger.info({ userId, datasetId, orderId }, 'download.service: recording download')

  return prisma.download.create({
    data: { userId, datasetId, orderId, ipAddress },
  })
}
