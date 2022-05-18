import { ethers } from 'ethers'
import { SafeParseSuccess } from 'zod'
import { address, Address, CategorisedAddress } from '../../src/zodx/address'

const CATEGORY = 'category'
const ADDRESS = ethers.Wallet.createRandom().address
const CATEGORY_ADDRESS = `${CATEGORY}:${ADDRESS}`
const INVALID_STRING = 'INVALID_STRING'

describe('zx.address()', () => {
  test('should parse address', () => {
    const result = address().safeParse(ADDRESS)
    expect(result.success).toBe(true)
    expect((result as SafeParseSuccess<Address>).data).toBe(ADDRESS)
  })

  test('should fail to parse categorised address', () => {
    const result = address().safeParse(CATEGORY_ADDRESS)
    expect(result.success).toBe(false)
  })

  test('should fail to parse string', () => {
    const result = address().safeParse(INVALID_STRING)
    expect(result.success).toBe(false)
  })
})

describe('zx.address().conform()', () => {
  test('should parse address', () => {
    const result = address().conform().safeParse(ADDRESS)
    expect(result.success).toBe(true)
    expect((result as SafeParseSuccess<Address>).data).toBe(ADDRESS)
  })

  test('should parse categorised address and transform into address', () => {
    const result = address().conform().safeParse(CATEGORY_ADDRESS)
    expect(result.success).toBe(true)
    expect((result as SafeParseSuccess<Address>).data).toBe(ADDRESS)
  })

  test('should fail to parse string', () => {
    const result = address().safeParse(INVALID_STRING)
    expect(result.success).toBe(false)
  })
})

describe('zx.address().category(<Category>)', () => {
  test('should parse category address', () => {
    const result = address().category(CATEGORY).safeParse(CATEGORY_ADDRESS)
    expect(result.success).toBe(true)
    expect((result as SafeParseSuccess<CategorisedAddress<string>>).data).toBe(
      CATEGORY_ADDRESS,
    )
  })

  test('should fail to parse address', () => {
    const result = address().category(CATEGORY).safeParse(ADDRESS)
    expect(result.success).toBe(false)
  })

  test('should fail to parse string', () => {
    const result = address().category(CATEGORY).safeParse(INVALID_STRING)
    expect(result.success).toBe(false)
  })
})

describe('zx.address().category(<Category>).conform()', () => {
  test('should parse correct category address', () => {
    const result = address()
      .category(CATEGORY)
      .conform()
      .safeParse(CATEGORY_ADDRESS)
    expect(result.success).toBe(true)
    expect((result as SafeParseSuccess<CategorisedAddress<string>>).data).toBe(
      CATEGORY_ADDRESS,
    )
  })

  test('should parse address', () => {
    const result = address().category(CATEGORY).conform().safeParse(ADDRESS)
    expect(result.success).toBe(true)
    expect((result as SafeParseSuccess<CategorisedAddress<string>>).data).toBe(
      CATEGORY_ADDRESS,
    )
  })

  test('should parse different categorised address', () => {
    const result = address()
      .category(CATEGORY)
      .conform()
      .safeParse(`OTHER_CATEGORY:${ADDRESS}`)
    expect(result.success).toBe(true)
    expect((result as SafeParseSuccess<CategorisedAddress<string>>).data).toBe(
      CATEGORY_ADDRESS,
    )
  })

  test('should fail to parse string', () => {
    const result = address().category(CATEGORY).safeParse(INVALID_STRING)
    expect(result.success).toBe(false)
  })
})
