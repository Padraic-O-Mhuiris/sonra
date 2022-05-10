import { BigNumber } from 'ethers'
import { z } from 'zod'
import { withGetType } from 'zod-to-ts'

export type ZodBigNumber = z.ZodType<BigNumber>

export const bigNumber = (): ZodBigNumber =>
  withGetType(z.instanceof(BigNumber), (ts) =>
    ts.factory.createIdentifier('BigNumber'),
  )
