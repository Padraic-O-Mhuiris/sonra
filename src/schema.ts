import { JsonRpcProvider } from "@ethersproject/providers";
import { ethers } from "ethers";
import { z } from "zod";
import { ChainDefinitionSchema } from "./chains";
import { PrincipalTokenAddress } from "./element-fi/schema";

export const isAddress = (x: string): x is Address => ethers.utils.isAddress(x);

export type Address = string & { readonly Address: unique symbol };

export const AddressSchema = z.string().refine(isAddress);

// MACCCS MAX.eth.ts

// CCMAC Spec-  "Two C Mac" Specification
// Chain, Contract, Metadata, Address Correspondance Specification
// Only assumes every chain is evm compat
// For frontends to consume

// {
//     mainnet: {
//         chainDef: { ... }
//         element: {
//             core: {
//                 principalTokenAddresses: PrincipalTokenAddress[]
//                 principalToken: {
//                     [PrincipalTokenAddress]: {
//                         symbol,
//                         pool,
//                         underlying,
//                         isCurveBased,
//                         use: (provider: JsonRpcProvider) => ...
//                     }
//                 }
//             }
//             gov: GovSchema
//         },
//     }
// }

export const CcmacSpecSchema = z.record(
  ChainNameSchema,
  ChainDefinitionSchema.extend()
);
