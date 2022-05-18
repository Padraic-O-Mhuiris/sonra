import { z, ZodType, ZodTypeAny } from 'zod'
import { Address, address } from './address'

export type AddressRecord<V> = {
  [k in Address]: V
}

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
        .refine(
          (_val) =>
            Object.entries(_val).every(
              ([k, v]) =>
                address().safeParse(k).success && zObj.safeParse(v).success,
            ),
          { message: 'Could not parse as address record' },
        )
        .safeParse(val).success,
  )
