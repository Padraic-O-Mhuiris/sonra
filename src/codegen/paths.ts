import path from 'path'

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
  return _path.startsWith('../') ? _path : `./${_path}`
}

export const mkCategoryPaths = ({
  outDir,
  categoryDir,
  category,
}: IMkCategoryPaths): CategoryPaths => {
  const file = path.join(categoryDir, `${category}.ts`)
  const root = relativePath(file, outDir)
  const address = relativePath(file, path.join(outDir, 'address.ts'))
  const contracts = relativePath(file, path.join(outDir, 'contracts'))
  return {
    file,
    root,
    address,
    contracts,
  }
}
