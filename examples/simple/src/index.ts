async function main() {
  console.log('hello world')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line
    console.error(error)
    process.exit(1)
  })
