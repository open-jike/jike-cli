import { createCommand } from 'commander'
import { list } from './list'
import { login } from './login'
import { logout } from './logout'
import { profile } from './profile'
import { renew } from './renew'
import { view } from './view'

export const user = createCommand('user')
  .description('user-related operations')
  .addHelpText(
    'after',
    `

Example call:
  $ jike-cli user login
  $ jike-cli user profile 82D23B32-CF36-4C59-AD6F-D05E3552CBF3
  $ jike-cli user renew
  $ jike-cli user view 82D23B32-CF36-4C59-AD6F-D05E3552CBF3
`
  )
  .usage('<command> [flags]')
  .addCommand(renew)
  .addCommand(login)
  .addCommand(logout)
  .addCommand(list)
  .addCommand(profile)
  .addCommand(view)
