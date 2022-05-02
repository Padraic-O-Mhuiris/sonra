import { SonraDataModel, SonraModel } from './types'

export type SonraConfig<M extends SonraModel> = {
  model: M
  fetch: () => Promise<SonraDataModel<M>>
}

export const createConfig =
  <M extends SonraModel>(model: M) =>
  (fetch: () => Promise<SonraDataModel<M>>): SonraConfig<M> => ({
    model,
    fetch,
  })
