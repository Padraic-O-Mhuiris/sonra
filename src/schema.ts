import { z } from 'zod'
import { ChainDefinitionSchema } from './chains'

// MACCCS MAX.eth.ts

// CCMAC Spec-  "Two C Mac" Specification
// Chain, Contract, Metadata, Address Correspondance Specification
// Only assumes every chain is evm compat
// For frontends to consume

const x = {
    mainnet: {
        chainDef: { ... },
        element: {
            core: {
                principalTokenInfo: {
                principalTokenAddresses: PrincipalTokenAddress[],
                  basic: {
                    addresses: BasicPrincipalTokenAddress[],
                    [BasicPrincipalTokenAddress]: {
                        symbol,
                        underlying,
                    }
                  },
                  curvePrincipalTokenAddress: CurvePrincipalTokenAddress[],
                  curve: {}

                }
            }
        },
    }
}

export const CcmacSpecSchema = z.record(
  ChainNameSchema,
  ChainDefinitionSchema.extend(),
)
