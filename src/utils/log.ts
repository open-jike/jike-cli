import { logger } from '@poppinss/cliui'

export function errorAndExit(error: Error): never {
  logger.error(error)
  process.exit(1)
}
