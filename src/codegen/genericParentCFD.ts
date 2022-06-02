import path from 'path'
import { mkCategoryAddressType } from '../utils'
import { zx } from '../zodx'
import z from 'zod'
import { CFDKind, SharedCFD } from './categoryFileDescription'

export interface GenericParentCFD extends SharedCFD {
  kind: CFDKind.GENERIC_PARENT
  addressType: string
  childAddressTypes: [string, ...string[]]
}

export type GenericParent = {
  [k in string]:
    | GenericParent
    | zx.AddressRecord<any>
    | zx.Address
    | [zx.Address, ...zx.Address[]]
}

interface IMkGenericParentCFD {
  entry: GenericParent
  category: string
  categoryDir: string
}

export const mkGenericParentCFD = ({
  entry,
  category,
  categoryDir,
}: IMkGenericParentCFD): GenericParentCFD => {
  const childAddressTypes = z
    .string()
    .array()
    .nonempty()
    .parse(Object.keys(entry).map(mkCategoryAddressType))

  return {
    kind: CFDKind.GENERIC_PARENT,
    category,
    addressType: mkCategoryAddressType(category),
    filePath: path.join(categoryDir, `index.ts`),
    childAddressTypes,
  }
}
