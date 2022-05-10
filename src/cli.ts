import { parse as commandLineArgs } from 'ts-command-line-args'
import { run } from './codegen'
import { SonraConfig } from './config'
import { SonraModel } from './schema'
import path from 'path'

export interface ParsedArgs {
  config: SonraConfig<SonraModel>
  configPath: string
}

interface CommandLineArgs {
  config: string
}

export function parseArgs(): ParsedArgs {
  const rawOptions = commandLineArgs<CommandLineArgs>({
    config: {
      type: String,
      defaultValue: './sonra.config.ts',
      description: 'Path to sonra-config',
    },
  })

  const { default: sonraConfig } = require(path.join(
    process.cwd(),
    rawOptions.config,
  ))

  return {
    config: sonraConfig,
    configPath: rawOptions.config,
  }
}

async function main() {
  const { config, configPath } = parseArgs()
  await run(config, configPath)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
