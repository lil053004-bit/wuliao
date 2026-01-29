import { useState, useEffect } from 'react';
import {
  Globe,
  MousePointerClick,
  CheckCircle,
  Clock,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Activity,
  FileText
} from 'lucide-react';
import { apiClient } from '../lib/apiClient';

interface UserSession {
  id: string;
  session_id: string;
  stock_code: string;
  stock_name: string;
  url_params: Record<string, string>;
  first_visit_at: string;
  converted: number;
  converted_at: string | null;
  events?: UserEvent[];
}

interface UserEvent {
  id: string;
  event_type: string;
  event_data: Record<string, any>;
  stock_code: string;
  stock_name: string;
  duration_ms: number | null;
  gclid: string | null;
  created_at: string;
}

export default function SessionsTab() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [events, setEvents] = useState<Record<string, UserEvent[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterConverted, setFilterConverted] = useState<'all' | 'converted' | 'not_converted'>('all');
  const [filterEventType, setFilterEventType] = useState<'all' | 'page_load' | 'diagnosis' | 'report_download'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSessions, setTotalSessions] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [quickDateFilter, setQuickDateFilter] = useState<number>(7);
  const sessionsPerPage = 50;

  useEffect(() => {
    loadDateRange();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      loadSessions();
    }
  }, [currentPage, startDate, endDate]);

  const loadDateRange = async () => {
    try {
      const response = await apiClient.get('/api/admin/sessions/date-range');
      const data = await response.json();

      if (data.success && data.dateRange) {
        if (data.dateRange.earliest_date) {
          setStartDate(data.dateRange.earliest_date.split('T')[0]);
        }
        if (data.dateRange.latest_date) {
          setEndDate(data.dateRange.latest_date.split('T')[0]);
        }
      } else {
        const today = new Date().toISOString().split('T')[0];
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        setStartDate(sevenDaysAgo);
        setEndDate(today);
      }
    } catch (error) {
      console.error('Failed to load date range:', error);
      const today = new Date().toISOString().split('T')[0];
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setStartDate(sevenDaysAgo);
      setEndDate(today);
    }
  };

  const loadSessions = async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * sessionsPerPage;
      const url = `/api/admin/sessions?limit=${sessionsPerPage}&offset=${offset}&startDate=${startDate}&endDate=${endDate}`;
      const response = await apiClient.get(url);
      const data = await response.json();

      if (data.sessions) {
        setSessions(data.sessions);
        setTotalSessions(data.total || 0);

        const eventsBySession: Record<string, UserEvent[]> = {};
        data.sessions.forEach(session => {
          if (session.events) {
            eventsBySession[session.session_id] = session.events;
          }
        });
        setEvents(eventsBySession);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportConversions = async () => {
    setIsExporting(true);
    try {
      const response = await apiClient.get('/api/admin/conversions/export');

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      a.download = `google_offline_conversions_${timestamp}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export conversions:', error);
      alert('エクスポートに失敗しました');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDateFilterApply = () => {
    setCurrentPage(1);
    loadSessions();
  };

  const handleQuickDateFilter = (days: number) => {
    setQuickDateFilter(days);
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - days);

    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(pastDate.toISOString().split('T')[0]);
    setCurrentPage(1);

    setTimeout(() => {
      loadSessions();
    }, 100);
  };

  const toggleSession = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const filteredSessions = sessions.filter(session => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        session.stock_code?.toLowerCase().includes(searchLower) ||
        session.stock_name?.toLowerCase().includes(searchLower) ||
        session.url_params?.gclid?.toLowerCase().includes(searchLower) ||
        session.url_params?.src?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Conversion filter
    if (filterConverted === 'converted' && !session.converted) return false;
    if (filterConverted === 'not_converted' && session.converted) return false;

    // Event type filter
    if (filterEventType !== 'all') {
      const sessionEvents = events[session.session_id] || [];
      let hasEventType = false;

      if (filterEventType === 'page_load') {
        hasEventType = sessionEvents.some(e => e.event_type === 'page_load');
      } else if (filterEventType === 'diagnosis') {
        hasEventType = sessionEvents.some(e => e.event_type === 'diagnosis_click');
      } else if (filterEventType === 'report_download') {
        hasEventType = sessionEvents.some(e => e.event_type === 'report_download');
      }

      if (!hasEventType) return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-slate-900"></div>
        <p className="mt-4 text-slate-600">加载会话数据...</p>
      </div>
    );
  }

  const totalPages = Math.ceil(totalSessions / sessionsPerPage);
  const startIndex = (currentPage - 1) * sessionsPerPage + 1;
  const endIndex = Math.min(currentPage * sessionsPerPage, totalSessions);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="space-y-4">
          {/* Quick Date Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">快捷筛选:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {[1, 3, 7, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => handleQuickDateFilter(days)}
                  className={`px-4 py-2 rounded-lg transition ${
                    quickDateFilter === days
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {days}天
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">自定义日期:</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setQuickDateFilter(0);
                }}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              />
              <span className="text-slate-600">至</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setQuickDateFilter(0);
                }}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              />
              <button
                onClick={handleDateFilterApply}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
              >
                应用
              </button>
            </div>
            <div className="flex-1"></div>
            <button
              onClick={handleExportConversions}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? '导出中...' : '导出转化数据(CSV)'}</span>
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索股票代码、股票名称、来源或gclid..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Conversion Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-600" />
              <select
                value={filterConverted}
                onChange={(e) => setFilterConverted(e.target.value as any)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              >
                <option value="all">全部会话</option>
                <option value="converted">已转化</option>
                <option value="not_converted">未转化</option>
              </select>
            </div>

            {/* Event Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-600" />
              <select
                value={filterEventType}
                onChange={(e) => setFilterEventType(e.target.value as any)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              >
                <option value="all">全部事件</option>
                <option value="page_load">仅访问</option>
                <option value="diagnosis">已诊断</option>
                <option value="report_download">已下载报告</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            用户会话 ({totalSessions} 总计, 显示 {startIndex}-{endIndex})
          </h3>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-600">没有找到匹配的会话</p>
          </div>
        ) : (
          <>
            {filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                events={events[session.session_id] || []}
                isExpanded={expandedSessions.has(session.session_id)}
                onToggle={() => toggleSession(session.session_id)}
              />
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    第 {currentPage} 页，共 {totalPages} 页
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>上一页</span>
                    </button>
                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 rounded-lg transition ${
                              currentPage === pageNum
                                ? 'bg-slate-900 text-white'
                                : 'border border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>下一页</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface SessionCardProps {
  session: UserSession;
  events: UserEvent[];
  isExpanded: boolean;
  onToggle: () => void;
}

function SessionCard({ session, events, isExpanded, onToggle }: SessionCardProps) {
  const [showAllParams, setShowAllParams] = useState(false);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const calculateSessionDuration = () => {
    if (!session.last_activity_at) return null;
    const start = new Date(session.first_visit_at).getTime();
    const end = new Date(session.last_activity_at).getTime();
    const durationMs = end - start;
    if (durationMs < 60000) return `${Math.round(durationMs / 1000)}秒`;
    return `${Math.round(durationMs / 60000)}分钟`;
  };

  const eventCounts = {
    total: events.length,
    page_loads: events.filter(e => e.event_type === 'page_load').length,
    diagnoses: events.filter(e => e.event_type === 'diagnosis_click').length,
    reports: events.filter(e => e.event_type === 'report_download').length,
    conversions: events.filter(e => e.event_type === 'conversion').length
  };

  const allUrlParams = Object.entries(session.url_params || {}).filter(([_, value]) => value);
  const hasMultipleParams = allUrlParams.length > 2;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Session Header */}
      <div
        onClick={onToggle}
        className="p-4 cursor-pointer hover:bg-slate-50 transition"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 border border-blue-300 rounded-lg">
                <span className="font-bold text-blue-900 text-base">
                  {session.stock_code || 'N/A'}
                </span>
                <span className="font-semibold text-blue-700">
                  {session.stock_name || 'Unknown'}
                </span>
              </div>
              {session.converted && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                  <CheckCircle className="w-3 h-3" />
                  已转化
                </span>
              )}
              {eventCounts.diagnoses > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                  <MousePointerClick className="w-3 h-3" />
                  已诊断 {eventCounts.diagnoses}
                </span>
              )}
              {eventCounts.reports > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                  <Download className="w-3 h-3" />
                  已下载 {eventCounts.reports}
                </span>
              )}
              {calculateSessionDuration() && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded">
                  <Clock className="w-3 h-3" />
                  {calculateSessionDuration()}
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded">
                <Activity className="w-3 h-3" />
                {eventCounts.total} 事件
              </span>
            </div>
            <div className="flex flex-col gap-2 text-sm text-slate-600">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(session.first_visit_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <span>来源: {session.url_params?.src || '直接访问'}</span>
                </div>
              </div>
              {session.url_params?.gclid && (
                <div className="flex items-center gap-1">
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  <span className="font-mono text-xs break-all">
                    GCLID: {session.url_params.gclid}
                  </span>
                </div>
              )}
              {hasMultipleParams && (
                <div className="mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllParams(!showAllParams);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {showAllParams ? '隐藏' : '显示'} 全部URL参数 ({allUrlParams.length})
                  </button>
                  {showAllParams && (
                    <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="grid grid-cols-1 gap-2">
                        {allUrlParams.map(([key, value]) => (
                          <div key={key} className="flex items-start gap-2">
                            <span className="text-xs font-semibold text-slate-700 min-w-[80px]">{key}:</span>
                            <span className="text-xs text-slate-600 break-all flex-1 font-mono">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>
      </div>

      {/* Session Timeline */}
      {isExpanded && (
        <div className="border-t border-slate-200 bg-slate-50 p-4">
          <h4 className="font-semibold text-slate-900 mb-4">用户行为时间线</h4>
          <div className="space-y-3">
            {events.map((event, index) => (
              <EventItem key={event.id} event={event} isLast={index === events.length - 1} />
            ))}
            {events.length === 0 && (
              <p className="text-sm text-slate-600 text-center py-4">暂无事件记录</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface EventItemProps {
  event: UserEvent;
  isLast: boolean;
}

function EventItem({ event, isLast }: EventItemProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'page_load':
        return <Globe className="w-5 h-5 text-blue-600" />;
      case 'diagnosis_click':
        return <MousePointerClick className="w-5 h-5 text-purple-600" />;
      case 'report_download':
        return <FileText className="w-5 h-5 text-orange-600" />;
      case 'conversion':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-slate-600" />;
    }
  };

  const getEventTitle = (type: string) => {
    switch (type) {
      case 'page_load':
        return '加载网站';
      case 'diagnosis_click':
        return '诊断股票';
      case 'report_download':
        return '下载报告';
      case 'conversion':
        return '转化成功';
      default:
        return type;
    }
  };

  const getEventBgColor = (type: string) => {
    switch (type) {
      case 'page_load':
        return 'bg-blue-100 border-blue-300';
      case 'diagnosis_click':
        return 'bg-purple-100 border-purple-300';
      case 'report_download':
        return 'bg-orange-100 border-orange-300';
      case 'conversion':
        return 'bg-green-100 border-green-300';
      default:
        return 'bg-slate-100 border-slate-300';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`p-2 rounded-lg border-2 ${getEventBgColor(event.event_type)}`}>
          {getEventIcon(event.event_type)}
        </div>
        {!isLast && <div className="flex-1 w-0.5 bg-slate-300 mt-2" style={{ minHeight: '24px' }} />}
      </div>
      <div className="flex-1 pb-4">
        <div className="flex items-center justify-between mb-1">
          <h5 className="font-semibold text-slate-900">{getEventTitle(event.event_type)}</h5>
          <span className="text-xs text-slate-500">{formatTime(event.created_at)}</span>
        </div>
        <div className="text-sm text-slate-600 space-y-1">
          {event.event_type === 'page_load' && (
            <>
              <p>股票代码: <span className="font-semibold">{event.stock_code}</span></p>
              <p>股票名称: <span className="font-semibold">{event.stock_name}</span></p>
              {event.event_data?.url && (
                <p className="text-xs break-all">URL: {event.event_data.url}</p>
              )}
              {event.event_data?.referrer && (
                <p className="text-xs break-all">来源: {event.event_data.referrer}</p>
              )}
            </>
          )}
          {event.event_type === 'diagnosis_click' && (
            <>
              <p>股票代码: <span className="font-semibold">{event.stock_code}</span></p>
              <p>股票名称: <span className="font-semibold">{event.stock_name}</span></p>
              {event.duration_ms && (
                <p>加载时长: <span className="font-semibold">{(event.duration_ms / 1000).toFixed(2)}秒</span></p>
              )}
            </>
          )}
          {event.event_type === 'report_download' && (
            <>
              <p>股票代码: <span className="font-semibold">{event.stock_code}</span></p>
              <p>股票名称: <span className="font-semibold">{event.stock_name}</span></p>
              {event.event_data?.reportFormat && (
                <p>格式: <span className="font-semibold uppercase">{event.event_data.reportFormat}</span></p>
              )}
              {event.event_data?.timestamp && (
                <p>下载时间: <span className="font-semibold">{formatTime(event.event_data.timestamp)}</span></p>
              )}
            </>
          )}
          {event.event_type === 'conversion' && (
            <>
              {event.gclid && (
                <p>GCLID: <span className="font-mono text-xs">{event.gclid}</span></p>
              )}
              <p>转换时间: <span className="font-semibold">{formatTime(event.created_at)}</span></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
