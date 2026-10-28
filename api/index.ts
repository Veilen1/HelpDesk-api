import type { Request, Response } from 'express';
import { createNestServer } from '../src/server.js';

export default async function handler(req: Request, res: Response) {
  const server = await createNestServer();
  return server(req, res);
}

