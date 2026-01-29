import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../database/sqlite.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';
import { getSessionSummary, getPopularStocks, getAllSessions, getEventsBySessionId, getConvertedSessions, getSessionDateRange, getCacheStats, deleteAllCache, deleteExpiredCache, deleteCacheByStockCode, getCacheByStockCode } from '../database/sqliteHelpers.js';
import { getScrapingLogs, getScrapingMetrics, cleanOldLogs } from '../utils/scrapingLogger.js';
import { getStockCacheStats, clearAllCaches, cleanExpiredStockCache } from '../utils/stockCache.js';
import requestQueue from '../utils/requestQueue.js';
import { puppeteerCircuit, fetchCircuit } from '../utils/circuitBreaker.js';
import browserPool from '../utils/browserPool.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = db.prepare(`
      SELECT * FROM admin_users WHERE username = ?
    `).get(username);

    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    db.prepare(`
      UPDATE admin_users
      SET last_login_at = ?
      WHERE id = ?
    `).run(new Date().toISOString(), user.id);

    const token = generateToken(user.id, user.username);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '登录失败,请重试' });
  }
});

router.post('/logout', authMiddleware, (req, res) => {
  res.json({ success: true });
});

router.get('/verify', authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

router.get('/sessions', authMiddleware, async (req, res) => {
  try {
    const { days = 7, limit = 50, offset = 0, startDate, endDate } = req.query;
    const daysBack = parseInt(days);
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);

    const { sessions, count } = getAllSessions(limitNum, offsetNum, daysBack, startDate, endDate);

    const sessionsWithEvents = sessions.map(session => ({
      ...session,
      events: getEventsBySessionId(session.session_id)
    }));

    res.json({
      sessions: sessionsWithEvents,
      total: count,
      limit: limitNum,
      offset: offsetNum
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

router.get('/sessions/date-range', authMiddleware, async (req, res) => {
  try {
    const dateRange = getSessionDateRange();
    res.json({
      success: true,
      dateRange
    });
  } catch (error) {
    console.error('Error fetching date range:', error);
    res.status(500).json({ error: 'Failed to fetch date range' });
  }
});

router.get('/conversions/export', authMiddleware, async (req, res) => {
  try {
    const convertedSessions = getConvertedSessions();

    const csvRows = [
      ['gclid', 'conversion_name', 'conversion_time', 'conversion_value', 'conversion_currency', 'stock_code', 'stock_name', 'first_visit_at'].join(',')
    ];

    convertedSessions.forEach(session => {
      const gclid = session.gclid || session.url_params?.gclid || '';
      const conversionTime = session.conversion_time || session.converted_at || '';
      const stockCode = session.stock_code || '';
      const stockName = session.stock_name || '';
      const firstVisitAt = session.first_visit_at || '';

      if (gclid) {
        const row = [
          gclid,
          'LINE_Friend_Add',
          conversionTime,
          '1',
          'JPY',
          stockCode,
          stockName,
          firstVisitAt
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');

        csvRows.push(row);
      }
    });

    const csvContent = csvRows.join('\n');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `google_offline_conversions_${timestamp}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csvContent);
  } catch (error) {
    console.error('Error exporting conversions:', error);
    res.status(500).json({ error: 'Failed to export conversions' });
  }
});

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysBack = parseInt(days);

    const summary = getSessionSummary(daysBack);
    const popularStocks = getPopularStocks(daysBack, 10);

    res.json({
      summary,
      popularStocks
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

router.get('/cache/stats', authMiddleware, async (req, res) => {
  try {
    const stats = getCacheStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    res.status(500).json({ error: 'Failed to fetch cache statistics' });
  }
});

router.get('/cache/stock/:stockCode', authMiddleware, async (req, res) => {
  try {
    const { stockCode } = req.params;
    const cacheEntries = getCacheByStockCode(stockCode);
    res.json({
      success: true,
      cache: cacheEntries
    });
  } catch (error) {
    console.error('Error fetching cache by stock code:', error);
    res.status(500).json({ error: 'Failed to fetch cache entries' });
  }
});

router.delete('/cache/all', authMiddleware, async (req, res) => {
  try {
    const result = deleteAllCache();
    res.json({
      success: true,
      message: `成功删除 ${result.deleted_count} 个缓存条目`,
      deleted_count: result.deleted_count
    });
  } catch (error) {
    console.error('Error deleting all cache:', error);
    res.status(500).json({ error: 'Failed to delete cache' });
  }
});

router.delete('/cache/expired', authMiddleware, async (req, res) => {
  try {
    const result = deleteExpiredCache();
    res.json({
      success: true,
      message: `成功删除 ${result.deleted_count} 个过期缓存条目`,
      deleted_count: result.deleted_count
    });
  } catch (error) {
    console.error('Error deleting expired cache:', error);
    res.status(500).json({ error: 'Failed to delete expired cache' });
  }
});

router.delete('/cache/stock/:stockCode', authMiddleware, async (req, res) => {
  try {
    const { stockCode } = req.params;
    const result = deleteCacheByStockCode(stockCode);
    res.json({
      success: true,
      message: `成功删除股票 ${stockCode} 的 ${result.deleted_count} 个缓存条目`,
      deleted_count: result.deleted_count
    });
  } catch (error) {
    console.error('Error deleting cache by stock code:', error);
    res.status(500).json({ error: 'Failed to delete cache for stock' });
  }
});

router.get('/scraping/logs', authMiddleware, async (req, res) => {
  try {
    const { limit = 100, offset = 0, stockCode } = req.query;
    const logs = getScrapingLogs({
      limit: parseInt(limit),
      offset: parseInt(offset),
      stockCode
    });

    res.json({
      success: true,
      logs,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching scraping logs:', error);
    res.status(500).json({ error: 'Failed to fetch scraping logs' });
  }
});

router.get('/scraping/metrics', authMiddleware, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const metrics = getScrapingMetrics({ days: parseInt(days) });

    res.json({
      success: true,
      ...metrics
    });
  } catch (error) {
    console.error('Error fetching scraping metrics:', error);
    res.status(500).json({ error: 'Failed to fetch scraping metrics' });
  }
});

router.get('/scraping/status', authMiddleware, async (req, res) => {
  try {
    const queueStats = requestQueue.getStats();
    const puppeteerState = puppeteerCircuit.getState();
    const fetchState = fetchCircuit.getState();
    const browserStats = browserPool.getStats();
    const cacheStats = getStockCacheStats();

    res.json({
      success: true,
      queue: queueStats,
      circuitBreakers: {
        puppeteer: puppeteerState,
        fetch: fetchState
      },
      browserPool: browserStats,
      cache: cacheStats
    });
  } catch (error) {
    console.error('Error fetching scraping status:', error);
    res.status(500).json({ error: 'Failed to fetch scraping status' });
  }
});

router.post('/scraping/clean-logs', authMiddleware, async (req, res) => {
  try {
    const { daysToKeep = 30 } = req.body;
    const result = cleanOldLogs(parseInt(daysToKeep));

    res.json({
      success: true,
      message: `Cleaned ${result.logsDeleted} old logs and ${result.metricsDeleted} old metrics`,
      ...result
    });
  } catch (error) {
    console.error('Error cleaning logs:', error);
    res.status(500).json({ error: 'Failed to clean logs' });
  }
});

router.post('/scraping/clean-expired-cache', authMiddleware, async (req, res) => {
  try {
    const result = cleanExpiredStockCache();

    res.json({
      success: true,
      message: `Cleaned ${result} expired cache entries`,
      deletedCount: result
    });
  } catch (error) {
    console.error('Error cleaning expired cache:', error);
    res.status(500).json({ error: 'Failed to clean expired cache' });
  }
});

router.post('/scraping/clear-all-cache', authMiddleware, async (req, res) => {
  try {
    const result = clearAllCaches();

    res.json({
      success: true,
      message: 'All caches cleared successfully',
      ...result
    });
  } catch (error) {
    console.error('Error clearing all cache:', error);
    res.status(500).json({ error: 'Failed to clear all cache' });
  }
});

router.post('/scraping/reset-circuit-breakers', authMiddleware, async (req, res) => {
  try {
    puppeteerCircuit.reset();
    fetchCircuit.reset();

    res.json({
      success: true,
      message: 'Circuit breakers reset successfully'
    });
  } catch (error) {
    console.error('Error resetting circuit breakers:', error);
    res.status(500).json({ error: 'Failed to reset circuit breakers' });
  }
});

export default router;
