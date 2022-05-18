import { ethers } from 'ethers'
import { SafeParseSuccess } from 'zod'
import { zx } from '../../src/zodx'
import { Address } from '../../src/zodx/address'

const CATEGORY = 'category'
const ADDRESS = ethers.Wallet.createRandom().address
const CATEGORY_ADDRESS = `${CATEGORY}:${ADDRESS}`
const INVALID_STRING = 'INVALID_STRING'

// describe('zx.address', () => {
//   describe('strict and no category', () => {
//     const schema = zx.address()
//     test('should parse simple address', () => {
//       const result = schema.safeParse(ADDRESS)
//       expect(result.success).toBe(true)
//       expect((result as SafeParseSuccess<zx.Address>).data).toMatch(ADDRESS)
//     })

//     test('should fail to parse category address', () => {
//       const result = schema.safeParse(CATEGORY_ADDRESS)
//       expect(result.success).toBe(false)
//     })

//     test('should fail to parse invalid address string', () => {
//       const result = schema.safeParse(INVALID_STRING)
//       expect(result.success).toBe(false)
//     })
//   })

//   describe('strict and category', () => {
//     const schema = zx.address(CATEGORY)
//     test('should parse category address', () => {
//       const result = schema.safeParse(CATEGORY_ADDRESS)
//       expect(result.success).toBe(true)
//     })

//     test('should fail to parse simple address', () => {
//       const result = schema.safeParse(ADDRESS)
//       expect(result.success).toBe(false)
//     })

//     test('should fail to parse invalid address string', () => {
//       const result = schema.safeParse(INVALID_STRING)
//       expect(result.success).toBe(false)
//     })
//   })

//   describe('not strict and no category', () => {
//     const schema = zx.address(undefined, false)

//     test('should parse simple address', () => {
//       const result = schema.safeParse(ADDRESS)
//       expect(result.success).toBe(true)
//     })

//     test('should parse category address and conform it to address', () => {
//       const result = schema.safeParse(CATEGORY_ADDRESS)
//       expect(result.success).toBe(true)
//       expect((result as SafeParseSuccess<Address>).data).toBe(ADDRESS)
//     })

//     test('should fail to parse invalid address string', () => {
//       const result = schema.safeParse(INVALID_STRING)
//       expect(result.success).toBe(false)
//     })
//   })

//   describe('not strict and category', () => {
//     const schema = zx.address(CATEGORY, false)

//     test('should parse category address', () => {
//       const result = schema.safeParse(CATEGORY_ADDRESS)
//       expect(result.success).toBe(true)
//     })

//     test('should parse simple address and conform it to address', () => {
//       const result = schema.safeParse(ADDRESS)
//       expect(result.success).toBe(true)
//       expect((result as SafeParseSuccess<Address>).data).toBe(CATEGORY_ADDRESS)
//     })

//     test('should fail to parse invalid address string', () => {
//       const result = schema.safeParse(INVALID_STRING)
//       expect(result.success).toBe(false)
//     })
//   })
// })
