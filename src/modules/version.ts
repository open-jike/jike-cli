import { createCommand } from 'commander'
import { logger } from '@poppinss/cliui'
import { versionNumber } from '../constants'

export const version = createCommand('version')
  .description('output the version number')
  .action(() => logger.info(`Jike CLI, version: v${versionNumber}`))
