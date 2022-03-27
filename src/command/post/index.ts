import { createCommand } from 'commander'
import { create } from './create'

export const post = createCommand('post')
  .description('post-related operations')
  .addHelpText(
    'after',
    `

Example call:
  $ jike-cli post new --content="hello world"
`
  )
  .usage('<command> [flags]')
  .addCommand(create)
