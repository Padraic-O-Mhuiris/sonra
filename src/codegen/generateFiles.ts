import prettier from 'prettier'
// import { printNode, zodToTs } from 'zod-to-ts'
// import { SonraDataModel, SonraModel } from '../schema'
// import { capitalize } from '../utils'
// import * as zx from '../zod'
// import { Address } from '../zod'
// import {
//   buildSonraTrieByCategoryAndAddress,
//   sonraRootTrieList,
// } from './buildTrie'
// import { parseMetadata } from './parseMetadata'
// import { log } from '../utils'
import { log } from '../utils'
import { Address } from '../zod'
import { CategorisedAddressImport } from './buildCategorisedAddressImports'
import { FileDescriptionsByCategory } from './buildFileDescriptions'
import { capitalize } from '../utils'

//const buildConstantsAddressDict = (category: string, addresses: zx.Address[]) =>
//   addresses.reduce(
//     (acc, address) => ({
//       ...acc,
//       [categoryLabel({
//         category,
//         address,
//         postFix: true,
//         categoryPostFix: 'Address',
//       })]: address,
//     }),
//     {} as { [k in string]: zx.Address },
//   )

// const genImportLabel = (
//   contractFactory: string,
//   uniqueCategorisedAddresses: [string, string][],
// ) => {
//   const addressImportLabels = uniqueCategorisedAddresses
//     .map(
//       ([importName, importPath]) =>
//         `import { ${importName} } from '${importPath}';`,
//     )
//     .join('\n')

//   return `import { Address, isAddress } from "./address"
// import { ${contractFactory} } from "./contracts"
// import { Signer } from "ethers";
// import type { Provider } from "@ethersproject/providers";
// ${addressImportLabels}`
// }

// const genBrandedTypeLabel = (typeLabel: string) =>
//   `export type ${typeLabel} = Address & { readonly ${typeLabel}: unique symbol }`

// const genAddressConstantsLabel = (
//   categoryTypeLabel: string,
//   constantsAddressDict: { [k in string]: zx.Address },
// ) => {
//   let label = ''

//   for (const [constLabel, address] of Object.entries(constantsAddressDict)) {
//     label += `const ${constLabel} = '${address}' as ${categoryTypeLabel}\n`
//   }
//   return label
// }

// const genAddressListLabel = (
//   categoryAddressListConstLabel: string,
//   constantsAddressDict: { [k in string]: zx.Address },
// ) => {
//   let label = `export const ${categoryAddressListConstLabel} = [\n`
//   for (const [constLabel] of Object.entries(constantsAddressDict)) {
//     label += `  ${constLabel},\n`
//   }
//   return (label += ']')
// }

// const genAddressGuardFunctionLabel = (
//   category: string,
//   categoryTypeLabel: string,
//   categoryAddressListConstLabel: string,
// ) => {
//   const categoryMappedArgLabel = categoryLabel({
//     category,
//     categoryPostFix: 'Address',
//   })
//   return `export const is${categoryTypeLabel} = (address: string): address is ${categoryTypeLabel} =>
//   isAddress(address) && ${categoryAddressListConstLabel}.some((${categoryMappedArgLabel}) => ${categoryMappedArgLabel} === address)`
// }

// const genContractFunctionLabel = (
//   category: string,
//   categoryTypeLabel: string,
//   contractFactory: string,
// ) => {
//   const contractLabel = categoryLabel({ category, categoryPostFix: 'Contract' })
//   return `export const ${contractLabel} = (
//   address: ${categoryTypeLabel},
//   signerOrProvider: Signer | Provider) =>
//   ${contractFactory}.connect(address, signerOrProvider)`
// }

// const genCategoryMetadataTypeLabel = (
//   category: string,
//   categoryTypeLabel: string,
//   categoryMetadataAddressType: string,
// ) => {
//   const typeLabel = categoryLabel({
//     category,
//     categoryPostFix: 'Metadata',
//     capital: true,
//   })

//   return `export type ${typeLabel} = Record<${categoryTypeLabel}, ${categoryMetadataAddressType}>`
// }

