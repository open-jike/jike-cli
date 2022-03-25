import { table } from '@poppinss/cliui'
import { config } from '../../utils/config'

export const list = () => {
  const t = table().head([
    'Alias',
    'Endpoint ID',
    'Endpoint URL',
    'User ID',
    'Nickname',
  ])

  for (const user of config.value.users) {
    if (!user) continue
    t.row([
      { content: user.alias || '-', hAlign: 'center' },
      { content: user.endpointId, hAlign: 'center' },
      user.endpointUrl,
      user.userId,
      user.screenName,
    ])
  }

  t.render()
}
