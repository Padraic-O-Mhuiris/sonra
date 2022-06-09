#!/usr/bin/env node
import yargs from 'yargs'
import { AppConfig, SonraConfig, sonraConfigSchema } from './config'
import { run } from './run'
import { setupTsEnv } from './setupTsEnv'
import { SonraSchema } from './types'
import { isTypescriptFile, normalizeAbsPath } from './utils'
import path from 'path'

const importSonraConfig = (configPath: string): SonraConfig<SonraSchema> => {
  let config
  try {
    config = require(configPath).default
  } catch (e) {
    throw e
  }
  const sonraConfig = sonraConfigSchema.safeParse(config)

  if (sonraConfig.success) {
    return { ...sonraConfig.data }
  } else {
    throw new Error('Exported config is not valid')
  }
}

async function main() {
  let { configPath, silent, typechainPath, dryRun, outDir, tsconfig } =
    await yargs(process.argv)
      .scriptName('Sonra:')
      .option('configPath', {
        alias: 'c',
        default: './sonra.config.ts',
        describe: 'Path to sonra configuration',
        type: 'string',
      })
      .option('tsconfig', {
        default: './tsconfig.json',
        describe: 'Path to tsconfig.json',
        type: 'string',
      })
      .option('silent', {
        alias: 's',
        default: false,
        describe: 'Show debug information',
        type: 'boolean',
      })
      .option('typechainPath', {
        default: './typechain-types',
        describe: 'Path to generated typechain types',
        type: 'string',
      })
      .option('dry-run', {
        default: false,
        describe: 'Will not generate types',
        type: 'boolean',
      })
      .option('outDir', {
        alias: 'o',
        default: './sonra-types',
        describe: 'Path to directory generated types will be built in',
        type: 'string',
      })
      .usage(`$0`)
      .wrap(yargs.terminalWidth())
      .help().argv

  if (!isTypescriptFile(configPath))
    throw new Error(`Path to sonra configuration is not a typescript file`)

  setupTsEnv(normalizeAbsPath(tsconfig))
  const sonraConfig = importSonraConfig(normalizeAbsPath(configPath))

  // If we define the outDir in the sonra config, it should be generated
  // relative to the directory that file exists in
  if (sonraConfig.outDir) {
    outDir = path.join(path.dirname(configPath), sonraConfig.outDir)
  }

  const appConfig: AppConfig = {
    typechainPath,
    configPath,
    silent,
    dryRun,
    ...sonraConfig,
    outDir,
  }

  await run(appConfig)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
