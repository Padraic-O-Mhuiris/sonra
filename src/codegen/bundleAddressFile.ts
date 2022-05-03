import fs from 'fs'
import path from 'path'

export async function bundleAddressFile(dirPath: string): Promise<boolean> {
  const addressFile = `export type GenericAddress = string & { readonly Address: unique symbol }
export type Address<T extends string> = T & { readonly Address: unique symbol }

export const isAddress = <T extends string>(address: T): address is Address<T> => /^(0x)?[0-9a-fA-F]{40}$/.test(address)
`

  try {
    await fs.promises.writeFile(path.join(dirPath, 'address.ts'), addressFile)
  } catch {
    return false
  }
  return true
}
