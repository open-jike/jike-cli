import { createCommand } from 'commander'
import open from 'open'
import { ui } from '../../ui'
import { PROFILE_URL } from '../../constants'
import { errorAndExit } from '../../utils/log'
import { createClient, filterUsers } from '../../utils/user'

interface ViewOptions {
  username?: string
  platform?: keyof typeof PROFILE_URL
}

export const view = createCommand('view')
  .aliases(['v', 'info', 'i'])
  .argument('[username]', 'the username of user')
  .description('open user profile in browser')
  .option(
    '-p, --platform <platform>',
    'supports web, mobile and mac, default is web',
    'web'
  )
  .action((username?: string) => {
    const opts = view.opts<ViewOptions>()
    viewUser({ ...opts, username })
  })

export const viewUser = async ({ username, platform }: ViewOptions) => {
  if (!username) {
    const [user] = filterUsers()
    const client = createClient(user)
    username = await client.getSelf().getUsername()
  }

  platform ||= 'web'
  if (!(platform in PROFILE_URL)) {
    errorAndExit(new Error(`invlid platform: ${platform}`))
  }

  const url = PROFILE_URL[platform] + username
  open(url)

  ui.logger.info(`${url} opened!`)
}
