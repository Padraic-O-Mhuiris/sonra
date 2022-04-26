import { Provider } from '@ethersproject/abstract-provider'
import { BaseContract, Signer } from 'ethers'
import { z } from 'zod'

import {
  CategorisedAddress,
  CategorisedAddressSchema,
  createCategorisedAddress,
} from './address'

type ContractFactoryStatic<C extends BaseContract> = {
  connect: (address: string, signerOrProvider: Signer | Provider) => C
}

type ZodTupleLiterals<T extends [...any[]]> = T extends [
  infer Head,
  ...infer Tail,
]
  ? [z.ZodLiteral<Head>, ...ZodTupleLiterals<Tail>]
  : []

export const createSchema2 =
  <Categories extends [string, ...string[]]>(...categories: Categories) =>
  <
    Contract extends BaseContract & {},
    ContractFactory extends ContractFactoryStatic<Contract>,
    Metadata extends z.AnyZodObject,
    Model extends {
      [k in Categories[number]]: [ContractFactory, Metadata]
    },
  >(
    model: Model,
  ) => {
    const categoriesTuple = z.tuple(
      categories.map((category) =>
        z.literal(category),
      ) as ZodTupleLiterals<Categories>,
    )

    const addresses = z.object(
      categories.reduce(
        (acc, arg) => ({
          ...acc,
          [arg]: createCategorisedAddress(arg).array(),
        }),
        {} as {
          [k in Categories[number]]: z.ZodArray<CategorisedAddressSchema<k>>
        },
      ),
    )

    const contracts = z.object(
      categories.reduce(
        (acc, arg: Categories[number]) => {
          const factoryName = model[arg][0].constructor.name

          return {
            ...acc,
            [arg]: z.custom<Model[Categories[number]][0]>(
              (val) =>
                z
                  .object({ connect: z.function() })
                  .refine(() => factoryName.includes('__factory'))
                  .safeParse(val).success,
            ),
          }
        },
        {} as {
          [k in Categories[number]]: z.ZodType<Model[k][0]>
        },
      ),
    )

    const metadata = z.object(
      categories.reduce(
        (acc, arg: Categories[number]) => ({
          ...acc,
          [arg]: z.record(createCategorisedAddress(arg), model[arg][1]),
        }),
        {} as {
          [k in Categories[number]]: z.ZodObject<{
            [r in CategorisedAddress<k>]: Model[k][1]
          }>
        },
      ),
    )

    return z.object({
      categories: categoriesTuple,
      addresses,
      contracts,
      metadata,
    })
  }
