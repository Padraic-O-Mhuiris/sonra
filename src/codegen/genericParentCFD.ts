import path from 'path'
import z from 'zod'
import { zx } from '../zodx'
import { CFDKind, SharedCFD } from './categoryFileDescription'
import { mkFileContent } from './fileContent'
import { relativePath } from './paths'

export interface GenericParentCFD extends SharedCFD {
  kind: CFDKind.GENERIC_PARENT
  childCategories: [string, ...string[]]
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
  outDir: string
}

export const mkGenericParentCFD = ({
  entry,
  category,
  categoryDir,
  outDir,
}: IMkGenericParentCFD): GenericParentCFD => {
  const childCategories = z
    .string()
    .array()
    .nonempty()
    .parse(Object.keys(entry))

  const file = path.join(categoryDir, category, 'index.ts')
  const root = relativePath(file, outDir)
  const address = relativePath(file, path.join(outDir, 'address.ts'))
  const contracts = relativePath(file, path.join(outDir, 'contracts'))

  return {
    kind: CFDKind.GENERIC_PARENT,
    category,
    childCategories,
    categoryFileContent: mkFileContent(category),
    paths: { file, root, address, contracts },
  }
}
