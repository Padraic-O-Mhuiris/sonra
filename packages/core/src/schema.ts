import { z } from 'zod'

import { AddressSchema } from './address'
import { ChainDefinitionSchema, ChainNameSchema } from './chains'

// MACCCS MAX.eth.ts

// CCMAC Spec-  "Two C Mac" Specification
// Chain, Contract, Metadata, Address Correspondance Specification
// Only assumes every chain is evm compat
// For frontends to consume

// const x = {
//     mainnet: {
//         chainDef: { ... },
//         element: {
//             core: {
//                 principalTokenInfo: {
//                 principalTokenAddresses: PrincipalTokenAddress[],
//                   basic: {
//                     addresses: BasicPrincipalTokenAddress[],
//                     [BasicPrincipalTokenAddress]: {
//                         symbol,
//                         underlying,
//                     }
//                   },
//                   curvePrincipalTokenAddress: CurvePrincipalTokenAddress[],
//                   curve: {}

//                 }
//             }
//         },
//     }
// }

export const Erc20Schema = z.object({
  name: z.string(),
  symbol: z.string(),
  address: AddressSchema,
  decimals: z.number(),
})

// const createGenericProjectSchema = <
//   T extends z.ZodEnum<I extends [string, ...string[]] ? infer W : never>,
// >(
//   k: T,
// ) =>
//   z
//     .object({
//       addresses: z.record(k, z.string().array().nonempty()),
//       metadata: z.record(k, z.object({})),
//       contracts: z.record(k, z.object({})),
//     })
//     .strict()

// export const x = createGenericProjectSchema(addressCategories)

// export type Y = z.infer<typeof x>

// export const GenericProjectSchema = z.object({
//   /* Addresses contains only array lists of addresses of things */
//   addresses: z.object({}),
//   /* Metadata contains as top level keys a categorisation of addresses
//    *
//    * principalToken: {
//    *  <principalTokenAddress>: PrincipalTokenDef
//    * }
//    * */
//   metadata: z.object({}),
//   /* Like metadata with the  */
//   contracts: z.object({}),
// })

// export type GenericProject = z.infer<typeof GenericProjectSchema>

// export const CcmacSpecSchema = z.record(ChainNameSchema, ChainDefinitionSchema)

// export type CCMAC = z.infer<typeof CcmacSpecSchema>['rinkeby']
