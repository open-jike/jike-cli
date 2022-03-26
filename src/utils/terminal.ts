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
