import { z } from 'zod'

export const createCheckoutSchema = z.object({
  datasetId: z.string().uuid({ message: 'datasetId must be a valid UUID' }),
})

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>
