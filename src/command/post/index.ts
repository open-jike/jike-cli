import { createCommand } from 'commander'
import { create } from './create'
import { feed } from './feed'

export const post = createCommand('post')
  .description('post-related operations')
  .addHelpText(
    'after',
    `

Example call:
  $ jike-cli post new --content="hello world"
  $ jike-cli post feed
`
  )
  .usage('<command> [flags]')
  .addCommand(create)
  .addCommand(feed)
