#!/usr/bin/env node
import path from 'path'
import yargs from 'yargs'
import { SonraConfig, sonraConfigSchema } from './config'
import { run } from './run'
import { setupTsEnv } from './setupTsEnv'
import { SonraSchema } from './types'
import { isTypescriptFile, logger } from './utils'

const importSonraConfig = (config: string): SonraConfig<SonraSchema> => {
  const configPath = path.join(process.cwd(), config)

  let configObj
  try {
    configObj = require(path.join(process.cwd(), config)).default
  } catch (e) {
    logger.error(`Could not resolve sonra config from path: ${configPath}`)
    throw new Error((e as unknown as Error).message)
  }
  const sonraConfig = sonraConfigSchema.safeParse(configObj)

  if (sonraConfig.success) {
    logger.info('Sonra started!')
    return sonraConfig.data
  } else {
    throw new Error('Exported config is not valid')
  }
}

async function main() {
  const { configPath, silent, typechainPath, dryRun, outDir, tsconfig } =
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

  setupTsEnv(path.join(process.cwd(), tsconfig))
  const sonraConfig = importSonraConfig(configPath)

  logger.info('Sonra started!')
  await run({
    outDir,
    typechainPath,
    configPath,
    silent,
    dryRun,
    ...sonraConfig,
  })
  logger.info('Sonra finished!')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
