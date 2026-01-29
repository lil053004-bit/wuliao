import express from 'express';
import { searchStocks, createOrUpdateStock } from '../database/sqliteHelpers.js';
import requestQueue from '../utils/requestQueue.js';
import {
  getFromMemoryCache,
  saveToMemoryCache,
  getFromSQLiteCache,
  saveToSQLiteCache,
  getStockCacheStats,
  clearAllCaches
} from '../utils/stockCache.js';
import { logScrapingAttempt } from '../utils/scrapingLogger.js';
import { scrapeStockData } from '../utils/stockScraper.js';
import { adaptScrapedDataToOldFormat, prepareDataForCache } from '../utils/dataAdapter.js';

const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({ results: [] });
    }

    const query = q.trim();
    const results = searchStocks(query);

    res.json({ results });
  } catch (error) {
    console.error('[Search] Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

router.get('/data', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Stock code is required' });
    }

    const memoryData = getFromMemoryCache(code);
    if (memoryData) {
      logScrapingAttempt(code, `https://s.kabutan.jp/stocks/${code}/historical_prices/daily/`, 'cache', {
        method: 'memory-cache'
      });
      return res.json(memoryData);
    }

    const sqliteData = getFromSQLiteCache(code);
    if (sqliteData) {
      saveToMemoryCache(code, sqliteData);
      logScrapingAttempt(code, `https://s.kabutan.jp/stocks/${code}/historical_prices/daily/`, 'cache', {
        method: 'sqlite-cache'
      });
      return res.json(sqliteData);
    }

    const result = await requestQueue.enqueue(async () => {
      const scrapedData = await scrapeStockData(code);

      const { htmlContent, stockInfo, stockPrices } = prepareDataForCache(scrapedData);

      if (stockInfo.name) {
        createOrUpdateStock({
          code: stockInfo.code,
          name: stockInfo.name,
          market: stockInfo.market || '',
          industry: stockInfo.industry || ''
        });
      }

      logScrapingAttempt(code, `https://s.kabutan.jp/stocks/${code}/historical_prices/daily/`, 'success', {
        httpStatus: 200,
        responseTime: scrapedData.responseTime,
        retryCount: 0,
        method: scrapedData.method
      });

      const data = {
        info: stockInfo,
        prices: stockPrices,
      };

      saveToSQLiteCache(code, htmlContent, stockInfo, stockPrices);
      saveToMemoryCache(code, data);

      return data;
    }, 1);

    res.json(result);
  } catch (error) {
    console.error('[Data] Error:', error);

    logScrapingAttempt(code, `https://s.kabutan.jp/stocks/${code}/historical_prices/daily/`, 'error', {
      errorMessage: error.message,
      method: 'axios-cheerio'
    });

    res.status(500).json({
      error: 'Failed to fetch stock data',
      details: error.message
    });
  }
});

router.post('/clear-cache', (req, res) => {
  try {
    const result = clearAllCaches();

    console.log('[Cache] Cache cleared successfully');

    res.json({
      success: true,
      message: 'All caches cleared successfully',
      ...result
    });
  } catch (error) {
    console.error('[Cache] Error clearing cache:', error);
    res.status(500).json({
      error: 'Failed to clear cache',
      details: error.message
    });
  }
});

router.get('/cache-stats', (req, res) => {
  try {
    const stats = getStockCacheStats();
    res.json(stats);
  } catch (error) {
    console.error('[CacheStats] Error:', error);
    res.status(500).json({
      error: 'Failed to get cache stats',
      details: error.message
    });
  }
});

router.get('/queue-stats', (req, res) => {
  try {
    const queueStats = requestQueue.getStats();

    res.json({
      queue: queueStats,
      scraper: {
        method: 'axios-cheerio',
        status: 'active'
      }
    });
  } catch (error) {
    console.error('[QueueStats] Error:', error);
    res.status(500).json({
      error: 'Failed to get queue stats',
      details: error.message
    });
  }
});

export default router;
