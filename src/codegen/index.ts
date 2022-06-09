import fs from 'fs'
import path from 'path'
import { CategoryDirectoryPaths } from '../dir'
import { SonraDataModel, SonraSchema } from '../types'
import { CategoryHierarchy } from '../validations/validateCategories'
import { CategoryContractInfo } from '../validations/validateTypechain'
import { codegenAddressList } from './addressListCFD'
import { categoryFileDescriptions, CFDKind } from './categoryFileDescription'
import { ADDRESS_FILE_CONTENT } from './fileContent'
import { format } from './format'
import { codegenGenericParent } from './genericParentCFD'
import { codegenMetadataMultiAddress } from './metadataMultiAddressCFD'
import { codegenMetadataSingleAddress } from './metadataSingleAddressCFD'
import { relativePath } from './paths'
import { codegenUniqueAddress } from './uniqueAddressCFD'

export async function codegen<T extends SonraSchema>(
  categories: string[],
  categoryHierarchy: CategoryHierarchy,
  categoryDirectoryPaths: CategoryDirectoryPaths,
  schema: T,
  dataModel: SonraDataModel<T>,
  categoryContractInfo: CategoryContractInfo,
  outDir: string,
) {
  const cfds = categoryFileDescriptions(
    categories,
    categoryHierarchy,
    categoryDirectoryPaths,
    schema,
    dataModel,
    categoryContractInfo,
    outDir,
  )

  await fs.promises.writeFile(
    path.join(outDir, 'address.ts'),
    format(ADDRESS_FILE_CONTENT),
  )

  let indexFile: string = 'export * from "./address"\n'
  for (const fd of Object.values(cfds)) {
    let file: string = ''
    switch (fd.kind) {
      case CFDKind.UNIQUE_ADDRESS:
        file = codegenUniqueAddress(fd)
        break
      case CFDKind.ADDRESS_LIST:
        file = codegenAddressList(fd)
        break
      case CFDKind.METADATA_SINGLE:
        file = codegenMetadataSingleAddress(fd)
        break
      case CFDKind.METADATA_MULTI:
        file = codegenMetadataMultiAddress(fd)
        break
      case CFDKind.GENERIC_PARENT:
        file = codegenGenericParent({ ...fd, cfds })
    }

    let indexPathToCategoryFile = relativePath(
      `${outDir}/index.ts`,
      fd.paths.file,
    )

    indexPathToCategoryFile = indexPathToCategoryFile.endsWith('index')
      ? indexPathToCategoryFile.slice(0, -'index'.length)
      : indexPathToCategoryFile

    indexFile += `export * from "${indexPathToCategoryFile}"\n`
    file = format(file)
    await fs.promises.writeFile(fd.paths.file, file)
  }

  indexFile = format(indexFile)
  await fs.promises.writeFile(`${outDir}/index.ts`, indexFile)
}