// const genCategoryMetadataLabel = (
//   category: string,
//   constantsAddressDict: { [k in string]: zx.Address },
//   metadata: SonraDataModel<SonraModel>['metadata'][string],
// ) => {
//   const constLabel = categoryLabel({
//     category,
//     categoryPostFix: 'Metadata',
//   })

//   const typeLabel = categoryLabel({
//     category,
//     categoryPostFix: 'Metadata',
//     capital: true,
//   })

//   let label = `export const ${constLabel}: ${typeLabel} = {\n`
//   for (const [addressConstLabel, address] of Object.entries(
//     constantsAddressDict,
//   )) {
//     const metadataLabel = parseMetadata(metadata[address]!)
//     label += `  [${addressConstLabel}]: ${metadataLabel},\n`
//   }
//   return `${label}\n}`
// }
// export function generateFiles(
//   categories: [string, ...string[]],
//   model: SonraModel,
//   data: SonraDataModel<SonraModel>,
//   contractFactoriesByCategory: Record<string, string>,
// ): { [k in string]: string } {
//   const sonraTrieByCategoryAndAddress = buildSonraTrieByCategoryAndAddress(
//     data.metadata,
//   )

//   const sonraRoots = sonraRootTrieList(sonraTrieByCategoryAndAddress)
//   log('sonraRoots: %O', sonraRoots)
//   const uniqueCategorisedAddresses = Array.from(
//     new Set(
//       sonraRoots
//         .filter((root) => root.label === 'CATEGORISED_ADDRESS')
//         .map(({ value }) => value),
//     ),
//   )
//     .map((x) => (x as string).split(':'))
//     .map(([category, address]) => [
//       categoryLabel({ category, address: address as Address, postFix: true }),
//       `./${category}.ts`,
//     ]) as [string, string][]

//   const categoryFileDict: Record<string, string> = {}

//   for (const category of categories) {
//     const addresses = data.addresses[category]
//     const contractFactory = contractFactoriesByCategory[category]

//     const categoryTypeLabel = categoryLabel({
//       category,
//       capital: true,
//       categoryPostFix: 'Address',
//     })

//     const categoryAddressListConstLabel = categoryLabel({
//       category,
//       categoryPostFix: 'AddressList',
//     })

//     const constantsAddressDict = buildConstantsAddressDict(category, addresses)

//     const importLabel = genImportLabel(
//       contractFactory,
//       uniqueCategorisedAddresses,
//     )
//     const brandedTypeLabel = genBrandedTypeLabel(categoryTypeLabel)
//     const addressConstantsLabel = genAddressConstantsLabel(
//       categoryTypeLabel,
//       constantsAddressDict,
//     )
//     const addressListLabel = genAddressListLabel(
//       categoryAddressListConstLabel,
//       constantsAddressDict,
//     )
//     const addressGuardFunctionLabel = genAddressGuardFunctionLabel(
//       category,
//       categoryTypeLabel,
//       categoryAddressListConstLabel,
//     )
//     const contractFunctionLabel = genContractFunctionLabel(
//       category,
//       categoryTypeLabel,
//       contractFactory,
//     )

//     const categoryMetadataAddressType = printNode(zodToTs(model[category]).node)

//     const categoryMetadataTypeLabel = genCategoryMetadataTypeLabel(
//       category,
//       categoryTypeLabel,
//       categoryMetadataAddressType,
//     )

//     const categoryMetadataLabel = genCategoryMetadataLabel(
//       category,
//       constantsAddressDict,
//       data.metadata[category],
//     )

//     const file = [
//       preamble,
//       importLabel,
//       brandedTypeLabel,
//       addressConstantsLabel,
//       addressListLabel,
//       addressGuardFunctionLabel,
//       contractFunctionLabel,
//       categoryMetadataTypeLabel,
//       categoryMetadataLabel,
//     ].join('\n\n')

//     categoryFileDict[category] = prettier.format(file, {
//       parser: 'typescript',
//       printWidth: 100,
//       tabWidth: 2,
//       semi: false,
//       trailingComma: 'all',
//     })
//   }

//   return categoryFileDict
// }

const preamble = '// THIS FILE IS AUTOGENERATED - DO NOT EDIT'
const defaultImportLabel = `import { Address, isAddress } from "./address"`

