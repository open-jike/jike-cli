import { logger } from '@poppinss/cliui'
import { config, isSameUser } from '../../utils/config'
import { errorAndExit } from '../../utils/log'
import { filterUsers } from '../../utils/options'

export const logout = (queries: string[]) => {
  const removes = filterUsers(queries, false)
  if (removes.length === 0) {
    errorAndExit(new Error('no user found'))
  }

  const cfg = config.value
  cfg.users = cfg.users.filter((user) => {
    const shouldRemove = removes.some((remove) => isSameUser(user, remove))
    if (shouldRemove) {
      const userName = user.alias || user.screenName
      logger.success(`Logout ${userName}.`)
    }
    return !shouldRemove
  })
}
