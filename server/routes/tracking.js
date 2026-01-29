import express from 'express';
import { getSessionById, createSession, updateSession, createEvent } from '../database/sqliteHelpers.js';

const router = express.Router();

router.post('/session', async (req, res) => {
  try {
    const { sessionId, stockCode, stockName, urlParams, userAgent } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const existing = getSessionById(sessionId);

    if (existing) {
      updateSession(sessionId, {
        stock_code: stockCode,
        stock_name: stockName
      });
    } else {
      createSession({
        session_id: sessionId,
        stock_code: stockCode,
        stock_name: stockName,
        url_params: urlParams || {},
        user_agent: userAgent
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking session:', error);
    res.status(500).json({ error: 'Failed to track session' });
  }
});

router.post('/event', async (req, res) => {
  try {
    const { sessionId, eventType, eventData, stockCode, stockName, durationMs, gclid } = req.body;

    if (!sessionId || !eventType) {
      return res.status(400).json({ error: 'Session ID and event type are required' });
    }

    if (eventType === 'conversion') {
      updateSession(sessionId, { converted: true });
    }

    createEvent({
      session_id: sessionId,
      event_type: eventType,
      event_data: eventData || {},
      stock_code: stockCode,
      stock_name: stockName,
      duration_ms: durationMs,
      gclid: gclid
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

export default router;
