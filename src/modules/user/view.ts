import { logger } from '@poppinss/cliui'
import { createCommand } from 'commander'
import { JikeClient } from 'jike-sdk/node'
import open from 'open'
import { filterUsers } from '../../utils/user'

interface ViewOptions {
  username: string
  mobile: boolean
}

export const view = createCommand('view')
  .argument('[username]', 'the username of user')
  .description('open user profile in browser')
  .option('-m, --mobile', 'view page for mobile phone')
  .action((username?: string) => viewUser(username))

export const viewUser = async (username?: string) => {
  const { mobile } = view.opts<Omit<ViewOptions, 'username'>>()
  if (!username) {
    const [user] = filterUsers()
    const client = JikeClient.fromJSON(user)
    username = await client.getSelf().getUsername()
  }

  const url = mobile
    ? `https://m.okjike.com/users/${username}`
    : `https://web.okjike.com/u/${username}`

  open(url)
  logger.info(`${url} opened!`)
}
