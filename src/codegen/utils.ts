import { Address } from '../zod'
import { capitalize } from '../utils'
// export const categoryLabel = ({
//   category,
//   categoryPostFix = undefined,
//   address = undefined,
//   capital = false,
//   postFix = false,
// }: {
//   category: string
//   categoryPostFix?: string
//   address?: zx.Address
//   capital?: boolean
//   postFix?: boolean
// }) => {
//   let label = `${category}`
//   label += categoryPostFix ? `${categoryPostFix}` : ''
//   label += postFix && !!address ? `_${address.slice(0, 6)}` : ''
//   return capital ? capitalize(label) : label
// }

const ADDRESS_START = 0
const ADDRESS_END = 6

export const addressConstant = (category: string) => `${category}Address`

export const addressConstantWithPostFix = (
  category: string,
  address: Address,
) => `${addressConstant(category)}_${address.slice(ADDRESS_START, ADDRESS_END)}`

export const categoryAddressType = (category: string) =>
  capitalize(addressConstant(category))
