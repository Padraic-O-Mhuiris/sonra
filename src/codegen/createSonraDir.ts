import fs from 'fs'
import rimraf from 'rimraf'

export async function createSonraDir(dirPath: string): Promise<boolean> {
  try {
    if (!fs.existsSync(dirPath)) {
      console.log(`Creating sonra working dir: ${dirPath}`)
      await fs.promises.mkdir(dirPath, { recursive: true })
    } else {
      console.log(`${dirPath} already exists, ...overwriting`)
      if (dirPath === process.cwd()) {
        console.error('Cannot delete project directory')
        return false
      }
      await new Promise<void>((resolve) => rimraf(dirPath, {}, () => resolve()))
      await fs.promises.mkdir(dirPath, { recursive: true })
    }
  } catch {
    return false
  }

  return true
}
