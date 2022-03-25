import { program } from 'commander'
import { config } from './config'

export const filterUsers = (customQueries?: string[], allowEmpty = true) => {
  const queries = customQueries ?? program.opts<{ user?: string[] }>().user
  const cfg = config.value

  if (!queries || queries.length === 0) {
    return allowEmpty ? cfg.users : []
  }

  return queries.flatMap((query) =>
    cfg.users.filter(
      (user) =>
        user.alias === query ||
        user.userId === query ||
        user.screenName === query
    )
  )
}
