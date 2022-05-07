import { Address, address } from './address'
import { z } from 'zod'

export type ZodAddressArray = z.ZodType<[Address, ...Address[]]>

export const addressArray = (): ZodAddressArray =>
  z.custom(
    (val) =>
      address()
        .array()
        .refine((arr) => arr.length !== 0)
        .safeParse(val).success,
  )
