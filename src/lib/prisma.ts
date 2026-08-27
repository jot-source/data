// lib/prisma.ts — Prisma 7 singleton for Supabase PostgreSQL
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // transaction-mode pooler for runtime
    // On Vercel, every warm serverless instance keeps its OWN pool. An uncapped
    // pool (pg default max = 10) × many concurrent instances can blow past the
    // Supabase pooler's client-connection limit and cause "too many connections"
    // under load. A serverless function handles one request at a time, so 1
    // connection is enough in production; locally we keep a few for the
    // long-running dev process. Override with DATABASE_POOL_MAX if you enable
    // Vercel Fluid Compute (concurrent invocations per instance).
    max: Number(
      process.env.DATABASE_POOL_MAX ??
        (process.env.NODE_ENV === 'production' ? 1 : 10)
    ),
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma