import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { createCommand } from 'commander'
import { ApiOptions } from 'jike-sdk'
import { format } from 'date-fns'
import enquirer from 'enquirer'
import { ui } from '../../ui'
import { configDir } from '../../utils/config'
import { createClient, displayConfigUser, filterUsers } from '../../utils/user'
import { errorAndExit } from '../../utils/log'

interface CreateOptions {
  content?: string
  topic?: string
}

export const create = createCommand('create')
  .alias('new')
  .description('send a post')
  .option('-c, --content <content>', 'the content you want to post')
  .option('-t, --topic <topicId>', 'topic id')
  .action(() => {
    const opts = create.opts<CreateOptions>()
    createPost(opts)
  })

/** 发布动态 */
export const createPost = async ({ content, topic }: CreateOptions) => {
  const users = filterUsers()

  if (!content) {
    // Create a file to input the content
    const draftDir = path.resolve(configDir, 'drafts')
    await mkdir(draftDir, { recursive: true })

    const draftFile = path.resolve(
      draftDir,
      `${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.txt`,
    )
    spawnSync('vim', [draftFile], { stdio: 'inherit' })

    content = await readFile(draftFile, 'utf-8').catch((error) => {
      ui.logger.warning(error)
      return ''
    })
  }

  content = content?.trim()
  if (!content) {
    errorAndExit(new Error('Content is required.'))
  }

  const s = ui.sticker().heading('✍️ Content')
  content.split('\n').forEach((line) => s.add(line))
  s.render()

  const { isConfirm } = await enquirer.prompt<{ isConfirm: boolean }>({
    type: 'confirm',
    name: 'isConfirm',
    message: `Are you sure to send the above with accounts ${users
      .map((user) => displayConfigUser(user))
      .join(', ')}?`,
    initial: true,
  })
  if (!isConfirm) {
    ui.logger.error('User canceled.')
    return
  }

  for (const user of users) {
    const client = createClient(user)
    await client
      .createPost(ApiOptions.PostType.ORIGINAL, content, {
        topicId: topic,
      })
      .catch((error) => ui.logger.fatal(error))
    ui.logger.success(
      `${ui.colors.bold(displayConfigUser(user))} posted successfully!`,
    )
  }
}
