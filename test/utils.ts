import { ethers } from 'ethers'
import { zx } from '../src'

export const randomAddress = () =>
  zx.address().parse(ethers.Wallet.createRandom().address)
