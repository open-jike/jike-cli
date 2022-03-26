import { program } from 'commander'
import { version } from './modules/version'
import { versionNumber } from './constants'
import { user } from './modules/user'
import { post } from './modules/post'
import { initConfig } from './utils/config'

async function main() {
  await initConfig()

  program
    .name('jike')
    .option('-u, --user <users...>', 'specify users')
    .addCommand(user)
    .addCommand(post)
    .addCommand(version)
    .version(versionNumber)
    .parse()
}

main()
