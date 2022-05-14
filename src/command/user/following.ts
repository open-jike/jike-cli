import { createCommand } from 'commander'
import { createClient, filterUsers } from '../../utils/user'
import type { Entity } from 'jike-sdk'
import { logger } from '@poppinss/cliui'

export interface FollowingOptions {
  username?: string
}

export const following = createCommand('following')
  .description('List users target user followed')
  .argument('[username]', 'the username of user')
  .action((username: string) => listFollowing({ username }))

export const listFollowing = async ({ username = '' }: FollowingOptions) => {
  const [user] = filterUsers()
  const client = createClient(user)

  let users: Entity.User[]
  if (username) {
    users = await client.getUser(username).queryFollowings()
  } else {
    users = await client.getSelf().queryFollowings()
  }

  // users.map((user) => [user.username, user.screenName].join(' ')).join('\n')
  process.stdout.write()
}
