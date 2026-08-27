import { describe, it, expect } from 'vitest'
import { createCheckoutSchema } from './checkout.schema'

describe('createCheckoutSchema', () => {
  it('accepts a valid uuid datasetId', () => {
    const result = createCheckoutSchema.safeParse({
      datasetId: 'fe2d2859-78e0-4675-8a28-13339e082cc7',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a missing datasetId', () => {
    const result = createCheckoutSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects a non-uuid datasetId', () => {
    const result = createCheckoutSchema.safeParse({ datasetId: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  it('rejects an empty string datasetId', () => {
    const result = createCheckoutSchema.safeParse({ datasetId: '' })
    expect(result.success).toBe(false)
  })

  // A client could try to slip a price/amount field into the checkout request
  // body — the route only ever reads `datasetId` off the parsed result, so an
  // extra field here would be silently ignored, not trusted. This test just
  // pins that `datasetId` stays the only field the schema cares about.
  it('only validates datasetId, ignoring extra fields', () => {
    const result = createCheckoutSchema.safeParse({
      datasetId: 'fe2d2859-78e0-4675-8a28-13339e082cc7',
      amount: 1, // attempted client-supplied override — must have no effect
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ datasetId: 'fe2d2859-78e0-4675-8a28-13339e082cc7' })
    }
  })
})
