import db from '../database/sqlite.js';
import { randomUUID } from 'crypto';

export function logScrapingAttempt(stockCode, url, status, options = {}) {
  const id = randomUUID();

  try {
    db.prepare(`
      INSERT INTO scraping_logs (
        id, stock_code, url, status, http_status,
        response_time_ms, retry_count, error_message, method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      stockCode,
      url,
      status,
      options.httpStatus || null,
      options.responseTime || null,
      options.retryCount || 0,
      options.errorMessage || null,
      options.method || 'fetch'
    );
  } catch (error) {
    console.error('[ScrapingLogger] Error logging scraping attempt:', error.message);
  }

  updateScrapingMetrics(status, options);
}

function updateScrapingMetrics(status, options) {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const hour = now.getHours();

  try {
    const existing = db.prepare(`
      SELECT * FROM scraping_metrics
      WHERE date = ? AND hour = ?
    `).get(date, hour);

    if (existing) {
      const totalRequests = existing.total_requests + 1;
      const successfulRequests = existing.successful_requests + (status === 'success' ? 1 : 0);
      const failedRequests = existing.failed_requests + (status === 'error' ? 1 : 0);
      const cacheHits = existing.cache_hits + (status === 'cache' ? 1 : 0);

      const avgResponseTime = options.responseTime
        ? Math.round((existing.avg_response_time_ms * existing.total_requests + options.responseTime) / totalRequests)
        : existing.avg_response_time_ms;

      const puppeteerRequests = existing.puppeteer_requests + (options.method === 'puppeteer' ? 1 : 0);
      const fetchRequests = existing.fetch_requests + (options.method === 'fetch' ? 1 : 0);

      db.prepare(`
        UPDATE scraping_metrics
        SET total_requests = ?,
            successful_requests = ?,
            failed_requests = ?,
            avg_response_time_ms = ?,
            cache_hits = ?,
            puppeteer_requests = ?,
            fetch_requests = ?,
            updated_at = datetime('now')
        WHERE date = ? AND hour = ?
      `).run(
        totalRequests,
        successfulRequests,
        failedRequests,
        avgResponseTime,
        cacheHits,
        puppeteerRequests,
        fetchRequests,
        date,
        hour
      );
    } else {
      db.prepare(`
        INSERT INTO scraping_metrics (
          id, date, hour, total_requests, successful_requests,
          failed_requests, avg_response_time_ms, cache_hits,
          puppeteer_requests, fetch_requests
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        randomUUID(),
        date,
        hour,
        1,
        status === 'success' ? 1 : 0,
        status === 'error' ? 1 : 0,
        options.responseTime || 0,
        status === 'cache' ? 1 : 0,
        options.method === 'puppeteer' ? 1 : 0,
        options.method === 'fetch' ? 1 : 0
      );
    }
  } catch (error) {
    console.error('[ScrapingLogger] Error updating metrics:', error.message);
  }
}

export function getScrapingLogs(options = {}) {
  const limit = options.limit || 100;
  const offset = options.offset || 0;
  const stockCode = options.stockCode;

  let query = `
    SELECT * FROM scraping_logs
  `;

  const params = [];

  if (stockCode) {
    query += ` WHERE stock_code = ?`;
    params.push(stockCode);
  }

  query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  return db.prepare(query).all(...params);
}

export function getScrapingMetrics(options = {}) {
  const days = options.days || 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const metrics = db.prepare(`
    SELECT * FROM scraping_metrics
    WHERE date >= ?
    ORDER BY date DESC, hour DESC
  `).all(startDate.toISOString().split('T')[0]);

  const summary = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    cacheHits: 0,
    puppeteerRequests: 0,
    fetchRequests: 0,
    avgResponseTime: 0,
    successRate: 0
  };

  if (metrics.length > 0) {
    metrics.forEach(m => {
      summary.totalRequests += m.total_requests;
      summary.successfulRequests += m.successful_requests;
      summary.failedRequests += m.failed_requests;
      summary.cacheHits += m.cache_hits;
      summary.puppeteerRequests += m.puppeteer_requests;
      summary.fetchRequests += m.fetch_requests;
    });

    const totalResponseTime = metrics.reduce((sum, m) => {
      return sum + (m.avg_response_time_ms * m.total_requests);
    }, 0);

    summary.avgResponseTime = Math.round(totalResponseTime / summary.totalRequests);
    summary.successRate = summary.totalRequests > 0
      ? (summary.successfulRequests / summary.totalRequests)
      : 0;
  }

  return {
    summary,
    hourlyMetrics: metrics
  };
}

export function cleanOldLogs(daysToKeep = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  const cutoffDateStr = cutoffDate.toISOString();

  const logsDeleted = db.prepare(`
    DELETE FROM scraping_logs WHERE created_at < ?
  `).run(cutoffDateStr);

  const metricsDeleted = db.prepare(`
    DELETE FROM scraping_metrics WHERE date < ?
  `).run(cutoffDate.toISOString().split('T')[0]);

  console.log(`[ScrapingLogger] Cleaned ${logsDeleted.changes} old logs and ${metricsDeleted.changes} old metrics`);

  return {
    logsDeleted: logsDeleted.changes,
    metricsDeleted: metricsDeleted.changes
  };
}
