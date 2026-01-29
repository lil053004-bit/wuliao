import express from 'express';
import { getGoogleTrackingConfig, updateGoogleTrackingConfig } from '../database/sqliteHelpers.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  });

  try {
    const config = getGoogleTrackingConfig();

    if (!config) {
      return res.json({
        success: true,
        config: {
          google_ads_conversion_id: '',
          ga4_measurement_id: '',
          conversion_action_id: '',
          is_enabled: false
        }
      });
    }

    res.json({
      success: true,
      config: {
        ...config,
        is_enabled: Boolean(config.is_enabled)
      }
    });
  } catch (error) {
    console.error('Error fetching Google tracking config:', error);
    res.status(500).json({ error: 'Failed to fetch Google tracking configuration' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { google_ads_conversion_id, ga4_measurement_id, conversion_action_id, is_enabled } = req.body;

    updateGoogleTrackingConfig({
      google_ads_conversion_id,
      ga4_measurement_id,
      conversion_action_id,
      is_enabled
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating Google tracking config:', error);
    res.status(500).json({ error: 'Failed to update Google tracking configuration' });
  }
});

export default router;
