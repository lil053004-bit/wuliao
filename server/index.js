import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import stockRouter from './routes/stock.js';
import geminiRouter from './routes/gemini.js';
import adminRouter from './routes/admin.js';
import trackingRouter from './routes/tracking.js';
import lineRedirectRouter from './routes/lineRedirect.js';
import googleTrackingRouter from './routes/googleTracking.js';
import { cleanExpiredCache } from './utils/sqliteCache.js';
import { cleanExpiredStockCache } from './utils/stockCache.js';
import { cleanOldLogs } from './utils/scrapingLogger.js';
import './database/sqlite.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.API_PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN;
const TRUST_PROXY = process.env.TRUST_PROXY === 'true';

setInterval(async () => {
  console.log('[Scheduled] Running cache cleanup...');
  await cleanExpiredCache();
  cleanExpiredStockCache();
}, 60 * 60 * 1000);

setInterval(async () => {
  console.log('[Scheduled] Running log cleanup...');
  cleanOldLogs(30);
}, 24 * 60 * 60 * 1000);

function validateApiConfiguration() {
  const apiKey = process.env.SILICONFLOW_API_KEY || process.env.SILICONFLOW_API_KEYS;

  if (!apiKey) {
    console.warn('\u26a0\ufe0f  WARNING: SILICONFLOW_API_KEY is not configured!');
    console.warn('   AI diagnosis will use mock responses.');
    console.warn('   Please set SILICONFLOW_API_KEY in your .env file.');
    return false;
  }

  if (apiKey === 'your_siliconflow_api_key_here' || apiKey.includes('placeholder')) {
    console.warn('\u26a0\ufe0f  WARNING: SILICONFLOW_API_KEY appears to be a placeholder!');
    console.warn('   Current value:', apiKey.substring(0, 20) + '...');
    console.warn('   AI diagnosis will use mock responses.');
    console.warn('   Please replace with your actual SiliconFlow API key.');
    return false;
  }

  if (NODE_ENV === 'development') {
    console.log('\u2705 SiliconFlow API key configured successfully');
    console.log('   Key preview:', apiKey.substring(0, 10) + '...');
  }
  return true;
}

validateApiConfiguration();

const app = express();

if (TRUST_PROXY) {
  app.set('trust proxy', 1);
}

const corsOptions = {
  origin: CORS_ORIGIN ? CORS_ORIGIN.split(',').map(o => o.trim()) : (NODE_ENV === 'production' ? false : '*'),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};

function securityHeadersMiddleware(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  if (NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://googleads.g.doubleclick.net https://www.googleadservices.com https://pagead2.googlesyndication.com https://static.cloudflareinsights.com" + (NODE_ENV === 'development' ? " https://tagassistant.google.com" : ""),
    "script-src-elem 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://googleads.g.doubleclick.net https://www.googleadservices.com https://pagead2.googlesyndication.com https://static.cloudflareinsights.com" + (NODE_ENV === 'development' ? " https://tagassistant.google.com" : ""),
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com" + (NODE_ENV === 'development' ? " https://tagassistant.google.com" : ""),
    "img-src 'self' data: https: https://www.google.com https://www.google.co.jp https://www.google-analytics.com https://ssl.google-analytics.com https://googleads.g.doubleclick.net https://www.googleadservices.com https://pagead2.googlesyndication.com" + (NODE_ENV === 'development' ? " https://tagassistant.google.com" : ""),
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://www.google.com https://www.google.co.jp https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://region1.analytics.google.com https://stats.g.doubleclick.net https://googleads.g.doubleclick.net https://www.googleadservices.com https://googleadservices.com https://api.siliconflow.cn https://kabutan.jp https://static.cloudflareinsights.com https://cloudflareinsights.com" + (NODE_ENV === 'development' ? " https://tagassistant.google.com" : ""),
    "frame-src https://bid.g.doubleclick.net https://googleads.g.doubleclick.net https://www.googleadservices.com" + (NODE_ENV === 'development' ? " https://tagassistant.google.com" : ""),
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');

  res.setHeader('Content-Security-Policy', cspDirectives);

  next();
}

app.use(securityHeadersMiddleware);
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

app.use('/api/stock', stockRouter);
app.use('/api/gemini', geminiRouter);
app.use('/api/admin', adminRouter);
app.use('/api/tracking', trackingRouter);
app.use('/api/line-redirects', lineRedirectRouter);
app.use('/api/google-tracking', googleTrackingRouter);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

if (NODE_ENV === 'production') {
  const distPath = join(__dirname, '..', 'dist');

  app.use(express.static(distPath));

  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });

  console.log(`📦 Serving static files from: ${distPath}`);
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Stock API: http://localhost:${PORT}/api/stock`);
  console.log(`🤖 SiliconFlow API: http://localhost:${PORT}/api/gemini`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔍 Stock scraper: axios + cheerio (lightweight)`);

  if (NODE_ENV === 'production') {
    console.log(`✨ Frontend available at: http://localhost:${PORT}`);
  }
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
