import { z } from 'zod'

export const erc20 = z.object({
  name: z.string(),
  symbol: z.string(),
  decimals: z.number(),
})
