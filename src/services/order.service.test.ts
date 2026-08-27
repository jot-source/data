import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the Prisma singleton BEFORE importing order.service, so the real
// lib/prisma.ts (which opens a real pg Pool) never runs in tests.
vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      updateMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

import { prisma } from '@/lib/prisma'
import { markOrderPaid, markOrderFailed, findPaidOrder } from './order.service'

const updateManyMock = prisma.order.updateMany as ReturnType<typeof vi.fn>
const findFirstMock = prisma.order.findFirst as ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.clearAllMocks()
})

describe('order.service idempotency', () => {
  // This is the regression guard for the whole webhook-retry story: Dodo
  // retries webhook delivery on any non-2xx response, so the SAME
  // payment.succeeded event can arrive more than once. The only thing that
  // makes a second delivery a safe no-op is the `status: 'pending'` filter in
  // the update's WHERE clause — if a refactor ever drops it, this test fails.
  it('markOrderPaid only transitions an order that is currently pending', async () => {
    updateManyMock.mockResolvedValue({ count: 1 })

    await markOrderPaid({ orderId: 'order-1', dodoPaymentId: 'pay_123' })

    expect(updateManyMock).toHaveBeenCalledWith({
      where: { id: 'order-1', status: 'pending' },
      data: expect.objectContaining({ status: 'paid', dodoPaymentId: 'pay_123' }),
    })
  })

  it('markOrderPaid is a no-op when the order was already processed (count 0)', async () => {
    updateManyMock.mockResolvedValue({ count: 0 })

    // Must not throw — a duplicate webhook delivery should resolve quietly.
    await expect(
      markOrderPaid({ orderId: 'order-1', dodoPaymentId: 'pay_123' })
    ).resolves.toBeUndefined()

    expect(updateManyMock).toHaveBeenCalledTimes(1)
  })

  it('markOrderFailed only transitions an order that is currently pending', async () => {
    updateManyMock.mockResolvedValue({ count: 1 })

    await markOrderFailed({ orderId: 'order-2' })

    expect(updateManyMock).toHaveBeenCalledWith({
      where: { id: 'order-2', status: 'pending' },
      data: expect.objectContaining({ status: 'failed' }),
    })
  })

  it('markOrderFailed is a no-op when the order was already processed (count 0)', async () => {
    updateManyMock.mockResolvedValue({ count: 0 })

    await expect(markOrderFailed({ orderId: 'order-2' })).resolves.toBeUndefined()
  })

  // Blocks re-purchasing a dataset the user already owns — only an existing
  // `paid` order for that exact user+dataset pair should count.
  it('findPaidOrder filters by userId, datasetId, and status paid', async () => {
    findFirstMock.mockResolvedValue(null)

    await findPaidOrder('user-1', 'dataset-1')

    expect(findFirstMock).toHaveBeenCalledWith({
      where: { userId: 'user-1', datasetId: 'dataset-1', status: 'paid' },
    })
  })
})
