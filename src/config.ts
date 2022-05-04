import { SonraFetch, SonraModel } from './schema'

export type SonraConfig<M extends SonraModel> = {
  /**
   * Output directory for all files relative to process.cwd()
   * */
  dir: string
  /**
   * Sonra model which is used to validate the SonraDataModel
   * */
  model: M
  /**
   * Async function which returns a list of addresses, contracts and metadata
   * corresponding to the input model and each keyed by a specific "category"
   * */
  fetch: SonraFetch<M>
}
