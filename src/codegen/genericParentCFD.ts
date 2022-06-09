import path from 'path'
import z from 'zod'
import { zx } from '../zodx'
import {
  CategoryFileDescriptionRecord,
  CFDKind,
  SharedCFD,
} from './categoryFileDescription'
import { mkFileContent, mkGuardFnHeaderContent } from './fileContent'
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

export function codegenGenericParent({
  categoryFileContent: { addressType, addressConstant },
  childCategories,
  cfds,
}: GenericParentCFD & { cfds: CategoryFileDescriptionRecord }): string {
  const childCategoryInfo = childCategories.map((category) => cfds[category]!)

  const addressTypeUnion = childCategoryInfo
    .map(({ categoryFileContent: { addressType } }) => addressType)
    .join(' | ')

  const importContent = childCategoryInfo
    .map(
      ({
        kind,
        categoryFileContent: { addressType, addressConstant },
        category,
      }) => {
        addressConstant =
          kind === CFDKind.UNIQUE_ADDRESS || kind === CFDKind.METADATA_SINGLE
            ? `${addressConstant}`
            : `${addressConstant}es`
        return `import { ${addressType}, ${addressConstant}, is${addressType} } from './${category}'`
      },
    )
    .join('\n')

  const addressesContent = childCategoryInfo
    .map(({ kind, categoryFileContent: { addressConstant } }) =>
      kind === CFDKind.UNIQUE_ADDRESS || kind === CFDKind.METADATA_SINGLE
        ? `${addressConstant},`
        : `...${addressConstant}es,`,
    )
    .join('\n')

  const guardFnBodyContent = childCategoryInfo
    .map(
      ({ categoryFileContent: { addressType } }) =>
        `is${addressType}(_address)`,
    )
    .join(' || ')
  return `
${importContent}

export type ${addressType} = ${addressTypeUnion}

export const ${addressConstant}es: ${addressType}[] = [\n${addressesContent}]

${mkGuardFnHeaderContent({ addressType })} ${guardFnBodyContent}
`
}
