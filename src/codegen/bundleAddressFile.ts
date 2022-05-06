import fs from 'fs'
import path from 'path'
import { log } from '../utils'

export async function bundleAddressFile(dirPath: string): Promise<void> {
  const addressFile = `
import { ethers } from 'ethers'

export type Address = string & { readonly Address: unique symbol }

export const isAddress = (address: string): address is Address => ethers.utils.isAddress(x)
`
  await fs.promises.writeFile(path.join(dirPath, 'address.ts'), addressFile)

  log(`Generated address.ts in ${dirPath}`)
}
