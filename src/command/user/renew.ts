import { createCommand } from 'commander'
import { ui } from '../../ui'
import { createClient, displayConfigUser, filterUsers } from '../../utils/user'

export const renew = createCommand('renew')
  .description('refresh user info and token')
  .alias('refresh')
  .action(() => renewUsers())

export const renewUsers = async () => {
  const users = filterUsers()

  for (const user of users) {
    const userName = displayConfigUser(user)
    const spinner = ui.logger.await(`Renew user: ${userName}`)
    const client = createClient(user)
    try {
      await client.renewToken().finally(() => spinner.stop())
    } catch (error: any) {
      ui.logger.error(`Renew user ${userName} failed!`)
      ui.logger.error(error)
      continue
    }
    ui.logger.success(`Renew user: ${userName}!`)
  }
}
