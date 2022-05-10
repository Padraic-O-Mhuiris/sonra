import { ethers } from 'ethers'
import { z } from 'zod'
import { withGetType } from 'zod-to-ts'
import { Address } from '../address'
import { categoryAddressType } from '../codegen/utils'

export type ZodAddress<T extends string = ''> = z.ZodType<Address<T>>

// export const _address: ZodAddress = withGetType<ZodAddress>(
//   z.string().refine((x: string): x is Address => ethers.utils.isAddress(x)),
//   (ts) => ts.factory.createIdentifier('Address'),
// )

const validateAddress = (_val: string): _val is Address =>
  ethers.utils.isAddress(_val)

export const address = <T extends string = ''>(_category?: T): ZodAddress<T> =>
  withGetType<ZodAddress<T>>(
    z.custom<Address<T>>(
      (val) =>
        z
          .string()
          .refine((_val) => {
            const valIsAddress = validateAddress(_val)

            if (!valIsAddress) {
              if (!_val.includes(':')) return false
              const [category, address] = _val.split(':')
              if (category !== _category) return false
              return validateAddress(address)
            } else {
              return true
            }
          })
          .safeParse(val).success,
    ),
    (ts) =>
      ts.factory.createIdentifier(
        _category ? categoryAddressType(_category) : 'Address',
      ),
  )
