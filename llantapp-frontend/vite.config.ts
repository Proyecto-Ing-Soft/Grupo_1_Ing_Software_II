import { defineConfig, type Plugin, type ResolvedConfig, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';

const BASE = '/llantapp/';

function redirectRootToBase(): Plugin {
  let base = BASE;

  return {
    name: 'redirect-root-to-base',

    configResolved(config: ResolvedConfig) {
      base = (config.base as string) || base;
      if (!base.endsWith('/')) base += '/';
    },

    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? '';
        if (url === '/' || url === '/llantapp') {
          res.statusCode = 302;
          res.setHeader('Location', base);
          res.end();
          return;
        }
        next();
      });
    },

    configurePreviewServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = req.url ?? '';
        if (url === '/' || url === '/llantapp') {
          res.statusCode = 302;
          res.setHeader('Location', base);
          res.end();
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  base: BASE,
  plugins: [react(), redirectRootToBase()],
});
