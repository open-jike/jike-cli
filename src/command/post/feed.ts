import process from 'node:process'
import { createCommand } from 'commander'
import {
  ApiOptions,
  type Entity,
  type JikePostWithDetail,
  limit,
} from 'jike-sdk'
import { ui } from '../../ui'
import {
  createClient,
  displayUser,
  displayUsers,
  filterUsers,
} from '../../utils/user'
import { displayImage, printIfRaw, renderDivider } from '../../utils/terminal'
import { isMacOS } from '../../utils/os'

interface FeedOptions {
  count?: number
}

export const feed = createCommand('feed')
  .description('feeds you are following')
  // TODO interactive next page, lastKey
  .option('-c, --count <count>', 'post max count', '30')
  .action(() => {
    const opts = feed.opts<FeedOptions>()
    viewFeeds(opts)
  })

const viewFeeds = async (opts: FeedOptions) => {
  const [user] = filterUsers()
  const client = createClient(user)
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

async function renderPost(
  p: JikePostWithDetail | ({ actionTime: string } & Entity.PersonalUpdate),
) {
  const texts: string[] = []
  if (p.type === 'PERSONAL_UPDATE') {
    switch (p.action) {
      case 'LIVE_SHARE':
        texts.push(
          // @ts-expect-error
          `${displayUsers(p.users)} ${p.verb}`,
          // @ts-expect-error
          (await displayImage(p.live.picture.picUrl)).result,
          // @ts-expect-error
          p.live.title,
        )
        break
      case 'USER_FOLLOW':
        texts.push(
          `${displayUsers(p.users)} 关注了 ${displayUsers(p.targetUsers)}`,
        )
        break
      default:
        texts.push(`unsupported action: ${p.action}`)
    }
  } else if (p.type === ApiOptions.PostType.ORIGINAL) {
    const detail = p.detail as Entity.OriginalPost
    const link = isMacOS
      ? ui.colors.gray(
          ui.colors.underline(`jike://page.jk/originalPost/${p.id}`),
        )
      : ''
    texts.push(
      (await displayImage(detail.user.avatarImage.thumbnailUrl, 3)).result,
      `${displayUser(detail.user)}${
        detail.topic ? ` [${detail.topic.content}]` : ''
      }: ${link}`,
      detail.content,
    )
    if (detail.pictures && detail.pictures.length > 0) {
      const images = await Promise.all(
        detail.pictures.map((p) =>
          displayImage(p.middlePicUrl).then(({ result }) => `${result}\n`),
        ),
      )
      texts.push(...images)
    }
    if (detail.linkInfo) {
      texts.push(
        (await displayImage(detail.linkInfo.pictureUrl)).result,
        `分享链接 [${detail.linkInfo.title}](${ui.colors.blue(
          ui.colors.underline(detail.linkInfo.linkUrl),
        )})`,
      )
    }
  } else {
    texts.push(`UNSUPPORTED: ${p.type}`)
  }

  return texts.filter((text) => !!text.trim()).join('\n')
}
