import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      dndrxjs: new URL('./src', import.meta.url).pathname,
    },
  },
})
