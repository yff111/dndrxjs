import path from 'node:path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      dndrxjs: path.resolve(__dirname, './src'),
    },
  },
})
