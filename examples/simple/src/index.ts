import { ERC20__factory, SimpleErc20__factory } from '@sonra.contracts/simple'
import { createSchema } from '@sonra/core'
import { z } from 'zod'

// const mySchema = createSchema({
//   principalToken: [
//     ERC20__factory,
//     z.object({
//       name: z.string(),
//       decimals: z.number(),
//       symbol: z.string(),
//       pool: z.literal('0x111'),
//     }),
//   ],
// })

// type X = z.infer<typeof x>
// declare const xx: X

async function main() {
  console.log(JSON.stringify(ERC20__factory.abi))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line
    console.error(error)
    process.exit(1)
  })
