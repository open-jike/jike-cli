import os from 'os'
import path from 'path'
import { useJSON } from '@vue-reactivity/fs'
import type { ApiConfigResolved } from 'jike-sdk'

export interface ConfigUser extends Omit<ApiConfigResolved, 'beforeRetry'> {
  userId: string
  screenName: string
  refreshToken: string
  alias: string
}

export interface Config {
  users: ConfigUser[]
}

const configPath = path.resolve(os.homedir(), '.jike-cli.json')
const defaultConfig: Config = { users: [] }

export const config = useJSON(configPath, {
  initialValue: defaultConfig,
  // watchFileChanges: true,
  space: 2,
  throttle: 300,
})

export const isSameUser = (left: ConfigUser, right: ConfigUser) =>
  // left.endpointUrl === right.endpointUrl &&
  left.userId === right.userId
