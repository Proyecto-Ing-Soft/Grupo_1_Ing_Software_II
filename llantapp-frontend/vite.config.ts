import { defineConfig, type Plugin, type ResolvedConfig, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';

function redirigirRaizABase(): Plugin {
  let baseNormalizada = '/';

  return {
    name: 'redirect-root-to-base',

    configResolved(config: ResolvedConfig) {
      const cfgBase = (config.base as string) || '/';
      baseNormalizada = cfgBase.endsWith('/') ? cfgBase : `${cfgBase}/`;
    },

    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        const raw = req.url ?? '/';
        const pathname = raw.split('?')[0];

        if (baseNormalizada === '/') {
          if (pathname === '/llantapp' || pathname === '/llantapp/') {
            res.statusCode = 302;
            res.setHeader('Location', '/');
            res.end();
            return;
          }
          return next();
        }

        const baseSinSlash = baseNormalizada.slice(0, -1);
        if (pathname === '/' || pathname === baseSinSlash) {
          res.statusCode = 302;
          res.setHeader('Location', baseNormalizada);
          res.end();
          return;
        }

        next();
      });
    },

    configurePreviewServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const raw = req.url ?? '/';
        const pathname = raw.split('?')[0];

        if (baseNormalizada === '/') {
          if (pathname === '/llantapp' || pathname === '/llantapp/') {
            res.statusCode = 302;
            res.setHeader('Location', '/');
            res.end();
            return;
          }
          return next();
        }

        const baseSinSlash = baseNormalizada.slice(0, -1);
        if (pathname === '/' || pathname === baseSinSlash) {
          res.statusCode = 302;
          res.setHeader('Location', baseNormalizada);
          res.end();
          return;
        }

        next();
      });
    },

  };
}

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/llantapp/',
  plugins: [redirigirRaizABase(), react()],
}));
