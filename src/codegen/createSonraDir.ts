import fs from 'fs'
import rimraf from 'rimraf'
import { log } from '../utils'

export async function createSonraDir(dirPath: string): Promise<void> {
  if (!fs.existsSync(dirPath)) {
    log(`Creating sonra working dir: ${dirPath}`)
    await fs.promises.mkdir(dirPath, { recursive: true })
  } else {
    log(`${dirPath} already exists, ...overwriting`)
    if (dirPath === process.cwd()) {
      throw new Error('Cannot delete current project directory')
    }
    await new Promise<void>((resolve) => rimraf(dirPath, {}, () => resolve()))
    await fs.promises.mkdir(dirPath, { recursive: true })
  }

  log(`Created sonra working directory at: ${dirPath}`)
}
