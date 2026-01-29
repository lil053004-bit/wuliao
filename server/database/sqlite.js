import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbDir = join(__dirname, '..', 'data');
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

const dbPath = join(dbDir, 'database.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    last_login_at TEXT
  );

  CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    stock_code TEXT,
    stock_name TEXT,
    url_params TEXT DEFAULT '{}',
    first_visit_at TEXT DEFAULT (datetime('now')),
    last_activity_at TEXT DEFAULT (datetime('now')),
    user_agent TEXT,
    ip_address TEXT,
    converted INTEGER DEFAULT 0,
    converted_at TEXT
  );

  CREATE TABLE IF NOT EXISTS user_events (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_data TEXT DEFAULT '{}',
    stock_code TEXT,
    stock_name TEXT,
    duration_ms INTEGER,
    gclid TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS redirect_links (
    id TEXT PRIMARY KEY,
    redirect_url TEXT NOT NULL,
    label TEXT DEFAULT '',
    url_type TEXT DEFAULT 'general',
    weight INTEGER DEFAULT 1,
    is_active INTEGER DEFAULT 1,
    hit_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS google_tracking_config (
    id TEXT PRIMARY KEY,
    google_ads_conversion_id TEXT,
    ga4_measurement_id TEXT,
    conversion_action_id TEXT,
    is_enabled INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS stocks (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    market TEXT DEFAULT '',
    industry TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS diagnosis_sessions (
    id TEXT PRIMARY KEY,
    stock_code TEXT NOT NULL,
    src TEXT DEFAULT '',
    rac_text TEXT DEFAULT '',
    completed INTEGER DEFAULT 0,
    converted INTEGER DEFAULT 0,
    analysis_result TEXT,
    error_message TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT,
    converted_at TEXT
  );

  CREATE TABLE IF NOT EXISTS diagnosis_cache (
    id TEXT PRIMARY KEY,
    stock_code TEXT NOT NULL,
    stock_data TEXT NOT NULL,
    diagnosis_result TEXT NOT NULL,
    model_used TEXT DEFAULT 'qwen2.5-7b-instruct',
    created_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    hit_count INTEGER DEFAULT 0,
    last_hit_at TEXT
  );

  CREATE TABLE IF NOT EXISTS diagnosis_queue (
    id TEXT PRIMARY KEY,
    stock_code TEXT NOT NULL,
    stock_data TEXT NOT NULL,
    user_id TEXT,
    priority INTEGER DEFAULT 5,
    status TEXT DEFAULT 'pending',
    result TEXT,
    error_message TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    processed_at TEXT,
    attempts INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS api_usage_stats (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    hour INTEGER NOT NULL,
    requests_total INTEGER DEFAULT 0,
    cache_hits INTEGER DEFAULT 0,
    api_calls INTEGER DEFAULT 0,
    queue_length_avg INTEGER DEFAULT 0,
    response_time_avg INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
  CREATE INDEX IF NOT EXISTS idx_user_sessions_first_visit ON user_sessions(first_visit_at);
  CREATE INDEX IF NOT EXISTS idx_user_events_session_id ON user_events(session_id);
  CREATE INDEX IF NOT EXISTS idx_user_events_created_at ON user_events(created_at);
  CREATE INDEX IF NOT EXISTS idx_stocks_code ON stocks(code);
  CREATE TABLE IF NOT EXISTS stock_price_cache (
    id TEXT PRIMARY KEY,
    stock_code TEXT NOT NULL,
    html_content TEXT NOT NULL,
    stock_info TEXT NOT NULL,
    stock_prices TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    hit_count INTEGER DEFAULT 0,
    last_hit_at TEXT
  );

  CREATE TABLE IF NOT EXISTS scraping_logs (
    id TEXT PRIMARY KEY,
    stock_code TEXT NOT NULL,
    url TEXT NOT NULL,
    status TEXT NOT NULL,
    http_status INTEGER,
    response_time_ms INTEGER,
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    method TEXT DEFAULT 'fetch',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS scraping_metrics (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    hour INTEGER NOT NULL,
    total_requests INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    avg_response_time_ms INTEGER DEFAULT 0,
    cache_hits INTEGER DEFAULT 0,
    puppeteer_requests INTEGER DEFAULT 0,
    fetch_requests INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_diagnosis_cache_stock_code ON diagnosis_cache(stock_code);
  CREATE INDEX IF NOT EXISTS idx_diagnosis_cache_expires_at ON diagnosis_cache(expires_at);
  CREATE INDEX IF NOT EXISTS idx_diagnosis_queue_status ON diagnosis_queue(status);
  CREATE INDEX IF NOT EXISTS idx_api_usage_stats_date_hour ON api_usage_stats(date, hour);
  CREATE INDEX IF NOT EXISTS idx_stock_price_cache_stock_code ON stock_price_cache(stock_code);
  CREATE INDEX IF NOT EXISTS idx_stock_price_cache_expires_at ON stock_price_cache(expires_at);
  CREATE INDEX IF NOT EXISTS idx_scraping_logs_stock_code ON scraping_logs(stock_code);
  CREATE INDEX IF NOT EXISTS idx_scraping_logs_created_at ON scraping_logs(created_at);
  CREATE INDEX IF NOT EXISTS idx_scraping_metrics_date_hour ON scraping_metrics(date, hour);
`);

console.log('✅ SQLite database initialized:', dbPath);

export default db;
