import { SonraFetch, SonraModel } from './types'

export type SonraConfig<M extends SonraModel> = {
  typechainDir: string
  dir: string
  model: M
  fetch: () => SonraFetch<M>
}
