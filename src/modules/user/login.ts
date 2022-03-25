import { randomUUID } from 'crypto'
import { prompt } from 'enquirer'
import { logger } from '@poppinss/cliui'
import { errorAndExit } from '../../utils/log'
import { config, isSameUser } from '../../utils/config'
import type { ConfigUser } from '../../utils/config'

export const login = async () => {
  interface Answers {
    endpointId: string
    endpointUrl: string
    bundleId: string
    appVersion: string
    buildNo: string
    userAgent: string
    areaCode: string
    mobile: string
    password: string
    alias: string
  }
  const answers = await prompt<Answers>([
    {
      type: 'input',
      name: 'endpointId',
      message: 'What is the endpoint id?',
      initial: process.env.API_ENDPOINT_ID,
    },
    {
      type: 'input',
      name: 'endpointUrl',
      message: 'What is the endpoint url?',
      initial: process.env.API_ENDPOINT_URL,
    },
    {
      type: 'input',
      name: 'bundleId',
      message: 'What is the bundle id?',
      initial: process.env.API_BUNDLE_ID,
    },
    {
      type: 'input',
      name: 'appVersion',
      message: 'What is the app version?',
      initial: process.env.API_APP_VERSION,
    },
    {
      type: 'input',
      name: 'buildNo',
      message: 'What is the build number?',
      initial: process.env.API_BUILD_NO,
    },
    {
      type: 'input',
      name: 'userAgent',
      message: 'What is the user agent?',
      initial: process.env.API_USER_AGENT,
    },
    {
      type: 'input',
      name: 'areaCode',
      message: 'What is your mobile phone area code?',
      initial: '86',
      validate: (value: string) => /^\d+$/.test(value),
    },
    {
      type: 'input',
      name: 'mobile',
      message: 'What is your mobile phone?',
      validate: (value: string) => /^\d+$/.test(value),
      initial: process.env.API_MOBILE,
    },
    {
      type: 'password',
      name: 'password',
      message: 'What is your password?',
      initial: process.env.API_PASSWORD,
    },
    {
      type: 'input',
      name: 'alias',
      message: 'Do you want to set an alias for this user? (not required)',
      required: false,
    },
  ])

  const deviceId = randomUUID()
  const idfv = randomUUID()

  const { JikeClient } = await import('jike-sdk/node')
  const client = new JikeClient({
    endpointId: answers.endpointId,
    endpointUrl: answers.endpointUrl,
    bundleId: answers.bundleId,
    appVersion: answers.appVersion,
    buildNo: answers.buildNo,
    userAgent: answers.userAgent,
    deviceId,
    idfv,
  })

  await client
    .loginWithPassword(answers.areaCode, answers.mobile, answers.password)
    .catch((err) => errorAndExit(new Error(err)))

  // Save Auth
  const profile = await client.getSelf().queryProfile()
  const user: ConfigUser = {
    endpointId: answers.endpointId,
    endpointUrl: answers.endpointUrl,
    bundleId: answers.bundleId,
    appVersion: answers.appVersion,
    buildNo: answers.buildNo,
    userAgent: answers.userAgent,
    accessToken: client.accessToken,
    refreshToken: client.refreshToken,
    deviceId,
    idfv,
    userId: profile.user.id,
    screenName: profile.user.screenName,
    alias: answers.alias.trim(),
  }
  const index = config.value.users.findIndex((_auth) => isSameUser(user, _auth))
  if (index > -1) {
    config.value.users[index] = user
  } else {
    config.value.users.push(user)
  }

  logger.success('Login success!')
}
