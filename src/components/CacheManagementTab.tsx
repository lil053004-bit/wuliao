import { useState, useEffect } from 'react';
import {
  Database,
  Trash2,
  RefreshCw,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Search
} from 'lucide-react';
import { apiClient } from '../lib/apiClient';

interface CacheStats {
  total_cache: number;
  active_cache: number;
  expired_cache: number;
  total_hits: number;
  recent_cache: CacheEntry[];
  top_hit_cache: CacheEntry[];
}

interface CacheEntry {
  id?: string;
  stock_code: string;
  model_used: string;
  created_at: string;
  hit_count: number;
  expires_at?: string;
}

export default function CacheManagementTab() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState('');
  const [searchResults, setSearchResults] = useState<CacheEntry[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadCacheStats();
  }, []);

  const loadCacheStats = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/admin/cache/stats');
      const data = await response.json();

      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('确定要删除所有缓存吗？此操作不可撤销。')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await apiClient.delete('/api/admin/cache/all');
      const data = await response.json();

      if (data.success) {
        alert(data.message);
        await loadCacheStats();
      }
    } catch (error) {
      console.error('Failed to delete all cache:', error);
      alert('删除失败，请重试');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteExpired = async () => {
    if (!window.confirm('确定要删除所有过期缓存吗？')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await apiClient.delete('/api/admin/cache/expired');
      const data = await response.json();

      if (data.success) {
        alert(data.message);
        await loadCacheStats();
      }
    } catch (error) {
      console.error('Failed to delete expired cache:', error);
      alert('删除失败，请重试');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearchStock = async () => {
    if (!searchCode.trim()) {
      alert('请输入股票代码');
      return;
    }

    try {
      const response = await apiClient.get(`/api/admin/cache/stock/${searchCode}`);
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.cache);
      }
    } catch (error) {
      console.error('Failed to search cache:', error);
      alert('搜索失败');
    }
  };

  const handleDeleteStockCache = async (stockCode: string) => {
    if (!window.confirm(`确定要删除股票 ${stockCode} 的所有缓存吗？`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await apiClient.delete(`/api/admin/cache/stock/${stockCode}`);
      const data = await response.json();

      if (data.success) {
        alert(data.message);
        await loadCacheStats();
        if (searchCode === stockCode) {
          setSearchResults([]);
          setSearchCode('');
        }
      }
    } catch (error) {
      console.error('Failed to delete stock cache:', error);
      alert('删除失败');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-slate-900"></div>
        <p className="mt-4 text-slate-600">加载缓存数据...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">AI诊断缓存管理</h2>
        <button
          onClick={loadCacheStats}
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>刷新</span>
        </button>
      </div>

      {/* Cache Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Database className="w-6 h-6" />}
          label="总缓存数"
          value={stats?.total_cache || 0}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle2 className="w-6 h-6" />}
          label="有效缓存"
          value={stats?.active_cache || 0}
          color="green"
        />
        <StatCard
          icon={<AlertCircle className="w-6 h-6" />}
          label="过期缓存"
          value={stats?.expired_cache || 0}
          color="orange"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="总命中次数"
          value={stats?.total_hits || 0}
          color="purple"
        />
      </div>

      {/* Cache Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">缓存操作</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDeleteExpired}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Clock className="w-4 h-4" />
            <span>清理过期缓存</span>
          </button>
          <button
            onClick={handleDeleteAll}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            <span>删除所有缓存</span>
          </button>
        </div>
      </div>

      {/* Search by Stock Code */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">按股票代码搜索</h3>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchStock()}
              placeholder="输入股票代码 (如: 7203)"
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
            />
          </div>
          <button
            onClick={handleSearchStock}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
          >
            搜索
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">找到 {searchResults.length} 个缓存条目</p>
              <button
                onClick={() => handleDeleteStockCache(searchCode)}
                disabled={isDeleting}
                className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
              >
                删除该股票的所有缓存
              </button>
            </div>
            <div className="space-y-2">
              {searchResults.map((entry, index) => (
                <div
                  key={index}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-900">
                        股票代码: {entry.stock_code}
                      </p>
                      <p className="text-xs text-slate-600">
                        模型: {entry.model_used} | 命中: {entry.hit_count} 次
                      </p>
                      <p className="text-xs text-slate-500">
                        创建: {formatDate(entry.created_at)}
                      </p>
                      {entry.expires_at && (
                        <p className="text-xs text-slate-500">
                          过期: {formatDate(entry.expires_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Top Hit Cache */}
      {stats?.top_hit_cache && stats.top_hit_cache.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">热门缓存 (Top 10)</h3>
          <div className="space-y-2">
            {stats.top_hit_cache.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {entry.stock_code}
                  </p>
                  <p className="text-xs text-slate-600">
                    {entry.model_used} | 创建于 {formatDate(entry.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">{entry.hit_count}</p>
                    <p className="text-xs text-slate-600">次命中</p>
                  </div>
                  <button
                    onClick={() => handleDeleteStockCache(entry.stock_code)}
                    disabled={isDeleting}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Cache */}
      {stats?.recent_cache && stats.recent_cache.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">最近缓存 (最新20条)</h3>
          <div className="space-y-2">
            {stats.recent_cache.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {entry.stock_code}
                  </p>
                  <p className="text-xs text-slate-600">
                    {entry.model_used} | 命中 {entry.hit_count} 次
                  </p>
                  <p className="text-xs text-slate-500">
                    创建: {formatDate(entry.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteStockCache(entry.stock_code)}
                  disabled={isDeleting}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'blue' | 'purple' | 'green' | 'orange';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-600 mt-1">{label}</p>
    </div>
  );
}
