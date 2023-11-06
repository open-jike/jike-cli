import { createCommand } from 'commander'
import { ui } from '../../ui'
import { config, isSameUser } from '../../utils/config'
import { errorAndExit } from '../../utils/log'
import { displayConfigUser, filterUsers } from '../../utils/user'

export const logout = createCommand('logout [users...]')
  .description('logout users')
  .usage('account1 [account2...]')
  .action((queries: string[]) => logoutUser(queries))

export const logoutUser = (queries: string[]) => {
  const removes = filterUsers(queries, false)
  if (removes.length === 0) {
    errorAndExit(new Error('no user found'))
  }

  const cfg = config.value
  cfg.users = cfg.users.filter((user) => {
    const shouldRemove = removes.some((remove) => isSameUser(user, remove))
    if (shouldRemove) {
      ui.logger.success(`Logout ${displayConfigUser(user)}.`)
    }
    return !shouldRemove
  })
}
