import fs from 'fs'
import path from 'path'

const HardhatConfigFileName = 'hardhat.config.ts'

/**
 * Finds typechain directory from hardhat config, presumes hardhat config is
 * standard
 * */
export async function findTypechainDir(): Promise<string | null> {
  console.log('Looking for hardhat config')
  const hardhatConfigPath = path.join(process.cwd(), HardhatConfigFileName)
  if (!fs.existsSync(hardhatConfigPath)) {
    console.log('No hardhat config found')
    return null
  }

  let hardhatConfigContents: string = ''
  try {
    console.log('Found hardhat config')
    hardhatConfigContents = (
      await fs.promises.readFile(hardhatConfigPath, 'utf8')
    ).toString()
  } catch {
    console.log('Could not read contents of hardhat config')
    return null
  }

  const outDirStr = hardhatConfigContents
    .split(/\r?\n/)
    .find((s) => s.includes('outDir:'))

  const typechainOutDir = outDirStr
    ? outDirStr.replace(/\s/g, '').slice("outDir:'".length, -"',".length)
    : 'typechain-types'

  if (typechainOutDir === '') {
    console.log('outDir could not be parsed')
    return null
  }

  console.log(`Typechain path specified at: ${typechainOutDir}`)

  const typechainDirPath = path.join(process.cwd(), typechainOutDir)

  console.log('Validating contract types have been built')
  if (!fs.existsSync(typechainDirPath)) {
    console.log('No contract types could be found')
    return null
  }

  const typechainIndexFile = require(typechainDirPath) as { factories?: any }

  if (!typechainIndexFile.factories) {
    console.log('Contract factories were not detected')
    return null
  }

  return typechainDirPath
}
