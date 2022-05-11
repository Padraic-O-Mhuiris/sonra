import { ethers } from 'ethers'
import { z } from 'zod'
import { withGetType } from 'zod-to-ts'
import { Address } from '../address'
import { categoryAddressType } from '../codegen/utils'

export type ZodAddress<T extends string = ''> = z.ZodType<Address<T>>

const isAddress = (_val: string): _val is Address =>
  ethers.utils.isAddress(_val)

export const address = <T extends string = ''>(_category?: T): ZodAddress<T> =>
  withGetType<ZodAddress<T>>(
    z.custom<Address<T>>(
      (val) =>
        z
          .string()
          .refine((_val) => {
            if (_category) {
              if (!_val.includes(':')) return false
              const [category, address] = _val.split(':')
              if (category !== _category) return false
              return isAddress(address)
            } else {
              return isAddress(_val)
            }
          })
          .safeParse(val).success,
    ),
    (ts) =>
      ts.factory.createIdentifier(
        _category ? categoryAddressType(_category) : 'Address',
      ),
  )
