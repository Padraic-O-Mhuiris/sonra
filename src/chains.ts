import { z } from 'zod'
import { NativeCurrencyDefinitionSchema } from './currency'

const ChainNameSchema = z.nativeEnum({
  MAINNET: 'mainnet',
  // RINKEBY: "rinkeby",
  // GOERLI: "goerli",
  KOVAN: 'kovan',
} as const)

export const chainName = ChainNameSchema.enum

export const ChainIdSchema = z.nativeEnum({
  [chainName.MAINNET]: 1,
  // [chainName.RINKEBY]: 4,
  // [chainName.GOERLI]: 5,
  [chainName.KOVAN]: 42,
} as const)

export const chainId = ChainIdSchema.enum

export type ChainName = z.infer<typeof ChainNameSchema>
export type ChainId = z.infer<typeof ChainIdSchema>

export const ChainDefinitionSchema = z.object({
  chainId: ChainIdSchema,
  chainName: ChainNameSchema,
  currency: NativeCurrencyDefinitionSchema,
  rpcUrls: z.array(z.string().url()).optional(),
  blockExplorerUrls: z.array(z.string().url()).optional(),
})

export type ChainDefinition = z.infer<typeof ChainDefinitionSchema>

export const ChainDefinitionsSchema = z.record(ChainNameSchema, ChainDefinitionSchema)

export type ChainDefinitions = z.infer<typeof ChainDefinitionsSchema>
