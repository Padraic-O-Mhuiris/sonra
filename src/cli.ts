#!/usr/bin/env node
import path from 'path'
import yargs from 'yargs'
import { CliConfig, sonraConfigSchema } from './config'
import { run } from './run'
import { isTypescriptFile, logger } from './utils'

export function loadTsNode(tsConfigPath: string, strict: boolean) {
  try {
    require.resolve('typescript')
  } catch {
    throw new Error('Could not resolve typescript')
  }

  try {
    require.resolve('ts-node')
  } catch {
    throw new Error('Could not resolve ts-node')
  }

  process.env.TS_NODE_PROJECT = tsConfigPath

  if (process.env.TS_NODE_FILES === undefined) {
    process.env.TS_NODE_FILES = 'true'
  }

  if (strict) {
    require('ts-node/register')
  } else {
    require('ts-node/register/transpile-only')
  }
}

async function main() {
  const { config, silent, typechain, dryRun, outDir, strict } = await yargs(
    process.argv,
  )
    .scriptName('sonra')
    .option('config', {
      alias: 'c',
      default: './sonra.config.ts',
      describe: 'Path to sonra configuration',
      type: 'string',
    })
    .option('strict', {
      default: true,
      describe: 'When true will typecheck your config and dependent scripts',
      type: 'boolean',
    })
    .option('silent', {
      alias: 's',
      default: false,
      describe: 'Show debug information',
      type: 'boolean',
    })
    .option('typechain', {
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
    .usage(
      '$0\n\nSonra is a codegen library for Ethereum web applications for a better type driven development experience. It solves a coordination problem between contract addresses, metadata and interfaces enabling users to have a cleaner api to build their web application on. It also introduces a rigourous type first approach which is exemplified by the custom ~Address~ type which uses type branding to guard as a constrained string. Sonra extends the granularity in which developers can describe smart contract systems and how they can relate to each other.',
    )
    .help().argv

  if (!isTypescriptFile(config))
    throw new Error(`Path to sonra configuration is not a typescript file`)
  loadTsNode(config, strict)

  const cliConfig: CliConfig = { config, silent, typechain, dryRun, outDir }
  let configObj
  const configPath = path.join(process.cwd(), config)

  try {
    configObj = require(path.join(process.cwd(), config)).default
  } catch (e) {
    logger.error(`Could not resolve sonra config from path: ${configPath}`)
    throw new Error((e as unknown as Error).message)
  }
  const sonraConfig = sonraConfigSchema.safeParse(configObj)

  if (sonraConfig.success) {
    logger.info('Sonra started!')
    await run({ ...cliConfig, ...sonraConfig.data })
  } else {
    logger.error('Exported config is not valid')
    return
  }

  logger.info('Sonra finished!')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
