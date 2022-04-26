import { ERC20__factory, SimpleErc20__factory } from '@sonra.contracts/simple'
import { createSchema } from '@sonra/core'
import { z } from 'zod'

const x = createSchema({
  principalToken: [ERC20__factory, z.object({ ddd: z.literal('1') })],
  tokens: [SimpleErc20__factory, z.object({ ddd: z.literal('1') })],
})

type X = z.infer<typeof x>
declare const xx: X

async function main() {}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line
    console.error(error)
    process.exit(1)
  })
