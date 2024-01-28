import { createCommand } from 'commander'
import { type Entity, limit } from 'jike-sdk'
import { ui } from '../ui'
import { createClient, displayUser, filterUsers } from '../utils/user'
import { displayImage, renderDivider } from '../utils/terminal'

interface LikeRankOptions {
  top: number
  count: number
}

export const likeRank = createCommand('like-rank')
  .description('Like ranking')
  .alias('lr')
  .option('-t, --top <top count>', 'top count', '20')
  .option('-c, --count <post count>', 'post count, 0 for all', '0')
  .action(() => {
    const opts = likeRank.opts<LikeRankOptions>()
    likeRanking({
      top: +opts.top,
      count: +opts.count,
    })
  })
const maxRetries = 3 // Set the maximum number of retries
const retryDelay = 1000 // Set the delay between retries in milliseconds

export const likeRanking = async ({ top, count }: LikeRankOptions) => {
  const [user] = filterUsers()

  const spinner = ui.logger.await('Fetching posts')

  const client = createClient(user)
  const posts = await client.getSelf().queryPersonalUpdate({
    limit: count > 0 ? limit.limitMaxCount(count) : limit.limitNone(),
  })

  const userMap: Record<string, { user: Entity.User; count: number }> = {}
  const repositoryErrorCount: Record<string, number> = {} // Track the error count for each repository
  for (const [i, post] of posts.entries()) {
    spinner.update(`Fetching post (${i + 1} / ${posts.length})`)
    const repositoryId = post.id

    let retryCount = 0
    let success = false

    while (!success && retryCount < maxRetries) {
      try {
        const users = await post.listLikedUsers()
        for (const user of users) {
          const id = user.id
          if (!userMap[id]) userMap[id] = { user, count: 1 }
          else userMap[id].count++
        }

        success = true // Mark success to exit the loop
      } catch {
        retryCount++
        repositoryErrorCount[repositoryId] =
          (repositoryErrorCount[repositoryId] || 0) + 1

        if (retryCount < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay)) // Wait for the specified delay
        }
      }
    }

    if (!success) {
      console.error(
        `Failed to fetch liked users for post ${
          i + 1
        } after ${maxRetries} attempts.`,
      )

      if (repositoryErrorCount[repositoryId] >= 3) {
        console.error(
          `Exiting due to repeated failures for repository ${repositoryId}`,
        )
        process.exit(1) // Exit the process with an error code
      }
    }
  }

  const divider = renderDivider()

  const countRanking = [
    ...new Set(Object.values(userMap).map(({ count }) => count)),
  ].sort((a, b) => b - a)
  const getRanking = (count: number) => countRanking.indexOf(count) + 1

  const ranking = await Promise.all(
    Object.values(userMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, top)
      .map(async ({ user, count }) => {
        const ranking = getRanking(count)
        let text = `${renderRanking(ranking)} ${displayUser(
          user,
        )} 点赞 ${ui.colors.cyan(`${count}`)} 次，${(
          (count / posts.length) *
          100
        ).toFixed(2)}%`

        if (ranking <= 3) {
          text = `${
            (await displayImage(user.avatarImage.thumbnailUrl, 3)).result
          }\n${text}\n${divider}`
        }
        return text
      }),
  )

  spinner.stop()

  process.stdout.write(ranking.join(`\n`))

  function renderRanking(rank: number) {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return `${rank.toString().padStart(`${countRanking.length}`.length)}.`
    }
  }
}
