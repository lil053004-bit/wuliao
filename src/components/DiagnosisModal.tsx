import { X, ExternalLink, Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import AnalysisRenderer from './AnalysisRenderer';
import AIAccuracyChart from './AIAccuracyChart';

interface DiagnosisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: string;
  stockCode: string;
  stockName: string;
  onLineConversion: () => void;
  onReportDownload: () => void;
  isStreaming?: boolean;
  isConnecting?: boolean;
  currentPrice?: string;
  priceChange?: string;
  priceChangePercent?: string;
}

export default function DiagnosisModal({
  isOpen,
  onClose,
  analysis,
  stockCode,
  stockName,
  onLineConversion,
  onReportDownload,
  isStreaming = false,
  isConnecting = false,
  currentPrice,
  priceChange,
  priceChangePercent,
}: DiagnosisModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const lastLengthRef = useRef(0);

  useEffect(() => {
    if (isStreaming && contentRef.current && analysis.length > lastLengthRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
      lastLengthRef.current = analysis.length;
    }
  }, [analysis, isStreaming]);

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.body.setAttribute('data-modal-open', 'true');

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.body.removeAttribute('data-modal-open');
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-75" style={{ touchAction: 'none' }}>
      <div className="relative w-full max-w-3xl max-h-[95vh]">
        <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden border-2 border-tech-blue" style={{ touchAction: 'auto' }}>
          <div className="sticky top-0 flex items-center justify-between px-6 py-4" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)' }}>
          <div className="flex-1 text-center">
            <h2 className="text-sm font-bold text-white">
              銘柄情報レポート（参考情報）
            </h2>
            {isConnecting && (
              <div className="flex items-center gap-2 text-white text-sm justify-center mt-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>サーバーに接続中...</span>
              </div>
            )}
            {isStreaming && !isConnecting && (
              <div className="flex items-center gap-2 text-white text-sm justify-center mt-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>レポート生成中...</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors ml-4 hover:bg-white/20"
            aria-label="閉じる"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div ref={contentRef} className="overflow-y-auto max-h-[calc(95vh-150px)] px-2 py-2">
          <div className="mb-6">
            {currentPrice ? (
              <div className="mb-4 p-2 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                <p className="text-base text-gray-800 leading-relaxed mb-3">
                  ご入力いただいた<strong className="text-blue-700">{stockName}（{stockCode}）</strong>について、市場データと独自ロジックをもとに銘柄情報を整理しました。
                </p>
                <div className="bg-white rounded-lg p-2 mb-3 border border-blue-100">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs text-gray-600">現在株価：</span>
                    <span className="text-lg font-bold text-gray-900">{currentPrice} 円</span>
                  </div>
                  {priceChange && priceChangePercent && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-gray-600">前日比：</span>
                      <span className={`text-sm font-semibold ${parseFloat(priceChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {priceChange} 円（{priceChangePercent}）
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                  より詳しい株価情報レポートは、LINEでご確認いただけます。<br />
                  「株式アシスタント」LINE公式アカウントを追加してください。
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  LINE追加後、銘柄コードまたは銘柄名<br />
                  （例：{stockCode}／{stockName}）<br />
                  を送信すると、参考レポートを自動でお届けします。
                </p>
              </div>
            ) : (
              <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                <p className="text-sm text-gray-800 leading-relaxed font-semibold mb-2">
                  📱 LINE で詳細な銘柄診断レポートを受け取る
                </p>
                <p className="text-xs text-gray-700 leading-relaxed">
                  以下のボタンから「株式アシスタント」LINE公式アカウントを追加してください。<br />
                  LINE追加後、診断したい銘柄コードまたは銘柄名を送信すると、分析した詳細レポートをお届けします。
                </p>
              </div>
            )}

            <button
              onClick={onLineConversion}
              className="w-full bg-gradient-to-r from-[#06C755] to-[#05b04b] hover:from-[#05b04b] hover:to-[#049c42] text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-sm mt-2"
            >
              <ExternalLink className="w-6 h-6 flex-shrink-0" />
              <span>LINE追加でレポートを見る</span>
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
