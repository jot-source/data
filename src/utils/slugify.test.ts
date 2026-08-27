import { describe, it, expect } from 'vitest'
import { slugify } from './slugify'

describe('slugify', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugify('NSE Ticks 2024')).toBe('nse-ticks-2024')
  })

  it('strips punctuation', () => {
    expect(slugify('NSE Ticks 2024!')).toBe('nse-ticks-2024')
  })

  it('collapses repeated whitespace into a single hyphen', () => {
    expect(slugify('Global   E-Commerce    Transactions')).toBe('global-e-commerce-transactions')
  })

  it('trims leading/trailing whitespace', () => {
    expect(slugify('  Retail Footfall  ')).toBe('retail-footfall')
  })

  // The upload-url route, create route, and storage service all derive the
  // same object key from a title independently — they MUST agree byte-for-byte.
  it('is deterministic for the same input', () => {
    const title = 'Customer Support Chat Logs — SaaS Industry'
    expect(slugify(title)).toBe(slugify(title))
  })
})
