/**
 * RideFlow Production Full-Stack Server
 * Serves compiled Vite assets and privileged server-side operations
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Server health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'RideFlow',
    timestamp: new Date().toISOString(),
  });
});

// Serve static frontend assets
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for client-side React Router
app.get('*', (req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`RideFlow server running on http://0.0.0.0:${PORT}`);
});
