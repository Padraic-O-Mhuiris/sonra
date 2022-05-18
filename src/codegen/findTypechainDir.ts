import fs from 'fs'
import path from 'path'
import { log } from '../utils'

const HardhatConfigFileName = 'hardhat.config.ts'

/**
 * Finds typechain directory from hardhat config, presumes hardhat config is
 * standard
 * */
export async function findTypechainDir(workingDir: string): Promise<string> {
  log('Looking for hardhat config')
  const hardhatConfigPath = path.join(workingDir, HardhatConfigFileName)
  if (!fs.existsSync(hardhatConfigPath)) {
    throw new Error('No hardhat config found')
  }

  log(`Found hardhat config at: ${hardhatConfigPath}`)
  const hardhatConfigContents = (
    await fs.promises.readFile(hardhatConfigPath, 'utf8')
  ).toString()

  const outDirStr = hardhatConfigContents
    .split(/\r?\n/)
    .find((s) => s.includes('outDir:'))

  const typechainOutDir = outDirStr
    ? outDirStr.replace(/\s/g, '').slice("outDir:'".length, -"',".length)
    : 'typechain-types'

  if (typechainOutDir === '') {
    throw new Error('outDir could not be parsed')
  }

  const typechainDirPath = path.join(workingDir, typechainOutDir)

  log('Validating contract types have been built')
  if (!fs.existsSync(typechainDirPath)) {
    throw new Error('No contract types could be found')
  }

  const typechainIndexFile = require(typechainDirPath)

  if (
    typechainIndexFile === undefined ||
    Object.keys(typechainIndexFile).length === 0
  ) {
    throw new Error('Contract factories were not detected')
  }

  log(`Typechain directory found at: ${typechainDirPath}`)
  return typechainDirPath
}
