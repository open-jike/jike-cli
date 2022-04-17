import { createCommand } from 'commander'
import { ApiOptions, limit } from 'jike-sdk'
import { logger } from '@poppinss/cliui'
import { createClient, displayUser, filterUsers } from '../../utils/user'
import { displayImage, printIfRaw, renderDivider } from '../../utils/terminal'
import { isMacOS } from '../../utils/os'
import type { JikePostWithDetail } from 'jike-sdk'

interface ListOptions {
  count?: number
  username?: string
}

export const list = createCommand('list')
  .alias('ls')
  .description('feeds you are following')
  .argument('[username]', 'the username of user')
  // TODO interactive next page, lastKey
  .option('-c, --count <count>', 'post max count', '30')
  .action((username: string) => {
    const opts = list.opts<ListOptions>()
    listPosts({ ...opts, username })
  })

const listPosts = async (opts: ListOptions) => {
  const [user] = filterUsers()
  const client = createClient(user)
  const count = +(opts.count ?? 30)
  opts.username ||= await client.getSelf().getUsername()

  const updates = await client.getUser(opts.username).queryPersonalUpdate({
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

async function renderPost(p: JikePostWithDetail) {
  const detail = p.getDetail()
  const texts: string[] = []
  if (p.type === ApiOptions.PostType.ORIGINAL) {
    const link = isMacOS
      ? logger.colors.gray(
          logger.colors.underline(`jike://page.jk/originalPost/${p.id}`)
        )
      : ''
    texts.push(
      (await displayImage(detail.user.avatarImage.thumbnailUrl, 3)).result,
      `${displayUser(detail.user)}${
        // @ts-ignore
        detail.topic ? ` [${detail.topic.content}]` : ''
      }: ${link}`,
      detail.content
    )
    if (detail.pictures && detail.pictures.length > 0) {
      const images = await Promise.all(
        detail.pictures.map((p) =>
          displayImage(p.middlePicUrl).then(({ result }) => result)
        )
      )
      texts.push(...images)
    }
    // @ts-expect-error
    if (detail.linkInfo) {
      texts.push(
        // @ts-expect-error
        (await displayImage(detail.linkInfo.pictureUrl)).result,
        // @ts-expect-error
        `分享链接 [${detail.linkInfo.title}](${logger.colors.blue(
          // @ts-expect-error
          logger.colors.underline(detail.linkInfo.linkUrl)
        )})`
      )
    }
  } else {
    // TODO: repost
    texts.push(`UNSUPPORTED: ${p.type}`)
  }

  return texts.filter((text) => !!text.trim()).join('\n')
}
