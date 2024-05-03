import { defineConfig } from "vite"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "dnd-rxjs-ts": path.resolve(__dirname, "./src"),
    },
  },
})
