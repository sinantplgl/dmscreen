import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-expect-error - plain .mjs handler shared with the prod Node server
import { ddbApiHandler } from './server/ddbHandler.mjs'
// @ts-expect-error - plain .mjs handler shared with the prod Node server
import { backupApiHandler } from './server/backupHandler.mjs'

// Dev-server middleware that mirrors what server/serve.mjs does in production,
// so the /ddb-api proxy (Cobalt -> Bearer -> character fetch) and the
// /backup-api on-disk backup work the same in `npm run dev` and in Docker.
function serverApiPlugin(): Plugin {
  return {
    name: 'server-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (await ddbApiHandler(req, res)) return
        if (await backupApiHandler(req, res)) return
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), serverApiPlugin()],
  server: {
    host: true,
    port: 5173,
  },
})
