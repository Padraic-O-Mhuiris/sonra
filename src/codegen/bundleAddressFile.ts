import fs from 'fs'
import path from 'path'

export async function bundleAddressFile(dirPath: string): Promise<boolean> {
  const addressFile = `
export type Address = string & { readonly Address: unique symbol }

export const isAddress = (address: string): address is Address => /^(0x)?[0-9a-fA-F]{40}$/.test(address)
`

  try {
    await fs.promises.writeFile(path.join(dirPath, 'address.ts'), addressFile)
  } catch {
    return false
  }
  return true
}
