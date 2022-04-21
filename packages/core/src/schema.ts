import { ContractFactory } from 'ethers'
import { z } from 'zod'

import { AddressSchema } from './address'

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

// const createCategoriesSchema = <T extends [unknown, ...unknown[]]>(
//   ...vals: T
// ) => z.tuple([...vals.map((val: T[number]) => z.literal(val))])

// const categoriesSchema = z.tuple([
//   z.literal('principalToken'),
//   z.literal('erc20Token'),
// ])

type GenericProjectSchemaInput<C extends ContractFactory> = z.ZodObject<
  Record<
    string,
    z.ZodObject<{
      metadata: z.AnyZodObject
      contract: z.ZodType<C, z.ZodTypeDef, C>
    }>
  >
>

export const inputSchema: GenericProjectSchemaInput<ContractFactory> = z.object(
  {
    principalToken: z.object({
      metadata: z.object({ xxx: z.literal('xxx') }),
      contract: z.instanceof(ContractFactory),
    }),
  },
)

export type X = z.infer<typeof inputSchema>

// interface GenericProjectSchema<T extends GenericProjectSchemaInput> {
//   categories: keyof T['_shape']
//   //addresses: Record<keyof T['_shape'], Address[]>
//   metadata: T
//   //contracts: Record<keyof T['_shape'], null>
// }
// const createGenericProjectSchema = <
//   T extends z.ZodObject<Record<string, z.ZodTypeAny>>,
// >(
//   metadataSchema: T,
// ) => {
//   const shape: T['_shape'] = metadataSchema.shape
//   const shapeKeys = Object.keys(shape)

//   return z.custom<{
//     categories: Array<keyof T['_shape']>
//     addresses: {
//       [k in keyof T['_shape']]: Address[]
//     }
//     metadata: {
//       [k in keyof T['_shape']]: z.infer<T['_shape'][k]>
//     }
//     contracts: {
//       [k in keyof T['_shape']]: <C extends Contract>(
//         address: Address,
//         signerOrProvider: Signer | Provider,
//       ) => C //ContractFactory.connect(address, signerOrProvider)
//     }
//   }>(
//     (val) =>
//       z
//         .object({
//           addresses: AddressSchema.array(),
//           metadata: metadataSchema,
//         })
//         .safeParse(val).success,
//   )
// }

// const xx = z.object({ principalToken: z.literal('1'), erc20: Erc20Schema })
// const proj = createGenericProjectSchema(xx)

// type Proj = z.infer<typeof proj>

// declare const x: Proj

// <T extends z.ZodEnum<[string, ...string[]]>>(
//   k: T,
// ) =>
//   z.object({
//     categories: k.array(),
//     addresses: z.record(k, AddressSchema.array()),
//     metadata: z.record(k, z.object({})),
//     contracts: z.record(k, z.object({})),
//   })

// export const x = createGenericProjectSchema(z.enum(['aaa', 'bbb']))

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
