import process from 'process'
import { createCommand } from 'commander'
import { logger, sticker, table } from '@poppinss/cliui'
import { format } from 'date-fns'
import { JikeClient } from 'jike-sdk/node'
import { filterUsers } from '../../utils/user'
import { displayImage } from '../../utils/terminal'
import type { ApiResponses } from 'jike-sdk/node'

const { colors } = logger

export interface ProfileOptions {
  username?: string
  raw?: boolean
  pretty?: boolean
  table?: boolean
}

export const profile = createCommand('profile')
  .argument('[username]', 'the username of user')
  .description('query user profile')
  .option('-r, --raw', 'output raw data')
  .option('-p, --pretty', 'pretty raw data')
  .option('-t, --table', 'display data in table')
  .action((username: string) => {
    const opts = profile.opts<Omit<ProfileOptions, 'username'>>()
    queryProfile({ ...opts, username })
  })

export const queryProfile = async ({
  username,
  raw,
  pretty,
  table: isTable,
}: ProfileOptions) => {
  const [user] = filterUsers()
  const client = JikeClient.fromJSON(user)

  let result: ApiResponses.Users.Profile
  if (username) {
    result = await client.getUser(username).queryProfile()
  } else {
    result = await client.getSelf().queryProfile()
  }

  if (raw) {
    process.stdout.write(JSON.stringify(result, null, pretty ? 2 : 0))
    return
  }

  await displayImage(result.user.avatarImage.middlePicUrl)

  const createdAt = new Date(result.user.createdAt)
  const createdAtStr = format(
    new Date(result.user.createdAt),
    'yyyy-MM-dd HH:mm:ss'
  )
  const createdDays = (
    (Date.now() - createdAt.valueOf()) /
    1000 /
    86400
  ).toFixed(2)

  const isMyProfile = (
    profile: ApiResponses.Users.Profile
  ): profile is ApiResponses.Users.MyProfile => profile.user.id === user.userId

  const formatFollowedCount = (count: number) =>
    colors.bold(count === 100000 ? colors.red('99999+') : `${count}`)

  if (isTable) showTable()
  else showText()

  function showText() {
    const texts: string[][] = [
      [
        colors.yellow(colors.bold(result.user.screenName)),
        colors.gray(result.user.username),
        toGender(result.user.gender),
      ],
      [createdAtStr, `${colors.bold(createdDays)} 天`],
      [],
      result.user.profileTags.map((tag) => tag.text),
      [
        `${colors.bold(`${result.user.statsCount.followingCount}`)} 关注`,
        `${formatFollowedCount(result.user.statsCount.followedCount)} 被关注`,
        `${colors.bold(`${result.user.statsCount.respectedCount}`)} 夸夸`,
      ],
      [],
      [result.user.bio],
      [],
      [
        `动态获得 ${colors.bold(`${result.user.statsCount.liked}`)} 次赞`,
        `获得 ${colors.bold(
          `${result.user.statsCount.highlightedPersonalUpdates}`
        )} 次精选`,
      ],
    ]

    if (isMyProfile(result)) {
      const profileVisitInfo = result.user.profileVisitInfo
      if (profileVisitInfo)
        texts.push([
          `最近访客：${colors.yellow(
            profileVisitInfo.latestVisitor.screenName
          )}`,
          colors.gray(profileVisitInfo.latestVisitor.username),
        ])
    }

    texts.push(
      [],
      [colors.underline(`https://web.okjike.com/u/${result.user.username}`)]
    )

    const lines = texts.flatMap((fields) =>
      fields
        .filter((field) => !!field)
        .join(' | ')
        .split('\n')
    )

    const s = sticker()
    lines.forEach((line) => s.add(line))
    s.render()
  }

  function showTable() {
    const fields: Record<string, string> = {
      昵称: `${colors.yellow(result.user.screenName)} (${colors.gray(
        result.user.username
      )})`,
      性别: toGender(result.user.gender),
      个性签名: result.user.bio,
      星座: result.user.zodiac || '-',
      行业: result.user.industry || '-',
      学校: result.user.school?.name || '-',
      注册时间: `${createdAtStr} (${createdDays} 天)`,
      关注数: String(result.user.statsCount.followingCount),
      被关注: String(result.user.statsCount.followedCount),
      被夸夸: String(result.user.statsCount.respectedCount),
      动态统计: `动态获得 ${result.user.statsCount.liked} 次赞，获得 ${result.user.statsCount.highlightedPersonalUpdates} 次精选`,
    }

    if (isMyProfile(result)) {
      const profileVisitInfo = result.user.profileVisitInfo
      if (profileVisitInfo) {
        const { latestVisitor } = profileVisitInfo
        fields['最近访客'] = `${colors.yellow(
          latestVisitor.screenName
        )} (${colors.gray(latestVisitor.username)})`
      }
    }

    const t = table()
    t.columnWidths([15, 65])
    Object.entries(fields).forEach(([key, value]) =>
      t.row([{ content: key, hAlign: 'right' }, value])
    )
    t.render()
  }
}

const toGender = (gender?: 'MALE' | 'FEMALE') => {
  switch (gender) {
    case 'MALE':
      return colors.blue('男')
    case 'FEMALE':
      return colors.magenta('女')
    default:
      return '-'
  }
}
