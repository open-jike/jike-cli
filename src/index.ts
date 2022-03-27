import { run } from './command'
import { initConfig } from './utils/config'

async function main() {
  await initConfig()
  run()
}

main()
