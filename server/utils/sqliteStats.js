import db from '../database/sqlite.js';
import { randomUUID } from 'crypto';

export async function recordUsageStats(stats) {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const hour = now.getHours();

  const existing = db.prepare(`
    SELECT * FROM api_usage_stats
    WHERE date = ? AND hour = ?
  `).get(date, hour);

  if (existing) {
    const updates = [];
    const values = [];

    if (stats.requests_total !== undefined) {
      updates.push('requests_total = requests_total + ?');
      values.push(stats.requests_total);
    }
    if (stats.cache_hits !== undefined) {
      updates.push('cache_hits = cache_hits + ?');
      values.push(stats.cache_hits);
    }
    if (stats.api_calls !== undefined) {
      updates.push('api_calls = api_calls + ?');
      values.push(stats.api_calls);
    }
    if (stats.errors_count !== undefined) {
      updates.push('errors_count = errors_count + ?');
      values.push(stats.errors_count);
    }
    if (stats.queue_length_avg !== undefined) {
      updates.push('queue_length_avg = ?');
      values.push(stats.queue_length_avg);
    }
    if (stats.response_time_avg !== undefined) {
      updates.push('response_time_avg = ?');
      values.push(stats.response_time_avg);
    }

    updates.push('updated_at = ?');
    values.push(now.toISOString());

    values.push(date, hour);

    db.prepare(`
      UPDATE api_usage_stats
      SET ${updates.join(', ')}
      WHERE date = ? AND hour = ?
    `).run(...values);
  } else {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO api_usage_stats (
        id, date, hour, requests_total, cache_hits, api_calls,
        queue_length_avg, response_time_avg, errors_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      date,
      hour,
      stats.requests_total || 0,
      stats.cache_hits || 0,
      stats.api_calls || 0,
      stats.queue_length_avg || 0,
      stats.response_time_avg || 0,
      stats.errors_count || 0
    );
  }
}

export async function getUsageStats(daysBack = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);
  const cutoff = cutoffDate.toISOString().split('T')[0];

  return db.prepare(`
    SELECT * FROM api_usage_stats
    WHERE date >= ?
    ORDER BY date DESC, hour DESC
  `).all(cutoff);
}

export async function getTodayStats() {
  const today = new Date().toISOString().split('T')[0];

  const stats = db.prepare(`
    SELECT
      SUM(requests_total) as requests_total,
      SUM(cache_hits) as cache_hits,
      SUM(api_calls) as api_calls,
      SUM(errors_count) as errors_count
    FROM api_usage_stats
    WHERE date = ?
  `).get(today);

  return {
    requests_total: stats?.requests_total || 0,
    cache_hits: stats?.cache_hits || 0,
    api_calls: stats?.api_calls || 0,
    errors_count: stats?.errors_count || 0,
  };
}
