import { address } from './address'
import { z } from 'zod'
import { Address } from '../address'

export type ZodAddressArray = z.ZodType<[Address, ...Address[]]>

export const addressArray = (): ZodAddressArray =>
  z.custom(
    (val) =>
      address()
        .array()
        .refine((arr) => arr.length !== 0)
        .safeParse(val).success,
  )
