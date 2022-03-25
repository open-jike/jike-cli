import { program } from 'commander'
import { version } from './modules/version'
import { versionNumber } from './constants'
import { user } from './modules/user'
import { config } from './utils/config'

async function main() {
  await config.waitForReady

  program
    .name('jike')
    .option('-u, --user <users...>', 'specify users')
    .addCommand(user)
    .addCommand(version)
    .version(versionNumber)
    .parse()
}

main()
