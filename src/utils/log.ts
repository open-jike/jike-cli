import process from 'node:process'
import { ui } from '../ui'

export function errorAndExit(error: Error): never {
  ui.logger.error(error)
  process.exit(1)
}
