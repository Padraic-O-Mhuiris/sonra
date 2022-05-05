import { BigNumber } from 'ethers'
import { z } from 'zod'
import * as zx from '../zod'

enum TrieLabel {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  BIGNUMBER = 'BIGNUMBER',
  DATE = 'DATE',
  ADDRESS = 'ADDRESS',
  TAGADDRESS = 'TAGADDRESS',
  ARRAY = 'ARRAY',
  OBJECT = 'OBJECT',
}

type TrieObject<L extends TrieLabel> = [
  string,
  L,
  {
    [TrieLabel.STRING]: string
    [TrieLabel.NUMBER]: number
    [TrieLabel.BOOLEAN]: boolean
    [TrieLabel.BIGNUMBER]: BigNumber
    [TrieLabel.DATE]: Date
    [TrieLabel.ADDRESS]: zx.Address
    [TrieLabel.TAGADDRESS]: zx.CategorisedAddress<string>
    [TrieLabel.ARRAY]: Array<TrieValue>
    [TrieLabel.OBJECT]: TrieObject<TrieLabel>
  }[L],
]

export type TrieValue =
  | string
  | number
  | boolean
  | BigNumber
  | Date
  | zx.Address
  | zx.CategorisedAddress<string>
  | TrieObject<TrieLabel>
  | Array<TrieValue>

export type Trie = TrieObject<TrieLabel>[]

function classifyTrieValue(val: any): TrieLabel {
  if (z.string().safeParse(val).success) {
    if (
      (val as string).includes(':') &&
      zx.address().safeParse((val as string).split(':')[1]).success
    ) {
      return TrieLabel.TAGADDRESS
    }
    if (zx.address().safeParse(val).success) {
      return TrieLabel.ADDRESS
    }
    return TrieLabel.STRING
  }
  if (z.number().safeParse(val).success) {
    return TrieLabel.NUMBER
  }
  if (z.boolean().safeParse(val).success) {
    return TrieLabel.BOOLEAN
  }
  if (z.date().safeParse(val).success) {
    return TrieLabel.DATE
  }
  if (BigNumber.isBigNumber(val)) {
    return TrieLabel.BIGNUMBER
  }
  if (typeof val === 'object' && !Array.isArray(val) && val !== null) {
    return TrieLabel.OBJECT
  }
  return TrieLabel.ARRAY
}

export function buildTrie(obj: { [k in string]: any }): Trie {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const valueLabel = classifyTrieValue(value)
    console.log([key, valueLabel, value])
    if (valueLabel === TrieLabel.OBJECT) {
      value = buildTrie(value)
    }

    if (valueLabel === TrieLabel.ARRAY) {
      value = (value as any[]).map((v) => buildTrie(v))
    }

    return [...acc, [key, classifyTrieValue(value), value]]
  }, [] as Trie)
}
