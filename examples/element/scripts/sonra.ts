import { run } from '@sonra/core'
import config from '../sonra.config'

export async function main() {
  await run(config)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
