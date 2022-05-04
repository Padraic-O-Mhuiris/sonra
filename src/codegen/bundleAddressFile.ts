import fs from 'fs'
import path from 'path'

export async function bundleAddressFile(dirPath: string): Promise<boolean> {
  const addressFile = `
import { ethers } from 'ethers'

export type Address = string & { readonly Address: unique symbol }

export const isAddress = (address: string): address is Address => ethers.utils.isAddress(x)
`

  try {
    await fs.promises.writeFile(path.join(dirPath, 'address.ts'), addressFile)
  } catch {
    return false
  }
  return true
}
