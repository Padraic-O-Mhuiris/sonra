import { Tranche__factory } from './elf-contracts'
import { ethers } from 'ethers'
import { Address, AddressSchema } from '../schema'
import { z } from 'zod'

export type PrincipalTokenAddresses = Address[] & {
  readonly PrincipalTokenAddresses: unique symbol
}

export type PrincipalTokenAddress = Address & {
  readonly PrincipalTokenAddress: unique symbol
}

export type TrancheAddress = PrincipalTokenAddress

export const isPrincipalTokenAddress = async (
  x: Address,
): x is PrincipalTokenAddress => ethers.utils.isAddress(x)

export const PrincipalAddressSchema = AddressSchema.refine(
  isPrincipalTokenAddress,
)

const ElementCoreSchema = z.object({
  principalTokenAddresses: z.array(PrincipalAddressSchema),
  erc20Addresses: z.array(AddressSchema),
  erc20Symbols: z.array(AddressSchema),
  metadata: z.object({
    principalToken: z.record(PrincipalAddressSchema, z.object({})),
  }),
  factories: z.object({
    principalToken: z.instanceof(Tranche__factory),
  }),
})

const ElementSchema = z.object({
  core: ElementCoreSchema,
})

export type Element = z.infer<typeof ElementSchema>
