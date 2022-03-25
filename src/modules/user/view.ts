import { logger } from '@poppinss/cliui'
import { createCommand } from 'commander'
import open from 'open'
import { createClient, filterUsers } from '../../utils/user'

export const view = createCommand('view')
  .description('query user view')
  .option('-U, --username <username>', 'the username of user')
  .option('-m, --mobile', 'view page for mobile phone')
  .action(() => viewUser())

export const viewUser = async () => {
  let { username, mobile } = view.opts<{ username: string; mobile: boolean }>()
  if (!username) {
    const [user] = filterUsers()
    const client = createClient(user)
    username = await client.getSelf().getUsername()
  }

  const url = mobile
    ? `https://m.okjike.com/users/${username}`
    : `https://web.okjike.com/u/${username}`

  open(url)
  logger.info(`${url} opened!`)
}
