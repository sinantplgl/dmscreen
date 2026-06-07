import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-expect-error - plain .mjs handler shared with the prod Node server
import { ddbApiHandler } from './server/ddbHandler.mjs'

// Dev-server middleware that serves the /ddb-api proxy (Cobalt -> Bearer ->
// character fetch). Mirrors what server/serve.mjs does in production, so the
// D&D Beyond native provider works the same in `npm run dev` and in Docker.
function ddbProxyPlugin(): Plugin {
  return {
    name: 'ddb-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const handled = await ddbApiHandler(req, res)
        if (!handled) next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), ddbProxyPlugin()],
  server: {
    host: true,
    port: 5173,
  },
})
