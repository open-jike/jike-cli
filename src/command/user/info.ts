import { createCommand } from 'commander'
import { ui } from '../../ui'
import { printIfRaw } from '../../utils/terminal'
import { filterUsers } from '../../utils/user'

export const info = createCommand('info')
  .alias('i')
  .description('print user info')
  .action(() => userInfo())

export const userInfo = () => {
  const [user] = filterUsers()
  printIfRaw(user)

  const breakLine = (str: string, width = 68) =>
    Array.from(str.matchAll(new RegExp(`.{1,${width}}`, 'g')))
      .map(([match]) => match)
      .join('\n')

  const rows = [
    ['Alias', user.alias],
    ['Username', user.username],
    ['Nickname', user.screenName],
    ['Endpoint', `${user.endpointUrl} (ID: ${user.endpointId})`],
    ['Bundle ID', user.bundleId],
    ['APP Version', user.appVersion],
    ['Build Number', user.buildNo],
    ['Device ID', user.deviceId],
    ['IDFV', user.idfv],
    ['User Agent', user.userAgent],
    ['Access Token', user.accessToken],
    ['Refresh Token', user.refreshToken],
  ]

  const t = ui.table().columnWidths([20, 70])
  rows.forEach((row) =>
    t.row([{ content: `${row[0]}:`, hAlign: 'right' }, breakLine(row[1])])
  )
  t.render()
}
