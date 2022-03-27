import { createCommand } from 'commander'
import { JikeClient, limit } from 'jike-sdk/node'
import { logger } from '@poppinss/cliui'
import { displayUser, displayUsers, filterUsers } from '../../utils/user'
import { displayImage, printIfRaw, renderDivider } from '../../utils/terminal'
import { isMacOS } from '../../utils/os'
import type { Entity } from 'jike-sdk/node'

interface FeedOptions {
  count?: number
}

export const feed = createCommand('feed')
  .description('feeds you are following')
  // TODO interactive next page, lastKey
  .option('-c, --count <count>', 'notification max count', '30')
  .action(() => {
    const opts = feed.opts<FeedOptions>()
    viewFeeds(opts)
  })

const viewFeeds = async (opts: FeedOptions) => {
  const [user] = filterUsers()
  const client = JikeClient.fromJSON(user)
  const count = +(opts.count ?? 30)

  const updates = await client.queryFollowingUpdates({
    limit: limit.limitMaxCount(count),
  })
  printIfRaw(updates)

  const divider = renderDivider()
  const texts: string[] = [divider]
  for (const update of updates) {
    texts.push(await renderPost(update), divider)
  }

  process.stdout.write(`${texts.join('\n')}\n`)
}

async function renderPost(p: Entity.FollowingUpdate) {
  const texts: string[] = []
  if (p.type === 'PERSONAL_UPDATE') {
    texts.push(`${displayUsers(p.users)} 关注了 ${displayUsers(p.targetUsers)}`)
  } else if (p.type === 'ORIGINAL_POST') {
    const link = isMacOS
      ? logger.colors.gray(
          logger.colors.underline(`jike://page.jk/originalPost/${p.id}`)
        )
      : ''
    texts.push(
      (await displayImage(p.user.avatarImage.thumbnailUrl, 3)).result,
      `${displayUser(p.user)}${
        p.topic ? ` [${p.topic.content}]` : ''
      }: ${link}`,
      p.content
    )
    if (p.pictures && p.pictures.length > 0) {
      const images = await Promise.all(
        p.pictures.map((p) =>
          displayImage(p.middlePicUrl).then(({ result }) => result)
        )
      )
      texts.push(...images)
    }
    if (p.linkInfo) {
      texts.push(
        (await displayImage(p.linkInfo.pictureUrl)).result,
        `分享链接 [${p.linkInfo.title}](${logger.colors.blue(
          logger.colors.underline(p.linkInfo.linkUrl)
        )})`
      )
    }
  } else {
    // @ts-expect-error
    texts.push(`UNSUPPORTED: ${p.type}`)
  }

  return texts.filter((text) => !!text.trim()).join('\n')
  // console.log()
  // if (p.type === 'PERSONAL_UPDATE') console.log(JSON.stringify(p, undefined, 2))
  // types.add(p.type)

  // console.log(p)
  // const actions = new Set()

  // actions.add(p.action)

  // if (p.type === 'PERSONAL_UPDATE') console.log(p)
  // if (!p.user) console.log(p)
  // const userText = displayUser(p.user)
  // console.log(p.type === 'ORIGINAL_POST' ? '动态' : '转发')
  // console.log(p)

  // console.log(`${userText}`)
}
