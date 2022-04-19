import { ethers } from 'ethers'
import { z } from 'zod'

export const isAddress = (x: string): x is Address => ethers.utils.isAddress(x)

export type Address = string & { readonly Address: unique symbol }

export const AddressSchema = z.string().refine(isAddress)
