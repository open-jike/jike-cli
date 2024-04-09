import process from 'node:process'
import { createCommand } from 'commander'
import { ui } from '../../ui'
import { filterUsers } from '../../utils/user'

export const alias = createCommand('alias')
  .argument('<alias>', 'alias name')
  .description('set user alias')
  .action((alias: string) => setAlias({ alias }))

export const setAlias = ({ alias }: { alias: string }) => {
  const users = filterUsers()
  if (users.length > 1) {
    ui.logger.error("You can't set alias for multiple users")
    process.exit(1)
  }

  users[0].alias = alias
  ui.logger.success(`Alias set to ${alias}`)
}
