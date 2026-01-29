import db from '../database/sqlite.js';
import { randomUUID } from 'crypto';

export async function getCachedDiagnosis(stockCode) {
  const now = new Date().toISOString();

  const cached = db.prepare(`
    SELECT * FROM diagnosis_cache
    WHERE stock_code = ? AND expires_at > ?
    ORDER BY created_at DESC
    LIMIT 1
  `).get(stockCode, now);

  if (cached) {
    db.prepare(`
      UPDATE diagnosis_cache
      SET hit_count = hit_count + 1, last_hit_at = ?
      WHERE id = ?
    `).run(now, cached.id);

    return {
      stock_data: JSON.parse(cached.stock_data),
      diagnosis_result: JSON.parse(cached.diagnosis_result),
      model_used: cached.model_used,
      cached: true
    };
  }

  return null;
}

export async function saveDiagnosisToCache(stockCode, stockData, diagnosisResult, modelUsed = 'qwen2.5-7b-instruct') {
  const id = randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  db.prepare(`
    INSERT INTO diagnosis_cache (
      id, stock_code, stock_data, diagnosis_result,
      model_used, expires_at
    ) VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    id,
    stockCode,
    JSON.stringify(stockData),
    JSON.stringify(diagnosisResult),
    modelUsed,
    expiresAt.toISOString()
  );

  return { id };
}

export async function cleanExpiredCache() {
  const now = new Date().toISOString();

  const result = db.prepare(`
    DELETE FROM diagnosis_cache WHERE expires_at <= ?
  `).run(now);

  console.log(`🗑️  Cleaned ${result.changes} expired cache entries`);
  return result.changes;
}

export async function getCacheStats() {
  const totalEntries = db.prepare(`
    SELECT COUNT(*) as count FROM diagnosis_cache
  `).get().count;

  const expiredEntries = db.prepare(`
    SELECT COUNT(*) as count FROM diagnosis_cache
    WHERE expires_at <= ?
  `).get(new Date().toISOString()).count;

  const totalHits = db.prepare(`
    SELECT SUM(hit_count) as total FROM diagnosis_cache
  `).get().total || 0;

  return {
    totalEntries,
    expiredEntries,
    activeEntries: totalEntries - expiredEntries,
    totalHits
  };
}
