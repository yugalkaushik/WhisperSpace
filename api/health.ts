import { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  if (req.method === 'GET') {
    res.status(200).json({ 
      status: 'active', 
      timestamp: new Date().toISOString(),
      service: 'WhisperSpace API'
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
