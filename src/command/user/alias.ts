import { logger } from '@poppinss/cliui'
import { createCommand } from 'commander'
import { filterUsers } from '../../utils/user'

export const alias = createCommand('alias')
  .argument('<alias>', 'alias name')
  .description('set user alias')
  .action((alias: string) => setAlias({ alias }))

export const setAlias = ({ alias }: { alias: string }) => {
  const users = filterUsers()
  if (users.length > 1) {
    logger.error("You can't set alias for multiple users")
    process.exit(1)
  }

  users[0].alias = alias
  logger.success(`Alias set to ${alias}`)
}
