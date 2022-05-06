import fs from 'fs'
import path from 'path'
import { log } from '../utils'

const HardhatConfigFileName = 'hardhat.config.ts'

/**
 * Finds typechain directory from hardhat config, presumes hardhat config is
 * standard
 * */
export async function findTypechainDir(): Promise<string | null> {
  log('Looking for hardhat config')
  const hardhatConfigPath = path.join(process.cwd(), HardhatConfigFileName)
  if (!fs.existsSync(hardhatConfigPath)) {
    throw new Error('No hardhat config found')
  }

  let hardhatConfigContents: string = ''
  try {
    log('Found hardhat config')
    hardhatConfigContents = (
      await fs.promises.readFile(hardhatConfigPath, 'utf8')
    ).toString()
  } catch {
    throw new Error('Could not read contents of hardhat config')
  }

  const outDirStr = hardhatConfigContents
    .split(/\r?\n/)
    .find((s) => s.includes('outDir:'))

  const typechainOutDir = outDirStr
    ? outDirStr.replace(/\s/g, '').slice("outDir:'".length, -"',".length)
    : 'typechain-types'

  if (typechainOutDir === '') {
    throw new Error('outDir could not be parsed')
  }

  log(`Typechain path specified at: ${typechainOutDir}`)

  const typechainDirPath = path.join(process.cwd(), typechainOutDir)

  log('Validating contract types have been built')
  if (!fs.existsSync(typechainDirPath)) {
    throw new Error('No contract types could be found')
  }

  const typechainIndexFile = require(typechainDirPath) as { factories?: any }

  if (!typechainIndexFile.factories) {
    throw new Error('Contract factories were not detected')
  }

  return typechainDirPath
}
