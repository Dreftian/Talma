import { getRequestListener } from '@hono/node-server';
import app from '../server/app.ts';

const nodeListener = getRequestListener(app.fetch);

export default async function handler(req: any, res: any) {
  // If invoked with Web Standard Request (Edge or modern Serverless)
  if (req && typeof req.headers?.get === 'function' && !res) {
    return app.fetch(req);
  }
  // If invoked with Node.js IncomingMessage and ServerResponse
  return nodeListener(req, res);
}
