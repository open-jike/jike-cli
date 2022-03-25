import { createCommand } from 'commander'
import { list } from './list'
import { login } from './login'
import { logout } from './logout'
import { renew } from './renew'

export const user = createCommand('user')
  .description('manager users')
  .usage('<command> [flags]')

user.command('list').alias('ls').description('print user list').action(list)
user.command('login').description('login or re-login a user').action(login)
user
  .command('logout [users...]')
  .description('logout users')
  .usage('account1 [account2...]')
  .action(logout)
user
  .command('renew')
  .description('refresh user info and token')
  .alias('refresh')
  .action(renew)
