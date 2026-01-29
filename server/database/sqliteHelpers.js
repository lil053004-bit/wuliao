import db from './sqlite.js';
import { randomUUID } from 'crypto';

export function getSessionSummary(daysBack = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);
  const cutoff = cutoffDate.toISOString();

  const totalSessions = db.prepare('SELECT COUNT(*) as count FROM user_sessions WHERE first_visit_at >= ?').get(cutoff).count;
  const convertedSessions = db.prepare('SELECT COUNT(*) as count FROM user_sessions WHERE first_visit_at >= ? AND converted = 1').get(cutoff).count;
  const totalEvents = db.prepare('SELECT COUNT(*) as count FROM user_events WHERE created_at >= ?').get(cutoff).count;
  const pageLoads = db.prepare('SELECT COUNT(*) as count FROM user_events WHERE created_at >= ? AND event_type = ?').get(cutoff, 'page_load').count;
  const diagnoses = db.prepare('SELECT COUNT(*) as count FROM user_events WHERE created_at >= ? AND event_type = ?').get(cutoff, 'diagnosis_click').count;
  const conversions = db.prepare('SELECT COUNT(*) as count FROM user_events WHERE created_at >= ? AND event_type = ?').get(cutoff, 'conversion').count;
  const reportDownloads = db.prepare('SELECT COUNT(*) as count FROM user_events WHERE created_at >= ? AND event_type = ?').get(cutoff, 'report_download').count;
  const conversionRate = totalSessions > 0 ? (convertedSessions / totalSessions) * 100 : 0;

  return {
    total_sessions: totalSessions,
    converted_sessions: convertedSessions,
    total_events: totalEvents,
    page_loads: pageLoads,
    diagnoses: diagnoses,
    conversions: conversions,
    report_downloads: reportDownloads,
    conversion_rate: parseFloat(conversionRate.toFixed(2))
  };
}

export function getPopularStocks(daysBack = 7, limit = 10) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);
  const cutoff = cutoffDate.toISOString();

  return db.prepare('SELECT stock_code, stock_name, COUNT(*) as view_count, SUM(CASE WHEN converted = 1 THEN 1 ELSE 0 END) as conversions FROM user_sessions WHERE first_visit_at >= ? AND stock_code IS NOT NULL GROUP BY stock_code, stock_name ORDER BY view_count DESC LIMIT ?').all(cutoff, limit);
}

