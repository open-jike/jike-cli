import process from 'node:process'
import { createCommand } from 'commander'
import { type Entity, limit } from 'jike-sdk'
import { format } from 'date-fns'
import { ui } from '../ui'
import { displayImage, printIfRaw, renderDivider } from '../utils/terminal'
import { createClient, displayUsers, filterUsers } from '../utils/user'

interface NotificationOptions {
  avatar?: boolean
  image?: boolean
  count?: number
}

export const msg = createCommand('msg')
  .description('display notifications')
  .aliases(['message', 'notification'])
  .option('--no-avatar', 'do not show avatar')
  .option('--no-image', 'do not show image')
  .option('-c, --count <count>', 'notification max count', '30')
  .action(() => {
    const opts = msg.opts<NotificationOptions>()
    showNotifications(opts)
  })

const showNotifications = async (opts: NotificationOptions) => {
  const [user] = filterUsers()
  const client = createClient(user)

  const count = +(opts.count ?? 30)
  const spinner = ui.logger.await('Loading notifications...')
  const notifications = await client
    .queryNotifications({
      limit: limit.limitMaxCount(count),
      onNextPage: (page, key, data) => {
        spinner.update(
          `Loading notifications... (page ${page}, ${+(
            (data.length / count) *
            100
          ).toFixed(2)}%)`,
        )
        return true
      },
    })
    .finally(() => spinner.stop())

  ui.logger.success('Loading notifications done!')

  printIfRaw(notifications)

  {
    const divider = renderDivider()

    let spinner: ReturnType<typeof ui.logger.await> | undefined
    if (opts.image) spinner = ui.logger.await('Downloading images')

    const texts = (
      await Promise.all(
        notifications.map((n) =>
          renderNotification(n, opts).then((result) => [...result, divider]),
        ),
      ).finally(() => spinner?.stop())
    ).flat()
    texts.unshift(divider)

    process.stdout.write(`${texts.join('\n')}\n`)
  }
}

const EMPTY_PLACEHOLDER = '(EMPTY)'

async function renderNotification(
  n: Entity.Notification,
  { avatar, image }: NotificationOptions,
): Promise<string[]> {
  const users = n.actionItem?.users ?? []
  let usersText = displayUsers(users)
  const bio = ui.colors.gray(users[0].bio ?? '')

  const usersCount = n.actionItem?.usersCount
  if (typeof usersCount === 'number' && users.length !== usersCount) {
    usersText += `等 ${usersCount} 人`
  }
  const content = n.actionItem?.content
  let refContent = n.referenceItem?.content?.trim() || '(empty)'
  if (refContent.length > 100) {
    refContent = `${refContent.slice(0, 100)}...`
  }

  const userAvatarUrl = users[0]?.avatarImage.smallPicUrl
  const userAvatar = (height: number) => {
    if (!avatar || !image) return EMPTY_PLACEHOLDER
    return displayImage(userAvatarUrl, height).then(({ result }) => result)
  }

  const referenceImageUrl = n.referenceItem?.referenceImageUrl
  const referenceImage = (height = 8) => {
    if (!image || !referenceImageUrl) return EMPTY_PLACEHOLDER
    return displayImage(referenceImageUrl, height).then(({ result }) => result)
  }

  let texts = await renderStory()
  texts ||= await renderPersonalUpdate()
  texts ||= await renderUser()
  texts ||= await renderAvatar()

  if (texts) {
    const timeStr = format(new Date(n.createdAt), 'yyyy-MM-dd HH:mm:ss')
    texts.unshift(ui.colors.gray(timeStr))
    return texts.filter((text) => text.trim() !== EMPTY_PLACEHOLDER)
  } else {
    warnUnknownType(n)
    return []
  }

  async function renderStory(): Promise<string[] | undefined> {
    switch (n.type) {
      case 'LIKE_STORY':
        return [`👍 ${usersText}赞了你的日记`, await referenceImage()]
      case 'REPLIED_TO_STORY_COMMENT':
        return [await userAvatar(4), `📨 ${usersText}回复了你的留言`, content]
      case 'COMMENT_STORY':
        return [
          `📨 ${usersText}给你的日记留言了：`,
          content,
          await referenceImage(),
        ]
    }
  }

  async function renderPersonalUpdate(): Promise<string[] | undefined> {
    switch (n.type) {
      case 'LIKE_PERSONAL_UPDATE':
        return [`👍 ${usersText}赞了你的动态：`, refContent]
      case 'COMMENT_PERSONAL_UPDATE':
        return [await userAvatar(4), `📨 ${usersText}评论了你`, content]
      case 'REPLIED_TO_PERSONAL_UPDATE_COMMENT':
        return [await userAvatar(4), `📨 ${usersText}回复了你的评论`, content]
      case 'LIKE_PERSONAL_UPDATE_COMMENT':
        return [`👍 ${usersText}赞了你的评论：`, refContent]
      case 'COMMENT_AND_REPOST':
        return [`📨 ${usersText}评论并转发了你：`, content]
    }
  }

  async function renderUser(): Promise<string[] | undefined> {
    switch (n.type) {
      case 'USER_RESPECT':
        return [`🎉 ${usersText}夸了夸你`, content]
      case 'MENTION':
        return [`👋 ${usersText}@了你：`, content]
      case 'USER_FOLLOWED':
        return [await userAvatar(4), bio, `✨ ${usersText}关注了你`]
      case 'USER_SILENT_FOLLOWED':
        return [
          await userAvatar(4),
          bio,
          `✨ ${usersText}关注了你（静默关注 🤔）`,
        ]
      case 'PERSONAL_UPDATE_REPOSTED':
        return [
          await userAvatar(4),
          `🔗 ${usersText}转发了你的动态`,
          refContent,
        ]
    }
  }

  async function renderAvatar(): Promise<string[] | undefined> {
    switch (n.type) {
      case 'LIKE_AVATAR':
        return [await referenceImage(4), `👍 ${usersText}赞了你的头像`]
      case 'AVATAR_GREET':
        return [await referenceImage(4), `👉 ${usersText}赞了你的头像`]
    }
  }
}

const warnUnknownType = (n: Entity.Notification) => {
  const info = [n.type, n.actionType, n.actionItem.type].join('||')
  ui.logger.warning(
    `Unknown notification: ${info}. Please send it to developer, thanks!`,
  )
}
