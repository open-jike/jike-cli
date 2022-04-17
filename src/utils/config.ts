import os from 'os'
import path from 'path'
import { mkdir } from 'fs/promises'
import { useJSON } from '@vue-reactivity/fs'
import type { JikeClientJSON } from 'jike-sdk'

export interface ConfigUser extends JikeClientJSON {
  alias: string
}

export interface Config {
  users: ConfigUser[]
}

export const configDir = path.resolve(os.homedir(), '.config/jike-cli')
export const configFile = path.resolve(configDir, 'config.json')
const defaultConfig: Config = { users: [] }

export const config = useJSON(configFile, {
  initialValue: defaultConfig,
  // watchFileChanges: true,
  space: 2,
  throttle: 300,
})

export const initConfig = async () => {
  await mkdir(configDir, { recursive: true })
  await config.waitForReady
}

export const isSameUser = (left: ConfigUser, right: ConfigUser) =>
  // left.endpointUrl === right.endpointUrl &&
  left.userId === right.userId
