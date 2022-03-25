import { logger } from '@poppinss/cliui'
import { program } from 'commander'
import { JikeClient } from 'jike-sdk/node'
import { config } from './config'
import { errorAndExit } from './log'
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

export const createClient = (user: ConfigUser) =>
  new JikeClient({
    endpointId: user.endpointId,
    endpointUrl: user.endpointUrl,
    bundleId: user.bundleId,
    appVersion: user.appVersion,
    buildNo: user.buildNo,
    userAgent: user.userAgent,
    accessToken: user.accessToken,
    refreshToken: user.refreshToken,
    deviceId: user.deviceId,
    idfv: user.idfv,
  })
