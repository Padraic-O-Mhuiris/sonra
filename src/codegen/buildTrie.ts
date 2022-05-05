import { BigNumber } from 'ethers'
import { z } from 'zod'
import { SonraDataModel, SonraModel } from '../schema'
import * as zx from '../zod'

export enum TrieLabel {
  NULL = 'NULL',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  BIGNUMBER = 'BIGNUMBER',
  DATE = 'DATE',
  ADDRESS = 'ADDRESS',
  CATEGORISED_ADDRESS = 'CATEGORISED_ADDRESS',
  ARRAY = 'ARRAY',
  OBJECT = 'OBJECT',
}

type TrieValueByLabel<T extends TrieLabel> = {
  [TrieLabel.NULL]: null
  [TrieLabel.STRING]: string
  [TrieLabel.NUMBER]: number
  [TrieLabel.BOOLEAN]: boolean
  [TrieLabel.BIGNUMBER]: BigNumber
  [TrieLabel.DATE]: Date
  [TrieLabel.ADDRESS]: zx.Address
  [TrieLabel.CATEGORISED_ADDRESS]: zx.CategorisedAddress<string>
  [TrieLabel.ARRAY]: TrieValue[]
  [TrieLabel.OBJECT]: TrieObject
}[T]

type TrieObjectValue<T extends TrieLabel> = {
  label: T
  value: TrieValueByLabel<T>
}
type TrieObjectEntry = { key: string } & TrieObjectValue<TrieLabel>
type TrieObject = TrieObjectEntry[]

type TrieBasicValue =
  | null
  | string
  | number
  | boolean
  | BigNumber
  | Date
  | zx.Address
  | zx.CategorisedAddress<string>

export type TrieValue = TrieBasicValue | TrieObject | TrieValue[]

type TrieRootLabels =
  | TrieLabel.NULL
  | TrieLabel.STRING
  | TrieLabel.NUMBER
  | TrieLabel.BOOLEAN
  | TrieLabel.BIGNUMBER
  | TrieLabel.DATE
  | TrieLabel.ADDRESS
  | TrieLabel.CATEGORISED_ADDRESS
  | TrieLabel.ARRAY

type TrieRoot = { key: string } & TrieObjectValue<TrieRootLabels>

function classifyTrieValue(val: any): TrieLabel {
  if (z.string().safeParse(val).success) {
    if (
      (val as string).includes(':') &&
      zx.address().safeParse((val as string).split(':')[1]).success
    ) {
      return TrieLabel.CATEGORISED_ADDRESS
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

  if (z.record(z.any()).safeParse(val).success && val.length === undefined) {
    return TrieLabel.OBJECT
  }

  if (z.any().array().safeParse(val).success) {
    return TrieLabel.ARRAY
  }

  return TrieLabel.NULL
}
const buildArray = (arr: any[], keyLabel: string) =>
  arr.map((value, idx) => {
    const idxLabel = classifyTrieValue(value)

    if (idxLabel === TrieLabel.OBJECT) {
      value = buildTrie(value)
    }

    if (idxLabel === TrieLabel.ARRAY) {
      value = buildArray(value, `${keyLabel}_${idx}`)
    }

    return { key: `${keyLabel}_${idx}`, label: idxLabel, value }
  })

function buildTrie(obj: { [k in string]: any }): TrieObject {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const label = classifyTrieValue(value)
    if (label === TrieLabel.OBJECT) {
      value = buildTrie(value)
    }

    if (label === TrieLabel.ARRAY) {
      value = buildArray(value as any[], key)
    }

    return [...acc, { key, label, value }]
  }, [] as TrieObject)
}

interface CategoryTrieDict {
  [k: string]: {
    [j in zx.Address]: TrieObject
  }
}

export const buildCategoryTrieDict = (
  categories: [string, ...string[]],
  metadata: SonraDataModel<SonraModel>['metadata'],
): CategoryTrieDict =>
  categories.reduce(
    (acc, category) => ({
      ...acc,
      [category]: Object.keys(metadata[category]).reduce(
        (_acc, address) => ({
          ..._acc,
          [address]: buildTrie(metadata[category][address as zx.Address]),
        }),
        {} as CategoryTrieDict[string],
      ),
    }),
    {} as CategoryTrieDict,
  )

export function extractTrieRoots(trie: TrieValue): TrieRoot[] {
  const roots: TrieRoot[] = []

  if (Array.isArray(trie)) {
    for (const leaf of trie) {
      if (
        (leaf as TrieObjectEntry).label === TrieLabel.OBJECT ||
        (leaf as TrieObjectEntry).label === TrieLabel.ARRAY
      ) {
        roots.push(...extractTrieRoots((leaf as TrieObjectEntry).value))
      } else if ((leaf as TrieObject[number]).label !== TrieLabel.OBJECT) {
        roots.push(leaf as TrieRoot)
      }
    }
  }
  return roots
}

export function generateRootTrieValues(categoryTrieDict: CategoryTrieDict) {
  const trieList: TrieObject = Object.values<CategoryTrieDict[string]>(
    categoryTrieDict,
  )
    .map((v) => Object.values<CategoryTrieDict[string][zx.Address]>(v))
    .flat()
    .flat()

  return extractTrieRoots(trieList)
}