const ethersImportLabel = (
  importBigNumber: boolean,
) => `import type { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
${importBigNumber ? `import { BigNumber } from "ethers"` : ''}`

const contractFactoryImportLabel = (contractFactory: string) =>
  `import { ${contractFactory} } from "./contracts"`

const addressImportLabel = ({
  path,
  addressConstants,
  addressType,
}: CategorisedAddressImport) =>
  `import { ${addressConstants.join(
    ', ',
  )} } from "${path}"\nimport type { ${addressType} } from "${path}"`

const addressTypeLabel = (addressType: string) =>
  `export type ${addressType} = Address & { readonly ${addressType}: unique symbol }`

const addressConstLabel = (
  address: Address,
  addressConstant: string,
  addressType: string,
) => `export const ${addressConstant} = "${address}" as ${addressType}`

const addressListLabel = (category: string, addressConsts: string[]) =>
  `export const ${category}List = [\n${addressConsts.join(',\n')}]`

const addressGuardLabel = (
  category: string,
  addressType: string,
  isUnique: boolean,
  addressConsts: string[],
) =>
  `export const is${addressType} = (address: string): address is ${addressType} => isAddress(address) && ${
    isUnique
      ? `address === ${addressConsts[0]}`
      : `${category}List.some((${category}Address) => ${category}Address === address)`
  }`

const contractLabel = (
  category: string,
  addressType: string,
  contractFactory: string,
) =>
  `export const ${category}Contract = (address: ${addressType}, signerOrProvider: Signer | Provider) => ${contractFactory}.connect(address, signerOrProvider)`

const metadataTypeLabel = (
  category: string,
  addressType: string,
  metadataType: string,
) =>
  `export type ${capitalize(
    category,
  )}Metadata = Record<${addressType}, ${metadataType}>`

const metadataLabel = (
  category: string,
  addresses: Address[],
  addressConstantsByAddress: Record<Address, string>,
  metadataEntriesByAddress: Record<Address, string>,
) => {
  let label = `export const ${category}Metadata: ${capitalize(
    category,
  )}Metadata = {\n`
  for (const address of addresses) {
    label += `[${addressConstantsByAddress[address]}]: ${metadataEntriesByAddress[address]},\n`
  }
  return label + `}`
}

export function generateFiles(
  categories: [string, ...string[]],
  fileDescriptionsByCategory: FileDescriptionsByCategory,
): Record<string, string> {
  const fileByCategory: Record<string, string> = {}

  for (const category of categories) {
    const {
      addresses,
      contractFactory,
      addressImports,
      addressConstantsByAddress,
      isUnique,
      addressType,
      metadataType,
      importBigNumber,
      metadataEntriesByAddress,
    } = fileDescriptionsByCategory[category]

    const imports = [
      defaultImportLabel,
      ethersImportLabel(importBigNumber),
      contractFactoryImportLabel(contractFactory),
      ...addressImports.map(addressImportLabel),
    ].join('\n')

    const addressConsts = addresses.map(
      (address) => addressConstantsByAddress[address],
    )

    const addressConstLabels = addresses
      .map((address) =>
        addressConstLabel(
          address,
          addressConstantsByAddress[address],
          addressType,
        ),
      )
      .join('\n')

    const addressList = !isUnique
      ? addressListLabel(category, addressConsts)
      : ''

    const file = [
      preamble,
      imports,
      addressTypeLabel(addressType),
      addressConstLabels,
      addressList,
      addressGuardLabel(category, addressType, isUnique, addressConsts),
      contractLabel(category, addressType, contractFactory),
      metadataTypeLabel(category, addressType, metadataType),
      metadataLabel(
        category,
        addresses,
        addressConstantsByAddress,
        metadataEntriesByAddress,
      ),
    ]
      .filter((s) => s !== '')
      .join('\n\n')

    fileByCategory[category] = prettier.format(file, {
      parser: 'typescript',
      printWidth: 80,
      tabWidth: 2,
      semi: false,
      trailingComma: 'all',
    })
    log(`\nFile %s:\n%s`, category, file)
  }
  return fileByCategory
}