export function createSession(sessionData) {
  const id = randomUUID();
  db.prepare('INSERT INTO user_sessions (id, session_id, stock_code, stock_name, url_params, user_agent, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, sessionData.session_id, sessionData.stock_code || null, sessionData.stock_name || null, JSON.stringify(sessionData.url_params || {}), sessionData.user_agent || null, sessionData.ip_address || null);
  return { id };
}

export function updateSession(sessionId, updates) {
  const sets = [];
  const values = [];
  if (updates.stock_code !== undefined) { sets.push('stock_code = ?'); values.push(updates.stock_code); }
  if (updates.stock_name !== undefined) { sets.push('stock_name = ?'); values.push(updates.stock_name); }
  if (updates.converted !== undefined) {
    sets.push('converted = ?');
    values.push(updates.converted ? 1 : 0);
    if (updates.converted) { sets.push('converted_at = ?'); values.push(new Date().toISOString()); }
  }
  sets.push('last_activity_at = ?');
  values.push(new Date().toISOString());
  values.push(sessionId);
  db.prepare('UPDATE user_sessions SET ' + sets.join(', ') + ' WHERE session_id = ?').run(...values);
}

export function createEvent(eventData) {
  const id = randomUUID();
  db.prepare('INSERT INTO user_events (id, session_id, event_type, event_data, stock_code, stock_name, duration_ms, gclid) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(id, eventData.session_id, eventData.event_type, JSON.stringify(eventData.event_data || {}), eventData.stock_code || null, eventData.stock_name || null, eventData.duration_ms || null, eventData.gclid || null);
  return { id };
}

export function getSessionById(sessionId) {
  const session = db.prepare('SELECT * FROM user_sessions WHERE session_id = ?').get(sessionId);
  if (!session) return null;
  if (session.url_params) session.url_params = JSON.parse(session.url_params);
  session.converted = Boolean(session.converted);
  return session;
}

export function getAllSessions(limit = 50, offset = 0, daysBack = 7, startDate = null, endDate = null) {
  let cutoff, endCutoff;

  if (startDate && endDate) {
    cutoff = new Date(startDate).toISOString();
    endCutoff = new Date(endDate);
    endCutoff.setHours(23, 59, 59, 999);
    endCutoff = endCutoff.toISOString();
  } else {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    cutoff = cutoffDate.toISOString();
    endCutoff = new Date().toISOString();
  }

  const sessions = db.prepare('SELECT * FROM user_sessions WHERE first_visit_at >= ? AND first_visit_at <= ? ORDER BY first_visit_at DESC LIMIT ? OFFSET ?').all(cutoff, endCutoff, limit, offset);
  const count = db.prepare('SELECT COUNT(*) as count FROM user_sessions WHERE first_visit_at >= ? AND first_visit_at <= ?').get(cutoff, endCutoff).count;
  return { sessions: sessions.map(s => ({ ...s, url_params: s.url_params ? JSON.parse(s.url_params) : {}, converted: Boolean(s.converted) })), count };
}

export function getEventsBySessionId(sessionId) {
  const events = db.prepare('SELECT * FROM user_events WHERE session_id = ? ORDER BY created_at ASC').all(sessionId);
  return events.map(e => ({ ...e, event_data: e.event_data ? JSON.parse(e.event_data) : {} }));
}

export function searchStocks(searchTerm) {
  const term = '%' + searchTerm + '%';
  return db.prepare('SELECT code, name, market, industry FROM stocks WHERE code LIKE ? OR name LIKE ? LIMIT 20').all(term, term);
}

export function getStockByCode(code) {
  return db.prepare('SELECT * FROM stocks WHERE code = ?').get(code);
}

export function createOrUpdateStock(stockData) {
  const existing = getStockByCode(stockData.code);
  if (existing) {
    db.prepare('UPDATE stocks SET name = ?, market = ?, industry = ?, updated_at = ? WHERE code = ?').run(stockData.name, stockData.market || '', stockData.industry || '', new Date().toISOString(), stockData.code);
    return existing;
  } else {
    const id = randomUUID();
    db.prepare('INSERT INTO stocks (id, code, name, market, industry) VALUES (?, ?, ?, ?, ?)').run(id, stockData.code, stockData.name, stockData.market || '', stockData.industry || '');
    return { id, ...stockData };
  }
}

export function getAllRedirectLinks() {
  return db.prepare('SELECT * FROM redirect_links ORDER BY is_active DESC, weight DESC, created_at DESC').all();
}

export function createRedirectLink(linkData) {
  const id = randomUUID();
  const isActive = linkData.is_active !== undefined ? (linkData.is_active ? 1 : 0) : 1;
  db.prepare('INSERT INTO redirect_links (id, redirect_url, label, url_type, weight, is_active) VALUES (?, ?, ?, ?, ?, ?)').run(id, linkData.redirect_url, linkData.label || '', linkData.url_type || 'general', linkData.weight || 1, isActive);
  return { id, ...linkData };
}

export function updateRedirectLink(id, linkData) {
  const updates = [];
  const values = [];
  if (linkData.redirect_url !== undefined) { updates.push('redirect_url = ?'); values.push(linkData.redirect_url); }
  if (linkData.label !== undefined) { updates.push('label = ?'); values.push(linkData.label); }
  if (linkData.url_type !== undefined) { updates.push('url_type = ?'); values.push(linkData.url_type); }
  if (linkData.weight !== undefined) { updates.push('weight = ?'); values.push(linkData.weight); }
  if (linkData.is_active !== undefined) { updates.push('is_active = ?'); values.push(linkData.is_active ? 1 : 0); }
  updates.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);
  db.prepare('UPDATE redirect_links SET ' + updates.join(', ') + ' WHERE id = ?').run(...values);
}

export function deleteRedirectLink(id) {
  db.prepare('DELETE FROM redirect_links WHERE id = ?').run(id);
}

export function incrementRedirectLinkHitCount(id) {
  db.prepare('UPDATE redirect_links SET hit_count = hit_count + 1 WHERE id = ?').run(id);
}

export function getGoogleTrackingConfig() {
  return db.prepare('SELECT * FROM google_tracking_config ORDER BY updated_at DESC LIMIT 1').get();
}

export function updateGoogleTrackingConfig(config) {
  const existing = getGoogleTrackingConfig();
  if (existing) {
    db.prepare('UPDATE google_tracking_config SET google_ads_conversion_id = ?, ga4_measurement_id = ?, conversion_action_id = ?, is_enabled = ?, updated_at = ? WHERE id = ?').run(config.google_ads_conversion_id || null, config.ga4_measurement_id || null, config.conversion_action_id || null, config.is_enabled ? 1 : 0, new Date().toISOString(), existing.id);
    return existing.id;
  } else {
    const id = randomUUID();
    db.prepare('INSERT INTO google_tracking_config (id, google_ads_conversion_id, ga4_measurement_id, conversion_action_id, is_enabled) VALUES (?, ?, ?, ?, ?)').run(id, config.google_ads_conversion_id || null, config.ga4_measurement_id || null, config.conversion_action_id || null, config.is_enabled ? 1 : 0);
    return id;
  }
}

export function getConvertedSessions() {
  const sessions = db.prepare(`
    SELECT
      us.session_id,
      us.stock_code,
      us.stock_name,
      us.url_params,
      us.first_visit_at,
      us.converted_at,
      ue.gclid,
      ue.created_at as conversion_time
    FROM user_sessions us
    LEFT JOIN user_events ue ON us.session_id = ue.session_id AND ue.event_type = 'conversion'
    WHERE us.converted = 1
    ORDER BY us.converted_at DESC
  `).all();

  return sessions.map(s => ({
    ...s,
    url_params: s.url_params ? JSON.parse(s.url_params) : {}
  }));
}

export function getSessionDateRange() {
  const result = db.prepare(`
    SELECT
      MIN(first_visit_at) as earliest_date,
      MAX(first_visit_at) as latest_date
    FROM user_sessions
  `).get();

  return result;
}

export function getCacheStats() {
  const totalCache = db.prepare('SELECT COUNT(*) as count FROM diagnosis_cache').get().count;
  const expiredCache = db.prepare('SELECT COUNT(*) as count FROM diagnosis_cache WHERE expires_at < ?').get(new Date().toISOString()).count;
  const activeCache = totalCache - expiredCache;

  const totalHits = db.prepare('SELECT SUM(hit_count) as total FROM diagnosis_cache').get().total || 0;

  const recentCache = db.prepare(`
    SELECT stock_code, model_used, created_at, hit_count, expires_at
    FROM diagnosis_cache
    ORDER BY created_at DESC
    LIMIT 20
  `).all();

  const topHitCache = db.prepare(`
    SELECT stock_code, model_used, hit_count, created_at
    FROM diagnosis_cache
    WHERE expires_at >= ?
    ORDER BY hit_count DESC
    LIMIT 10
  `).all(new Date().toISOString());

  return {
    total_cache: totalCache,
    active_cache: activeCache,
    expired_cache: expiredCache,
    total_hits: totalHits,
    recent_cache: recentCache,
    top_hit_cache: topHitCache
  };
}

export function deleteAllCache() {
  const result = db.prepare('DELETE FROM diagnosis_cache').run();
  return { deleted_count: result.changes };
}

export function deleteExpiredCache() {
  const result = db.prepare('DELETE FROM diagnosis_cache WHERE expires_at < ?').run(new Date().toISOString());
  return { deleted_count: result.changes };
}

export function deleteCacheByStockCode(stockCode) {
  const result = db.prepare('DELETE FROM diagnosis_cache WHERE stock_code = ?').run(stockCode);
  return { deleted_count: result.changes };
}

export function getCacheByStockCode(stockCode) {
  return db.prepare('SELECT * FROM diagnosis_cache WHERE stock_code = ? ORDER BY created_at DESC').all(stockCode);
}
