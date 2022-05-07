import { BigNumber } from 'ethers'
import { capitalize } from '../utils'
import * as zx from '../zod'

export const categoryLabel = ({
  category,
  categoryPostFix = undefined,
  address = undefined,
  capital = false,
  postFix = false,
}: {
  category: string
  categoryPostFix?: string
  address?: zx.Address
  capital?: boolean
  postFix?: boolean
}) => {
  let label = `${category}`
  label += categoryPostFix ? `${categoryPostFix}` : ''
  label += postFix && !!address ? `_${address.slice(0, 6)}` : ''
  return capital ? capitalize(label) : label
}

export function parseMetadata(obj: { [k in string]: any }): string {
  const entries = Object.entries(obj)

  const stringifiedObjList = entries.reduce((acc, [key, val]) => {
    if (BigNumber.isBigNumber(val)) {
      return (acc += `  ${key}: BigNumber('${val.toString()}'),\n`)
    }

    if (val instanceof Date) {
      return (acc += `  ${key}: new Date('${val.toJSON()}'),\n`)
    }

    if (val instanceof Object) {
      return (acc += `  ${key}: ${parseMetadata(val)},\n`)
    }

    if (typeof val === 'string') {
      if (val.includes(':')) {
        const [category, _address] = val.split(':')
        const address = zx.address().safeParse(_address)
        if (address.success) {
          return (acc += `  ${key}: ${categoryLabel({
            category,
            address: address.data,
            postFix: true,
          })},\n`)
        }
      }
    }

    return (acc += `  ${key}: ${JSON.stringify(val, null, 2)},\n`)
  }, '')

  return `{\n${stringifiedObjList}}`
}
