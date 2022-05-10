import { Address } from '../address'
import { capitalize } from '../utils'

const ADDRESS_START = 0
const ADDRESS_END = 6

export const addressConstant = (category: string) => `${category}Address`

export const addressConstantWithPostFix = (
  category: string,
  address: Address,
) => `${addressConstant(category)}_${address.slice(ADDRESS_START, ADDRESS_END)}`

export const categoryAddressType = (category: string) =>
  capitalize(addressConstant(category))
