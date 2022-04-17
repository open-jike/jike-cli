import { createCommand } from 'commander'
import { create } from './create'
import { feed } from './feed'
import { list } from './list'

export const post = createCommand('post')
  .description('post-related operations')
  .addHelpText(
    'after',
    `

Example call:
  $ jike-cli post new --content="hello world"
  $ jike-cli post feed
  $ jike-cli post list
`
  )
  .usage('<command> [flags]')
  .addCommand(create)
  .addCommand(feed)
  .addCommand(list)
