import { createCommand } from 'commander'
import { info } from './info'
import { list } from './list'
import { login } from './login'
import { logout } from './logout'
import { profile } from './profile'
import { renew } from './renew'
import { view } from './view'
import { alias } from './alias'

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
  $ jike-cli user info
  $ jike-cli user alias -u <user> <alias>
`
  )
  .usage('<command> [flags]')
  .addCommand(renew)
  .addCommand(login)
  .addCommand(logout)
  .addCommand(list)
  .addCommand(info)
  .addCommand(profile)
  .addCommand(view)
  .addCommand(alias)
