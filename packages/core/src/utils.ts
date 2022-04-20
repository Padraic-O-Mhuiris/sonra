import { z } from 'zod'

export const enumKeyedObject = <
  T extends [string, ...string[]],
  U extends z.ZodTypeAny,
>(
  enumeration: z.ZodEnum<T>,
  obj: U,
) => {
  const validateKeysInEnum = <I extends any>(
    record: Record<string, I>,
  ): record is Record<
    typeof enumeration.enum[keyof typeof enumeration.enum],
    I
  > => Object.keys(record).every((key) => enumeration.safeParse(key).success)
  return z.record(obj).refine(validateKeysInEnum)
}

const x = enumKeyedObject(
  z.enum(['aaa', 'bbb', 'ccc', 'dddd']),
  z.object({ hhh: z.literal('a') }),
)

type Y = z.infer<typeof x>
