import z from 'zod'
import { zx } from '../zodx'
import { CFDKind, SharedCFD } from './categoryFileDescription'
import { mkFileContent } from './fileContent'
import { mkCategoryPaths } from './paths'

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

  return {
    kind: CFDKind.GENERIC_PARENT,
    category,
    childCategories,
    categoryFileContent: mkFileContent(category),
    paths: mkCategoryPaths({ category, categoryDir, outDir }),
  }
}
