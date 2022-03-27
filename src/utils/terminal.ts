import { logger } from '@poppinss/cliui'
import { program } from 'commander'
import terminalImage from 'terminal-image'

export const displayImage = async (url: string, height = 8) => {
  const response = await fetch(url)
    .then((res) => res.arrayBuffer())
    .then((ab) => Buffer.from(ab))
  const result = await terminalImage
    .buffer(response, {
      height,
      preserveAspectRatio: true,
    })
    .then((img) => img.trim())
  return {
    result,
    render: () => process.stdout.write(`${result}\n`),
  }
}

export const printIfRaw = (data: any) => {
  interface Options {
    raw?: boolean
    pretty?: boolean
  }
  const { raw, pretty } = program.opts<Options>()
  if (!raw) return

  process.stdout.write(`${JSON.stringify(data, null, pretty ? 2 : 0)}\n`)
  process.exit(0)
}

export const renderDivider = () =>
  logger.colors.gray('─'.repeat(process.stdout.columns || 30))
