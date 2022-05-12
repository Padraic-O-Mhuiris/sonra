import { ethers } from 'ethers'
import { zx } from '../../src/zodx'

const CATEGORY = 'category'
const ADDRESS = ethers.Wallet.createRandom().address
const CATEGORY_ADDRESS = `${CATEGORY}:${ADDRESS}`

describe('zx.address', () => {
  describe('strict and no category', () => {
    test('should parse simple address', () => {
      const result = zx.address().safeParse(ADDRESS)
      expect(result.success).toBe(true)
    })
    test('should fail to parse category address', () => {
      const result = zx.address().safeParse(CATEGORY_ADDRESS)
      expect(result.success).toBe(false)
    })
  })
  describe('strict and category', () => {
    test('should fail to parse simple address', () => {
      const result = zx.address({ category: CATEGORY }).safeParse(ADDRESS)
      expect(result.success).toBe(false)
    })
    test.only('should parse category address', () => {
      const result = zx
        .address({ category: CATEGORY })
        .safeParse(CATEGORY_ADDRESS)
      console.log(result)
      expect(result.success).toBe(true)
    })
  })
  describe('not strict and no category', () => {
    test('should parse simple address', () => {
      const result = zx.address({ strict: false }).safeParse(ADDRESS)
      expect(result.success).toBe(true)
    })
  })
})
