import { randomUUID } from 'crypto'
import enquirer from 'enquirer'
import { logger } from '@poppinss/cliui'
import { JikeClient } from 'jike-sdk/node'
import { createCommand } from 'commander'
import { errorAndExit } from '../../utils/log'
import { config, isSameUser } from '../../utils/config'
import type { ConfigUser } from '../../utils/config'

export const login = createCommand('login')
  .description('login or re-login a user')
  .action(() => loginUser())

export const loginUser = async () => {
  const apiConfig = await enquirer.prompt<{
    endpointId: string
    endpointUrl: string
    bundleId: string
    appVersion: string
    buildNo: string
    userAgent: string
  }>([
    {
      type: 'input',
      name: 'endpointId',
      message: 'What is the endpoint id?',
      initial: process.env.API_ENDPOINT_ID || 'jike',
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
  ])

  const deviceId = randomUUID()
  const idfv = randomUUID()

  const client = new JikeClient({
    ...apiConfig,
    deviceId,
    idfv,
  })

  type LoginMethod = 'mobile-password' | 'mobile-sms'
  const { loginMethod } = await enquirer.prompt<{ loginMethod: LoginMethod }>({
    name: 'loginMethod',
    message: 'What is your preferred login method?',
    type: 'select',
    choices: [
      { name: 'mobile-password', message: 'Mobile phone and password' },
      { name: 'mobile-sms', message: 'Mobile phone and SMS code' },
    ],
  })

  switch (loginMethod) {
    case 'mobile-password':
      await loginWithPassword(client)
      break
    case 'mobile-sms':
      await loginWithSms(client)
      break
    default:
      errorAndExit(new Error('Unknown login method'))
  }

  const { alias } = await enquirer.prompt<{ alias: string }>({
    type: 'input',
    name: 'alias',
    message: 'Do you want to set an alias for this user? (not required)',
    required: false,
  })

  // Save Auth
  const profile = await client.getSelf().queryProfile()
  const user: ConfigUser = {
    ...apiConfig,
    accessToken: client.accessToken,
    refreshToken: client.refreshToken,
    deviceId,
    idfv,
    userId: profile.user.id,
    screenName: profile.user.screenName,
    alias: alias.trim(),
  }
  const index = config.value.users.findIndex((_auth) => isSameUser(user, _auth))
  if (index > -1) {
    config.value.users[index] = user
  } else {
    config.value.users.push(user)
  }

  logger.success('Login success!')
}

const questions = {
  areaCode: {
    type: 'input',
    name: 'areaCode',
    message: 'What is your mobile phone area code?',
    initial: '86',
    validate: (value: string) => /^\d+$/.test(value),
  },
  mobile: {
    type: 'input',
    name: 'mobile',
    message: 'What is your mobile phone?',
    validate: (value: string) => /^\d+$/.test(value),
    initial: process.env.API_MOBILE,
  },
}

const loginWithPassword = async (client: JikeClient) => {
  interface Auth {
    areaCode: string
    mobile: string
    password: string
  }

  const { areaCode, mobile, password } = await enquirer.prompt<Auth>([
    questions.areaCode,
    questions.mobile,
    {
      type: 'password',
      name: 'password',
      message: 'What is your password?',
      initial: process.env.API_PASSWORD,
    },
  ])

  await client
    .loginWithPassword(areaCode, mobile, password)
    .catch((err) => errorAndExit(new Error(err)))
}

const loginWithSms = async (client: JikeClient) => {
  const { areaCode, mobile } = await enquirer.prompt<{
    areaCode: string
    mobile: string
  }>([questions.areaCode, questions.mobile])

  await client
    .sendSmsCode(areaCode, mobile)
    .catch((err) => errorAndExit(new Error(err)))

  logger.success('SMS code sent!')

  const { smsCode } = await enquirer.prompt<{ smsCode: string }>({
    type: 'input',
    name: 'smsCode',
    message: 'What is the SMS code?',
    validate: (value: string) => /^\d{6}$/.test(value),
  })

  await client
    .loginWithSmsCode(areaCode, mobile, smsCode)
    .catch((err) => errorAndExit(new Error(err)))
}
