import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import app from './app.ts';
import fs from 'fs';
import path from 'path';

// SERVE STATIC CLIENT BUILD (SPA) FOR LOCAL / NODE HOSTING
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use('/*', serveStatic({ root: './dist' }));
  app.get('*', (c) => {
    const htmlPath = path.join(distPath, 'index.html');
    if (fs.existsSync(htmlPath)) {
      return c.html(fs.readFileSync(htmlPath, 'utf-8'));
    }
    return c.text('Not found', 404);
  });
}

// START HTTP SERVER
const port = Number(process.env.PORT) || 3001;
console.log(`🚀 Talma Server running on http://localhost:${port}`);
serve({
  fetch: app.fetch,
  port,
});

export default app;
