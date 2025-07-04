export default function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health check endpoint
  if (req.url === '/api/health' || req.url?.includes('/health')) {
    return res.status(200).json({ 
      status: 'active', 
      timestamp: new Date().toISOString(),
      service: 'WhisperSpace API'
    });
  }

  // Default response
  res.status(200).json({ 
    message: 'WhisperSpace API is running',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}
