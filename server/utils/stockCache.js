import db from '../database/sqlite.js';
import { randomUUID } from 'crypto';

const MEMORY_CACHE_DURATION = 5 * 60 * 1000;
const SQLITE_CACHE_DURATION = 6 * 60 * 60 * 1000;

const memoryCache = new Map();

export function getFromMemoryCache(stockCode) {
  const cached = memoryCache.get(stockCode);

  if (cached && Date.now() - cached.timestamp < MEMORY_CACHE_DURATION) {
    console.log(`[MemoryCache] Hit for ${stockCode}`);
    return cached.data;
  }

  if (cached) {
    memoryCache.delete(stockCode);
  }

  return null;
}

export function saveToMemoryCache(stockCode, data) {
  memoryCache.set(stockCode, {
    data,
    timestamp: Date.now()
  });

  if (memoryCache.size > 100) {
    const firstKey = memoryCache.keys().next().value;
    memoryCache.delete(firstKey);
  }
}

export function getFromSQLiteCache(stockCode) {
  const now = new Date().toISOString();

  const cached = db.prepare(`
    SELECT * FROM stock_price_cache
    WHERE stock_code = ? AND expires_at > ?
    ORDER BY created_at DESC
    LIMIT 1
  `).get(stockCode, now);

  if (cached) {
    db.prepare(`
      UPDATE stock_price_cache
      SET hit_count = hit_count + 1, last_hit_at = ?
      WHERE id = ?
    `).run(now, cached.id);

    console.log(`[SQLiteCache] Hit for ${stockCode} (hits: ${cached.hit_count + 1})`);

    return {
      info: JSON.parse(cached.stock_info),
      prices: JSON.parse(cached.stock_prices)
    };
  }

  return null;
}

export function saveToSQLiteCache(stockCode, html, stockInfo, stockPrices) {
  const id = randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SQLITE_CACHE_DURATION);

  try {
    db.prepare(`
      INSERT INTO stock_price_cache (
        id, stock_code, html_content, stock_info, stock_prices, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      stockCode,
      html,
      JSON.stringify(stockInfo),
      JSON.stringify(stockPrices),
      expiresAt.toISOString()
    );

    console.log(`[SQLiteCache] Saved ${stockCode} (expires: ${expiresAt.toISOString()})`);
  } catch (error) {
    console.error('[SQLiteCache] Error saving cache:', error.message);
  }
}

export function cleanExpiredStockCache() {
  const now = new Date().toISOString();

  const result = db.prepare(`
    DELETE FROM stock_price_cache WHERE expires_at <= ?
  `).run(now);

  if (result.changes > 0) {
    console.log(`[SQLiteCache] Cleaned ${result.changes} expired stock cache entries`);
  }

  return result.changes;
}

export function getStockCacheStats() {
  const totalEntries = db.prepare(`
    SELECT COUNT(*) as count FROM stock_price_cache
  `).get().count;

  const expiredEntries = db.prepare(`
    SELECT COUNT(*) as count FROM stock_price_cache
    WHERE expires_at <= ?
  `).get(new Date().toISOString()).count;

  const totalHits = db.prepare(`
    SELECT SUM(hit_count) as total FROM stock_price_cache
  `).get().total || 0;

  const memoryCacheSize = memoryCache.size;

  return {
    memoryCache: {
      size: memoryCacheSize,
      maxSize: 100
    },
    sqliteCache: {
      totalEntries,
      expiredEntries,
      activeEntries: totalEntries - expiredEntries,
      totalHits
    }
  };
}

export function clearAllCaches() {
  memoryCache.clear();

  const result = db.prepare(`
    DELETE FROM stock_price_cache
  `).run();

  console.log(`[Cache] Cleared memory cache and ${result.changes} SQLite cache entries`);

  return {
    memoryCleared: true,
    sqliteEntriesCleared: result.changes
  };
}
