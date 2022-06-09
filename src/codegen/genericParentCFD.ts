import path from 'path'
import z from 'zod'
import { zx } from '../zodx'
import {
  CategoryFileDescriptionRecord,
  CFDKind,
  SharedCFD,
} from './categoryFileDescription'
import {
  mkContractContent,
  mkContractImportContent,
  mkFileContent,
  mkGuardFnHeaderContent,
} from './fileContent'
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
  categoryFileContent: {
    addressType,
    addressConstant,
    contractConstant,
    metadataType,
    infoRecordType,
    infoRecordConstant,
    infoListConstant,
    infoListType,
  },
  childCategories,
  cfds,
  contract,
  contractFactory,
  paths,
}: GenericParentCFD & { cfds: CategoryFileDescriptionRecord }): string {
  const childCategoryInfo = childCategories.map((category) => cfds[category]!)

  const addressTypeUnion = childCategoryInfo
    .map(({ categoryFileContent: { addressType } }) => addressType)
    .join(' | ')

  const importContent = childCategoryInfo
    .map(
      ({
        kind,
        categoryFileContent: {
          addressType,
          addressConstant,
          metadataType,
          infoRecordConstant,
          infoListConstant,
          infoConstant,
        },
        category,
      }) => {
        addressConstant =
          kind === CFDKind.UNIQUE_ADDRESS || kind === CFDKind.METADATA_SINGLE
            ? `${addressConstant}`
            : `${addressConstant}es`

        const metadataImports =
          kind === CFDKind.METADATA_MULTI ||
          kind === CFDKind.METADATA_SINGLE ||
          kind === CFDKind.GENERIC_PARENT
            ? `${metadataType}, ${
                kind === CFDKind.METADATA_SINGLE
                  ? infoConstant
                  : infoRecordConstant
              } ${
                kind === CFDKind.METADATA_SINGLE ? '' : `,${infoListConstant}`
              }`
            : ''

        return `import { ${addressType}, ${addressConstant}, is${addressType}, ${metadataImports} } from './${category}'`
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

  const contractImportContent = contractFactory
    ? mkContractImportContent({
        contract: contract!,
        contractFactory,
        contractsPath: paths.contracts,
      })
    : ''

  const contractContent = contractFactory
    ? mkContractContent({
        contract: contract!,
        contractFactory,
        contractConstant,
        addressConstant,
        addressType,
      })
    : ''

  const metadataCategoryChildInfo = childCategoryInfo.filter(
    ({ kind }) =>
      kind === CFDKind.METADATA_MULTI ||
      kind === CFDKind.METADATA_SINGLE ||
      kind === CFDKind.GENERIC_PARENT,
  )

  const metadataTypeUnion = metadataCategoryChildInfo
    .map(({ categoryFileContent: { metadataType } }) => metadataType)
    .join(' | ')

  const recordTypeContent = childCategoryInfo.every(
    ({ kind }) =>
      kind === CFDKind.METADATA_MULTI ||
      kind === CFDKind.METADATA_SINGLE ||
      kind === CFDKind.GENERIC_PARENT,
  )
    ? `Record<${addressType}, ${metadataType}>`
    : `Record<${addressType}, ${metadataType} | undefined>`

  const metadataRecordContent = metadataCategoryChildInfo
    .map(
      ({
        kind,
        categoryFileContent: {
          infoRecordConstant,
          infoConstant,
          addressConstant,
        },
      }) =>
        kind === CFDKind.METADATA_MULTI || kind === CFDKind.GENERIC_PARENT
          ? `  ...${infoRecordConstant},`
          : `  [${addressConstant}]: ${infoConstant},`,
    )
    .join('\n')

  const metadataListTypeUnion = metadataCategoryChildInfo
    .map(({ kind, categoryFileContent: { metadataType, addressType } }) => {
      if (kind === CFDKind.METADATA_SINGLE) {
        return `(${metadataType} & { address: ${addressType} })`
      }

      return metadataType
    })
    .join(' | ')

  const metadataListContent = metadataCategoryChildInfo
    .map(
      ({
        kind,
        categoryFileContent: {
          infoConstant,
          infoListConstant,
          addressConstant,
        },
      }) => {
        if (kind === CFDKind.METADATA_SINGLE) {
          return `{ ...${infoConstant}, address: ${addressConstant} },`
        }
        return `  ...${infoListConstant},`
      },
    )
    .join('\n')

  return `
${importContent}
${contractImportContent}

export type ${addressType} = ${addressTypeUnion}

export const ${addressConstant}es: ${addressType}[] = [\n${addressesContent}]

${mkGuardFnHeaderContent({ addressType })} ${guardFnBodyContent}

${contractContent}

export type ${metadataType} = ${metadataTypeUnion}

export type ${infoRecordType} = ${recordTypeContent}

export const ${infoRecordConstant}: ${infoRecordType} = {\n ${metadataRecordContent} \n}

export type ${infoListType} =  (${metadataListTypeUnion})[]

export const ${infoListConstant}: ${infoListType} = [\n ${metadataListContent} \n]
`
}
