import process from 'node:process'
import { createCommand } from 'commander'
import { type JikePostWithDetail, limit } from 'jike-sdk'
import { ui } from '../../ui'
import { createClient, displayUser, filterUsers } from '../../utils/user'
import { displayImage, printIfRaw, renderDivider } from '../../utils/terminal'
import { isMacOS } from '../../utils/os'

interface ListOptions {
  count?: number
  username?: string
}

export const list = createCommand('list')
  .alias('ls')
  .description('view posts of user')
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
  if (detail.type === 'ORIGINAL_POST') {
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
          displayImage(p.middlePicUrl).then(({ result }) => result),
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
    // TODO: repost
    texts.push(`UNSUPPORTED: ${p.type}`)
  }

  return texts.filter((text) => !!text.trim()).join('\n')
}
