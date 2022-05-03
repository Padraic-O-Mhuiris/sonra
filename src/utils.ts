type UnionToIntersection<U> = (
  U extends never ? never : (arg: U) => never
) extends (arg: infer I) => void
  ? I
  : never

// Possibly dangerous
// https://stackoverflow.com/questions/55127004/how-to-transform-union-type-to-tuple-type
// https://github.com/microsoft/TypeScript/issues/13298
type UnionToTuple<T> = UnionToIntersection<
  T extends never ? never : (t: T) => T
> extends (_: never) => infer W
  ? [...UnionToTuple<Exclude<T, W>>, W]
  : []

export type ObjectKeysToTuple<T extends { [k in string]: any }> = UnionToTuple<
  keyof T
>

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
