import { SonraSchema, SonraContracts, SonraFetch } from './types'
import { z } from 'zod'

export type SonraConfig<Schema extends SonraSchema> = {
  /**
   * Output directory for all files relative to process.cwd(), defaults to "sonra-types"
   * */
  outDir?: string

  /**
   * Path to typechain file, defaults to "typechain-types"
   * */
  typechain?: string

  /**
   * Sonra model which is used to validate the SonraDataModel
   * */
  schema: Schema

  /**
   * List of contracts which must associated to a declared category
   * */
  contracts: SonraContracts<Schema>

  /**
   * Async function which returns a list of addresses, contracts and metadata
   * corresponding to the input model and each keyed by a specific "category"
   * */
  fetch: SonraFetch<Schema>
}

// This could be better refined but put simply this is just a layer of
// validation over the config file. Is somewhat unneccessary at runtime as we
// do typechecking over the config file when it is dynamically imported
export const sonraConfigSchema = z
  .object({
    outDir: z.string().optional(),
    typechain: z.string().optional(),
    schema: z.record(z.any()),
    contracts: z.record(z.string()),
    fetch: z.function(z.tuple([])).returns(z.record(z.any())),
  })
  .refine((x): x is SonraConfig<SonraSchema> => true)

export interface CliConfig {
  outDir: string
  typechain: string
  config: string
  silent: boolean
  dryRun: boolean
}

export type AppConfig = Required<SonraConfig<SonraSchema> & CliConfig>
