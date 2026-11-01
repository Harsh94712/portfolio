import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import contact from './routes/contact.js';
import chat from './routes/chat.js';
import { profile } from './profile.js';
import { mailEnabled } from './mailer.js';

const app = express();
const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(here, '..', 'client', 'dist');

app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      objectSrc: ["'self'"],
      frameSrc: ["'self'"],
    },
  },
}));
const origins = (process.env.CLIENT_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({ origin: origins.length ? origins : false }));
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, ai: Boolean(process.env.GEMINI_API_KEY), mail: mailEnabled }));
app.get('/api/profile', (_req, res) => res.json(profile));
app.use('/api/contact', rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, skipFailedRequests: true, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many messages. Try again in an hour.' } }));
app.use('/api/chat', rateLimit({ windowMs: 10 * 60 * 1000, limit: 30, skipFailedRequests: true, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many questions. Try again in a few minutes.' } }));
app.use('/api', contact);
app.use('/api', chat);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

// On Vercel the app is run as a serverless function (see api/index.js), so only listen locally.
if (!process.env.VERCEL) {
  const port = Number(process.env.PORT) || 5000;
  app.listen(port, () => {
    console.log(`API on http://localhost:${port}  |  AI: ${process.env.GEMINI_API_KEY ? 'Gemini' : 'local answers'}  |  Email: ${mailEnabled ? 'on' : 'off'}`);
  });
}

export default app;
