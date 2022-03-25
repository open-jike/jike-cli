import { logger } from '@poppinss/cliui'
import { JikeClient } from 'jike-sdk/node'
import { filterUsers } from '../../utils/options'

export const renew = async () => {
  const users = filterUsers()

  for (const user of users) {
    const userName = user.alias || user.screenName
    const spinner = logger.await(`Renew user: ${userName}...`)
    const client = new JikeClient({ ...user })
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
