import config from '../sonra.config'
import { run } from '../src/codegen'

async function main() {
  await run(config)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
