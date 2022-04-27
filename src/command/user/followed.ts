import { logger } from '@poppinss/cliui'
import { createCommand } from 'commander'
import { createClient, filterUsers } from '../../utils/user'

export const followed = createCommand('followed')
  .description('output whether the follower is followed by following user')
  .option('-f, --following <following>', 'the username of the following user')
  .option('-F, --follower <follower>', 'the username of the follower user')
  .action(() => {
    const { following, follower } = followed.opts<{
      following?: string
      follower?: string
    }>()
    isFollowed(following, follower)
  })

export const isFollowed = async (following?: string, follower?: string) => {
  const [user] = filterUsers()
  const client = createClient(user)

  const getUser = (username?: string) =>
    username ? client.getUser(username) : client.getSelf()

  // TODO: auto select mode
  const isFollowed = await getUser(following).isFollowing(
    getUser(follower),
    'following'
  )

  logger.info(`${isFollowed ? 'Followed!' : 'Not followed.'}`)
}
