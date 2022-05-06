import { BigNumber } from 'ethers'
import { z } from 'zod'
import { SonraDataModel, SonraModel } from '../schema'
import * as zx from '../zod'
import { Address } from '../zod'

type SonraNodeLabel =
  | 'NULL'
  | 'STRING'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'BIGNUMBER'
  | 'DATE'
  | 'ADDRESS'
  | 'CATEGORISED_ADDRESS'
  | 'ARRAY'
  | 'OBJECT'

type SonraBranchNodeLabel = 'OBJECT' | 'ARRAY'
type SonraRootNodeLabel = Exclude<SonraNodeLabel, SonraBranchNodeLabel>

type SonraNodeValue<L extends SonraRootNodeLabel> = {
  NULL: null
  STRING: string
  NUMBER: number
  BOOLEAN: boolean
  BIGNUMBER: BigNumber
  DATE: Date
  ADDRESS: zx.Address
  CATEGORISED_ADDRESS: zx.CategorisedAddress<string>
}[L]

type SonraRootNode<L extends SonraRootNodeLabel> = SonraNode<L>

type SonraNode<L extends SonraNodeLabel> = {
  key: string
  label: L
  value: L extends SonraRootNodeLabel ? SonraNodeValue<L> : SonraTrie
}

type SonraTrieNode = SonraNode<SonraNodeLabel>
type SonraTrieRoot = SonraRootNode<SonraRootNodeLabel>
type SonraTrie = SonraTrieNode[]

function labelSonraNodeValue(val: any): SonraNodeLabel {
  if (z.string().safeParse(val).success) {
    if (
      (val as string).includes(':') &&
      zx.address().safeParse((val as string).split(':')[1]).success
    ) {
      return 'CATEGORISED_ADDRESS'
    }
    if (zx.address().safeParse(val).success) {
      return 'ADDRESS'
    }
    return 'STRING'
  }
  if (z.number().safeParse(val).success) {
    return 'NUMBER'
  }
  if (z.boolean().safeParse(val).success) {
    return 'BOOLEAN'
  }
  if (z.date().safeParse(val).success) {
    return 'DATE'
  }
  if (BigNumber.isBigNumber(val)) {
    return 'BIGNUMBER'
  }

  if (z.record(z.any()).safeParse(val).success && val.length === undefined) {
    return 'OBJECT'
  }

  if (z.any().array().safeParse(val).success) {
    return 'ARRAY'
  }

  return 'NULL'
}

function buildSonraTrie(
  o: Record<string, any> | Array<any>,
  keyLabel: string | undefined = '',
): SonraTrie {
  if (Array.isArray(o)) {
    o = o.map((v, idx) => [`${keyLabel}_${idx}`, v]) as [string, any][]
  } else {
    o = Object.entries(o) as [string, any][]
  }

  return (o as [string, any][]).reduce((acc, [key, value]) => {
    const label = labelSonraNodeValue(value)
    if (label === 'OBJECT' || label === 'ARRAY') {
      value = buildSonraTrie(value, key)
    }

    return [...acc, { key, label, value }]
  }, [] as SonraTrie)
}

type SonraTrieByCategoryAndAddress = Record<
  string,
  Record<zx.Address, SonraTrie>
>

export const buildSonraTrieByCategoryAndAddress = (
  metadata: SonraDataModel<SonraModel>['metadata'],
): SonraTrieByCategoryAndAddress => {
  const sonraTrieByCategoryAndAddress: SonraTrieByCategoryAndAddress = {}
  for (const [category, categoryEntry] of Object.entries(metadata)) {
    sonraTrieByCategoryAndAddress[category] = {}

    for (const [address, addressEntry] of Object.entries(categoryEntry)) {
      sonraTrieByCategoryAndAddress[category][address as Address] =
        buildSonraTrie(addressEntry)
    }
  }
  return sonraTrieByCategoryAndAddress
}

function nodeIsBranch(s: SonraTrieNode): s is SonraNode<SonraBranchNodeLabel> {
  return s.label === 'OBJECT' || s.label === 'ARRAY'
}

export const mapSonraTrie = <A extends unknown>(
  trie: SonraTrie,
  fn: (x: SonraTrieRoot) => A,
): A[] => {
  return trie
    .map((node) =>
      nodeIsBranch(node)
        ? mapSonraTrie(node.value, fn)
        : [fn(node as SonraTrieRoot)],
    )
    .flat()
}

export function sonraRootTrieList(
  sonraTrie: SonraTrieByCategoryAndAddress,
): SonraTrieRoot[] {
  const trie: SonraTrie = Object.values<SonraTrieByCategoryAndAddress[string]>(
    sonraTrie,
  )
    .map((v) =>
      Object.values<SonraTrieByCategoryAndAddress[string][zx.Address]>(v),
    )
    .flat()
    .flat()

  return mapSonraTrie(trie, (x) => x)
}

type SonraRootsByCategory = Record<string, SonraTrieRoot[]>

export function buildSonraRootTrieListByCategory(
  sonraTrie: SonraTrieByCategoryAndAddress,
): SonraRootsByCategory {
  const sonraRootsByCategory: SonraRootsByCategory = {}

  for (const [category, categoryEntry] of Object.entries(sonraTrie)) {
    sonraRootsByCategory[category] = mapSonraTrie(
      Object.values<SonraTrieByCategoryAndAddress[string][zx.Address]>(
        categoryEntry,
      ).flat(),
      (x) => x,
    )
  }
  return sonraRootsByCategory
}
