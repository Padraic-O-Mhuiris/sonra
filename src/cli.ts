// #!/usr/bin/env ts-node
// import path from 'path'
// import { parse as commandLineArgs } from 'ts-command-line-args'
// import { run } from './'
// import { AppConfig } from './run'

// interface CommandLineArgs {
//   config: string
// }

// export function parseArgs(): AppConfig {
//   const { config } = commandLineArgs<CommandLineArgs>({
//     config: {
//       type: String,
//       defaultValue: './sonra.config.ts',
//       description: 'Path to sonra-config',
//     },
//   })

//   // validate configPath here
//   const { default: sonraConfig } = require(path.join(
//     process.cwd(),
//     rawOptions.config,
//   ))

//   return {
//     config: sonraConfig,
//     configPath: rawOptions.config,
//   }
// }

// async function main() {
//   const { config, configPath } = parseArgs()
//   await run({ config, configPath })
// }

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     // eslint-disable-next-line no-console
//     console.error(error)
//     process.exit(1)
//   })

import { Command } from '@oclif/core'

export class MyCommand extends Command {
  static override description = 'description of this example command'

  async run() {
    console.log('running my command')
  }
}
