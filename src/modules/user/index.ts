import { createCommand } from 'commander'
import { list } from './list'
import { login } from './login'
import { logout } from './logout'
import { profile } from './profile'
import { renew } from './renew'
import { view } from './view'

export const user = createCommand('user')
  .description('manager users')
  .usage('<command> [flags]')
  .addCommand(renew)
  .addCommand(login)
  .addCommand(logout)
  .addCommand(list)
  .addCommand(profile)
  .addCommand(view)
