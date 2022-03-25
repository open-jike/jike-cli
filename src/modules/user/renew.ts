import { logger } from '@poppinss/cliui'
import { createCommand } from 'commander'
import { createClient, filterUsers } from '../../utils/user'

export const renew = createCommand('renew')
  .description('refresh user info and token')
  .alias('refresh')
  .action(() => renewUsers())

export const renewUsers = async () => {
  const users = filterUsers()

  for (const user of users) {
    const userName = user.alias || user.screenName
    const spinner = logger.await(`Renew user: ${userName}`)
    const client = createClient(user) //new JikeClient({ ...user })
    try {
      await client.renewToken().finally(() => spinner.stop())
    } catch (err: any) {
      logger.error(`Renew user ${userName} failed!`)
      logger.error(err)
      continue
    }

    user.accessToken = client.accessToken
    user.refreshToken = client.refreshToken

    const profile = await client.getSelf().queryProfile()
    user.userId = profile.user.id
    user.screenName = profile.user.screenName

    logger.success(`Renew user: ${userName}!`)
  }
}
