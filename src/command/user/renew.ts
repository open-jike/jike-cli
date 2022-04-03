import { logger } from '@poppinss/cliui'
import { createCommand } from 'commander'
import { createClient, displayConfigUser, filterUsers } from '../../utils/user'

export const renew = createCommand('renew')
  .description('refresh user info and token')
  .alias('refresh')
  .action(() => renewUsers())

export const renewUsers = async () => {
  const users = filterUsers()

  for (const user of users) {
    const userName = displayConfigUser(user)
    const spinner = logger.await(`Renew user: ${userName}`)
    const client = createClient(user)
    try {
      await client.renewToken().finally(() => spinner.stop())
    } catch (err: any) {
      logger.error(`Renew user ${userName} failed!`)
      logger.error(err)
      continue
    }
    logger.success(`Renew user: ${userName}!`)
  }
}
