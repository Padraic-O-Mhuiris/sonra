import prettier from 'prettier'

export function format(c: string) {
  return prettier.format(c, {
    parser: 'typescript',
    printWidth: 80,
    tabWidth: 2,
    semi: false,
    trailingComma: 'all',
  })
}
