import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm'],
  target: 'node12',
  clean: true,
  platform: 'node',
})
