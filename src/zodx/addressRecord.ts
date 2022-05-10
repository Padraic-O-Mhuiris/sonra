import { z, ZodType, ZodTypeAny } from 'zod'
import { AddressRecord } from '../address'
import { address } from './address'

export type ZodAddressRecord<Value extends ZodTypeAny = ZodTypeAny> = ZodType<
  AddressRecord<Value['_output']>
>

export const addressRecord = <T extends z.AnyZodObject>(
  zObj: T,
): ZodAddressRecord<T> =>
  z.custom(
    (val) =>
      z
        .object({})
        .passthrough()
        .refine((_val) =>
          Object.entries(_val).every(
            ([k, v]) =>
              address().safeParse(k).success && zObj.safeParse(v).success,
          ),
        )
        .safeParse(val).success,
  )
