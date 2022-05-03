import { SonraDataModel, SonraModel } from './types'

export type SonraConfig<M extends SonraModel> = {
  typechainDir: string
  dir: string
  model: M
  fetch: () => Promise<SonraDataModel<M>>
}
