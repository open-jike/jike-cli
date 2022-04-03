import { logger } from '@poppinss/cliui'
import { program } from 'commander'
import { JikeClient } from 'jike-sdk/node'
import { config } from './config'
import { errorAndExit } from './log'
import type { Entity, JikeClientJSON } from 'jike-sdk/node'
import type { ConfigUser } from './config'

export const filterUsers = (customQueries?: string[], allowEmpty = true) => {
  const cfg = config.value
  if (cfg.users.length === 0) {
    logger.warning(`Please login first. Please run the command:`)
    logger.warning(`$ jike-cli user login\n`)
    process.exit(1)
  }

  const queries = customQueries ?? program.opts<{ user?: string[] }>().user
  if (!queries || queries.length === 0) {
    return allowEmpty ? cfg.users : []
  }

  const users = queries.flatMap((query) =>
    cfg.users.filter(
      (user) =>
        user.alias === query ||
        user.userId === query ||
        user.screenName === query
    )
  )

  if (users.length === 0) {
    errorAndExit(new Error(`No user found: ${queries.join(', ')}`))
  }

  return users
}

export const displayConfigUser = (user: ConfigUser) =>
  user.alias || user.screenName

export const displayUser = (user: Entity.User, displayUsername = false) =>
  `${logger.colors.yellow(`${user.screenName}`)}${
    displayUsername ? ` (${logger.colors.gray(user.username)})` : ''
  }`

export const displayUsers = (users: Entity.User[], displayUsername = true) => {
  return users.length > 1
    ? users.map((user) => displayUser(user)).join(', ')
    : users[0]
    ? displayUser(users[0], displayUsername)
    : '-'
}

export const createClient = (data: JikeClientJSON) => {
  const client = JikeClient.fromJSON(data)
  client.on('renewToken', async () => {
    const data = await client.toJSON()
    const { users } = config.value
    const index = users.findIndex((user) => user.userId === data.userId)!
    const user = users[index]
    users[index] = { ...user, ...data }
  })
  return client
}
