import { createCommand } from 'commander'
import { ui } from '../ui'
import { versionNumber } from '../constants'

export const version = createCommand('version')
  .description('output the version number')
  .action(() => ui.logger.info(`Jike CLI, version: v${versionNumber}`))
