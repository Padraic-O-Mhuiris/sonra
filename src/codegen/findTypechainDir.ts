import fs from 'fs'
import path from 'path'

const HardhatConfigFileName = 'hardhat.config.ts'

/**
 * Finds typechain directory from hardhat config, presumes hardhat config is
 * standard
 * */
export function findTypechainDir(): string | null {
  console.log('Looking for hardhat config')
  const hardhatConfigPath = path.join(process.cwd(), HardhatConfigFileName)
  if (!fs.existsSync(hardhatConfigPath)) {
    console.log('No hardhat config found')
    return null
  }

  console.log('Found hardhat config, ...determining typechain path')
  const hardhatConfig = require(hardhatConfigPath) as {
    typechain?: { outDir?: string }
  }

  let typechainOutDir = hardhatConfig.typechain?.outDir
  if (!typechainOutDir) {
    console.log('No typechain path specified, assuming default')
    typechainOutDir = 'typechain-types'
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
