import express from 'express';
import { getAllRedirectLinks, createRedirectLink, updateRedirectLink, deleteRedirectLink, incrementRedirectLinkHitCount } from '../database/sqliteHelpers.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

function isValidUrl(urlString) {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

router.get('/', authMiddleware, async (req, res) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  });

  try {
    const links = getAllRedirectLinks();
    res.json({ success: true, links: links || [] });
  } catch (error) {
    console.error('Error fetching redirect links:', error);
    res.status(500).json({ error: 'Failed to fetch redirect links' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { redirect_url, label, url_type, weight, is_active } = req.body;

    if (!redirect_url) {
      return res.status(400).json({ error: 'Redirect URL is required' });
    }

    if (!isValidUrl(redirect_url)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const link = createRedirectLink({
      redirect_url,
      label: label || '',
      url_type: url_type || 'general',
      weight: weight || 1,
      is_active: is_active !== false
    });

    res.json({ success: true, link });
  } catch (error) {
    console.error('Error creating redirect link:', error);
    res.status(500).json({ error: 'Failed to create redirect link' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { redirect_url, label, url_type, weight, is_active } = req.body;

    if (redirect_url && !isValidUrl(redirect_url)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    updateRedirectLink(id, {
      redirect_url,
      label,
      url_type,
      weight,
      is_active
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating redirect link:', error);
    res.status(500).json({ error: 'Failed to update redirect link' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    deleteRedirectLink(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting redirect link:', error);
    res.status(500).json({ error: 'Failed to delete redirect link' });
  }
});

// ===== 获取重定向链接接口 - Google Ads Compliant =====
// 使用固定的第一个激活链接，避免动态选择（Cloaking）
router.get('/select', async (req, res) => {
  try {
    // 获取所有激活的链接
    const links = getAllRedirectLinks();
    const activeLinks = links.filter(link => link.is_active === 1);

    if (activeLinks.length === 0) {
      return res.json({
        success: false,
        message: 'No active redirect links available'
      });
    }

    // Google Ads合规修改：使用固定的第一个链接
    // 不使用随机选择，确保所有用户看到相同的目标URL
    // 这符合Google Ads的透明性要求，避免Cloaking检测
    const selectedLink = activeLinks[0];

    // 记录点击次数
    incrementRedirectLinkHitCount(selectedLink.id);

    res.json({
      success: true,
      link: selectedLink
    });
  } catch (error) {
    console.error('Error selecting redirect link:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to select redirect link'
    });
  }
});
// ===== 接口结束 =====

router.post('/:id/hit', async (req, res) => {
  try {
    const { id } = req.params;
    incrementRedirectLinkHitCount(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error recording hit:', error);
    res.status(500).json({ error: 'Failed to record hit' });
  }
});

export default router;
