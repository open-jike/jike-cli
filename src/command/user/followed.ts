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

  const followingUser = getUser(following)
  const followerUser = getUser(follower)

  const followingProfile = await followingUser.queryProfile()
  const followerProfile = await followerUser.queryProfile()

  const mode =
    followingProfile.user.statsCount.followingCount >
    followerProfile.user.statsCount.followedCount
      ? 'follower'
      : 'following'

  const isFollowed = await getUser(following).isFollowing(
    getUser(follower),
    mode
  )

  logger.info(isFollowed ? 'Followed!' : 'Not followed.')
}
