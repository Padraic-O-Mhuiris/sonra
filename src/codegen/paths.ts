import path from 'path'
import { normalize } from './fileContent'

export interface CategoryPaths {
  file: string // full path to file
  root: string // relative path to root directory
  address: string // relative path to address file
  contracts: string // relative path to contracts dir
}

interface IMkCategoryPaths {
  outDir: string
  categoryDir: string
  category: string
}

export const relativePath = (from: string, to: string) => {
  const fromIsFile = from.endsWith('.ts')
  const toIsFile = to.endsWith('.ts')

  from = fromIsFile ? path.dirname(from) : from
  to = toIsFile ? to.slice(0, -3) : to
  const _path = path.relative(from, to)
  return _path.startsWith('..') ? _path : `./${_path}`
}

export const mkCategoryPaths = ({
  outDir,
  categoryDir,
  category,
}: IMkCategoryPaths): CategoryPaths => {
  category = normalize(category)
  const file = path.join(categoryDir, `${category}.ts`)
  const root = relativePath(`${outDir}/index.ts`, file)
  const address = relativePath(file, path.join(outDir, 'address.ts'))
  const contracts = relativePath(file, path.join(outDir, 'contracts'))
  return {
    file,
    root,
    address,
    contracts,
  }
}
