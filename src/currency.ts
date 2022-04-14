import { z } from "zod";

const CurrencyKindSchema = z.nativeEnum({
  NATIVE: "native",
  ERC20: "erc20",
} as const);

export const currencyKind = CurrencyKindSchema.enum;

export type CurrencyKind = z.infer<typeof CurrencyKindSchema>;

export const CurrencyDefinitionSchema = z.object({
  kind: CurrencyKindSchema,
  name: z.string(),
  symbol: z.string(),
  decimals: z.number(),
});

export type CurrencyDefinition = z.infer<typeof CurrencyDefinitionSchema>;

export const NativeCurrencyDefinitionSchema = CurrencyDefinitionSchema.extend({
  kind: z.literal(currencyKind.NATIVE),
});

export type NativeCurrencyDefinition = z.infer<
  typeof NativeCurrencyDefinitionSchema
>;
