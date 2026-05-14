import https from 'node:https';
import fs from 'fs';
import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createServer() {
  const app = express();

  const isProd = true // process.env.NODE_ENV === 'production'
  ;
  // Создаем Vite сервер в режиме middleware
  const vite = await createViteServer({
    root: __dirname,
    middlewareMode: isProd ? 'ssr' : true, // В проде используем ssr, в деве — middleware
    https: isProd ? undefined : { // В деве Vite сам поднимает HMR сервер с https, если нужно
      key: fs.readFileSync('path/to/key.pem'),
      cert: fs.readFileSync('path/to/cert.pem')
    },
    appType: 'custom',
  });

  app.use(vite.middlewares);

  app.use(async (req, res) => {
    const url = req.originalUrl;

    try {
      // 1. Читаем index.html
      let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');

      // 2. Применяем Vite HTML трансформации
      template = await vite.transformIndexHtml(url, template);

      // 3. Загружаем серверный entry
      const { render } = await vite.ssrLoadModule('/src/entry-server.tsx');

      const { html, meta } = await render(url);

      const appHtml = template
        .replace('<!--ssr-outlet-->', html)
        .replace('<!--app-title-->', escapeHtml(meta.title))
        .replace('<!--app-description-->', escapeHtml(meta.description))
        .replace('<!--app-og-title-->', escapeHtml(meta.ogTitle))
        .replace('<!--app-og-description-->', escapeHtml(meta.ogDescription))
        .replace('<!--app-og-image-->', escapeHtml(meta.ogImage))
        .replace('<!--app-og-type-->', escapeHtml(meta.ogType))
        .replace('<!--app-og-site-name-->', escapeHtml(meta.ogSiteName));
      res.status(200).set({ 'Content-Type': 'text/html' }).end(appHtml);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      console.error(e);
      res.status(500).end(e instanceof Error ? e.message : String(e));
    }
  });

  // Создаём HTTPS-сервер
  const httpsServer = https.createServer(
    {
      key: fs.readFileSync(process.env.SSL_KEY_PATH || '/run/secrets/ssl/private.key'),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH || '/run/secrets/ssl/certificate.crt'),
    },
    app,
  );

  httpsServer.listen(443, () => {
    console.log('HTTPS сервер запущен на порту 443');
  });
  //app.listen(3000, () => console.log('Server running on http://localhost:3000'));
}

createServer();

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
