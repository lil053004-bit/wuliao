import { useState, useEffect, useRef } from 'react';
import TabNavigation from '../components/TabNavigation';
import ModernGradientBackground from '../components/ModernGradientBackground';
import SimpleLogo from '../components/SimpleLogo';
import ProcessStepsSection from '../components/ProcessStepsSection';
import DataDisplaySection from '../components/DataDisplaySection';
import FormContainer from '../components/FormContainer';
import ModernStockInput from '../components/ModernStockInput';
import ModernActionButton from '../components/ModernActionButton';
import InlineLoadingScene from '../components/InlineLoadingScene';
import DiagnosisModal from '../components/DiagnosisModal';
import { StockData } from '../types/stock';
import { DiagnosisState } from '../types/diagnosis';
import { useUrlParams } from '../hooks/useUrlParams';
import { useStockSearch } from '../hooks/useStockSearch';
import { apiClient } from '../lib/apiClient';
import { userTracking } from '../lib/userTracking';
import { trackConversion, trackDiagnosisButtonClick, trackConversionButtonClick } from '../lib/googleTracking';

const diagnosisRecords = [
  { time: '2分前', stock: 'トヨタ自動車', icon: '👨' },
  { time: '5分前', stock: 'ソニーグループ', icon: '👩' },
  { time: '8分前', stock: '任天堂', icon: '👨' },
  { time: '12分前', stock: 'ソフトバンクグループ', icon: '👩' },
  { time: '15分前', stock: 'キーエンス', icon: '👨' },
  { time: '18分前', stock: '三菱UFJ', icon: '👩' },
  { time: '22分前', stock: 'ファーストリテイリング', icon: '👨' },
  { time: '25分前', stock: '東京エレクトロン', icon: '👩' },
  { time: '28分前', stock: 'リクルート', icon: '👨' },
  { time: '32分前', stock: 'KDDI', icon: '👩' },
];

export default function RefactoredHome() {
  const urlParams = useUrlParams();
  const { search, isLoading: isSearchLoading, loadStockData } = useStockSearch();
  const [stockCode, setStockCode] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [diagnosisState, setDiagnosisState] = useState<DiagnosisState>('initial');
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [diagnosisStartTime, setDiagnosisStartTime] = useState<number>(0);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [showLoadingScene, setShowLoadingScene] = useState<boolean>(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoSelectingRef = useRef<boolean>(false);
  const [autoFillMessage, setAutoFillMessage] = useState<string>('');
  const hasProcessedUrlParam = useRef(false);

  useEffect(() => {
    if (urlParams.code && !isSearchLoading && !hasProcessedUrlParam.current) {
      hasProcessedUrlParam.current = true;
      isAutoSelectingRef.current = true;

      loadStockData().then(() => {
        const searchResults = search(urlParams.code);

        if (searchResults.length > 0) {
          const firstResult = searchResults[0];
          const displayValue = `${firstResult.code} ${firstResult.name}`;

          setStockCode(firstResult.code);
          setInputValue(displayValue);
          fetchStockData(firstResult.code);

          setAutoFillMessage('株式情報を自動入力しました');
          setTimeout(() => setAutoFillMessage(''), 2000);
        } else {
          setStockCode(urlParams.code);
          setInputValue(urlParams.code);
          fetchStockData(urlParams.code);
        }
      });
    }
  }, [urlParams.code, isSearchLoading]);

  useEffect(() => {
    const trackPageVisit = async () => {
      if (stockData) {
        await userTracking.trackPageLoad({
          stockCode: stockCode,
          stockName: stockData.info.name,
          urlParams: {
            src: urlParams.src || '',
            gclid: urlParams.gclid || '',
            racText: urlParams.racText || '',
            code: urlParams.code || ''
          }
        });
      }
    };

    trackPageVisit();
  }, [stockData, stockCode, urlParams]);

  const fetchStockData = async (code: string) => {
    const cleanCode = code.replace(/[^\d]/g, '');

    if (!cleanCode || !/^\d{4}$/.test(cleanCode)) {
      setStockData(null);
      setStockCode(cleanCode);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`/api/stock/data?code=${cleanCode}`);

      if (!response.ok) {
        setStockData(null);
        setStockCode(cleanCode);
        setError(null);
        return;
      }

      const data = await response.json();
      setStockData(data);
      setStockCode(cleanCode);
      setError(null);
    } catch (err) {
      setStockData(null);
      setStockCode(cleanCode);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStockSelect = (code: string, name: string) => {
    isAutoSelectingRef.current = true;
    setStockCode(code);
    fetchStockData(code);
  };

  const handleFeaturedStockSelect = async (code: string, name: string) => {
    if (diagnosisState !== 'initial') return;

    const displayValue = `${code} ${name}`;
    setStockCode(code);
    setInputValue(displayValue);

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`/api/stock/data?code=${code}`);
      if (response.ok) {
        const data = await response.json();
        setStockData(data);
        setLoading(false);

        await new Promise(resolve => setTimeout(resolve, 100));

        window.scrollTo({ top: 0, behavior: 'smooth' });

        trackDiagnosisButtonClick();

        setDiagnosisState('connecting');
        setDiagnosisStartTime(Date.now());
        setAnalysisResult('');
        setLoadingProgress(0);
        setShowLoadingScene(true);

        const minimumLoadingTime = 2000;
        const startTime = Date.now();

        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }

        progressIntervalRef.current = setInterval(() => {
          setLoadingProgress((prev) => {
            if (prev < 85) {
              return prev + Math.random() * 15;
            } else if (prev < 95) {
              return prev + Math.random() * 2;
            }
            return prev;
          });
        }, 100);

        try {
          const apiUrl = `${import.meta.env.VITE_API_URL || ''}/api/gemini/diagnosis`;

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 50000);

          const diagnosisResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: code,
              stockData: {
                name: data.info.name,
                price: data.info.price,
                change: data.info.change,
                changePercent: data.info.changePercent,
                per: data.info.per,
                pbr: data.info.pbr,
                dividend: data.info.dividend,
                industry: data.info.industry,
                marketCap: data.info.marketCap,
              },
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }

          if (!diagnosisResponse.ok) {
            throw new Error('情報分析に失敗しました');
          }

          setDiagnosisState('processing');

          const contentType = diagnosisResponse.headers.get('content-type');

          if (contentType?.includes('text/event-stream')) {
            const reader = diagnosisResponse.body?.getReader();
            const decoder = new TextDecoder();
            let fullAnalysis = '';
            let firstChunk = true;

            if (!reader) {
              throw new Error('ストリーム読み取りに失敗しました');
            }

            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                break;
              }

              const text = decoder.decode(value, { stream: true });
              const lines = text.split('\n').filter(line => line.trim() !== '');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const lineData = line.slice(6);

                  try {
                    const parsed = JSON.parse(lineData);

                    if (parsed.error) {
                      throw new Error(parsed.error);
                    }

                    if (parsed.content) {
                      fullAnalysis += parsed.content;

                      if (firstChunk && fullAnalysis.trim().length > 0) {
                        setLoadingProgress(100);
                        const elapsedTime = Date.now() - startTime;
                        const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);

                        setTimeout(() => {
                          setShowLoadingScene(false);
                          setDiagnosisState('streaming');
                        }, remainingTime + 300);
                        firstChunk = false;
                      }

                      setAnalysisResult(fullAnalysis);
                    }

                    if (parsed.done) {
                      setDiagnosisState('results');

                      const durationMs = Date.now() - diagnosisStartTime;
                      await userTracking.trackDiagnosisClick({
                        stockCode: displayValue,
                        stockName: data.info.name || displayValue,
                        durationMs: durationMs
                      });
                    }
                  } catch (parseError) {
                    console.error('Error parsing SSE data:', parseError);
                  }
                }
              }
            }
          } else {
            const result = await diagnosisResponse.json();

            if (!result.analysis || result.analysis.trim() === '') {
              throw new Error('分析結果が生成されませんでした');
            }

            setAnalysisResult(result.analysis);

            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);

            setTimeout(() => {
              setShowLoadingScene(false);
              setDiagnosisState('results');
            }, remainingTime + 300);

            const durationMs = Date.now() - diagnosisStartTime;
            await userTracking.trackDiagnosisClick({
              stockCode: displayValue,
              stockName: data.info.name || displayValue,
              durationMs: durationMs
            });
          }
        } catch (diagErr) {
          console.error('Analysis error:', diagErr);
          let errorMessage = '分析中にエラーが発生しました';
          let errorDetails = '';

          if (diagErr instanceof Error) {
            if (diagErr.name === 'AbortError') {
              errorMessage = 'リクエストがタイムアウトしました';
              errorDetails = '接続に時間がかかりすぎています。もう一度お試しください。';
            } else {
              errorMessage = diagErr.message;

              try {
                const errorResponse = JSON.parse(diagErr.message);
                if (errorResponse.details) {
                  errorDetails = errorResponse.details;
                }
              } catch {
                errorDetails = diagErr.message;
              }
            }
          }

          setError(`${errorMessage}${errorDetails ? `\n詳細: ${errorDetails}` : ''}`);

          const elapsedTime = Date.now() - startTime;
          const remainingTime = Math.max(0, 2000 - elapsedTime);

          setTimeout(() => {
            setDiagnosisState('error');
            setShowLoadingScene(false);
            setLoadingProgress(0);
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
          }, remainingTime);
        }
      } else {
        setLoading(false);
        setError('株式データの取得に失敗しました');
      }
    } catch (err) {
      setLoading(false);
      setError('株式データの取得に失敗しました');
      console.error('Stock data fetch error:', err);
    }
  };

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const runDiagnosis = async () => {
    if (diagnosisState !== 'initial') return;

    window.scrollTo({ top: 0, behavior: 'smooth' });

    trackDiagnosisButtonClick();

    setDiagnosisState('connecting');
    setDiagnosisStartTime(Date.now());
    setAnalysisResult('');
    setLoadingProgress(0);
    setShowLoadingScene(true);

    const minimumLoadingTime = 2000;
    const startTime = Date.now();

    const cleanInputCode = inputValue.replace(/[^\d]/g, '');
    const isValidStockCode = /^\d{4}$/.test(cleanInputCode);
    const stockCodeMatches = cleanInputCode === stockCode;

    if (!stockData || !isValidStockCode || !stockCodeMatches) {
      setTimeout(() => {
        let fixedMessage = '';
        const trimmedInput = inputValue.trim();

        if (!trimmedInput || trimmedInput === '') {
          fixedMessage = `ボタンをタップするとLINE友だち追加画面に進みます。LINE追加後、分析したい銘柄コードまたは銘柄名を送信していただくと、参考情報レポートを無料で受け取ることができます。\n\n例：「7203」または「トヨタ自動車」と送信してください。`;
        } else {
          fixedMessage = `ボタンをタップするとLINE友だち追加画面に進みます。銘柄『${trimmedInput}』をLINEで送信していただくと、参考情報レポートを無料で受け取ることができます。\n\n銘柄コードは4桁の数字（例：7203）で入力してください。`;
        }

        setAnalysisResult(fixedMessage);
        setShowLoadingScene(false);
        setDiagnosisState('results');
      }, 2000);
      return;
    }

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev < 85) {
          return prev + Math.random() * 15;
        } else if (prev < 95) {
          return prev + Math.random() * 2;
        }
        return prev;
      });
    }, 100);

    try {
      const apiUrl = `${import.meta.env.VITE_API_URL || ''}/api/gemini/diagnosis`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 50000);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: stockCode,
          stockData: stockData ? {
            name: stockData.info.name,
            price: stockData.info.price,
            change: stockData.info.change,
            changePercent: stockData.info.changePercent,
            per: stockData.info.per,
            pbr: stockData.info.pbr,
            dividend: stockData.info.dividend,
            industry: stockData.info.industry,
            marketCap: stockData.info.marketCap,
          } : null,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      if (!response.ok) {
        throw new Error('情報分析に失敗しました');
      }

      setDiagnosisState('processing');

      const contentType = response.headers.get('content-type');

      if (contentType?.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullAnalysis = '';
        let firstChunk = true;

        if (!reader) {
          throw new Error('ストリーム読み取りに失敗しました');
        }

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const text = decoder.decode(value, { stream: true });
          const lines = text.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              try {
                const parsed = JSON.parse(data);

                if (parsed.error) {
                  throw new Error(parsed.error);
                }

                if (parsed.content) {
                  fullAnalysis += parsed.content;

                  if (firstChunk && fullAnalysis.trim().length > 0) {
                    setLoadingProgress(100);
                    const elapsedTime = Date.now() - startTime;
                    const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);

                    setTimeout(() => {
                      setShowLoadingScene(false);
                      setDiagnosisState('streaming');
                    }, remainingTime + 300);
                    firstChunk = false;
                  }

                  setAnalysisResult(fullAnalysis);
                }

                if (parsed.done) {
                  setDiagnosisState('results');

                  const durationMs = Date.now() - diagnosisStartTime;
                  await userTracking.trackDiagnosisClick({
                    stockCode: inputValue,
                    stockName: stockData?.info.name || inputValue,
                    durationMs: durationMs
                  });
                }
              } catch (parseError) {
                console.error('Error parsing SSE data:', parseError);
              }
            }
          }
        }
      } else {
        const result = await response.json();

        if (!result.analysis || result.analysis.trim() === '') {
          throw new Error('分析結果が生成されませんでした');
        }

        setAnalysisResult(result.analysis);

        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);

        setTimeout(() => {
          setShowLoadingScene(false);
          setDiagnosisState('results');
        }, remainingTime + 300);

        const durationMs = Date.now() - diagnosisStartTime;
        await userTracking.trackDiagnosisClick({
          stockCode: inputValue,
          stockName: stockData?.info.name || inputValue,
          durationMs: durationMs
        });
      }
    } catch (err) {
      console.error('Analysis error:', err);
      let errorMessage = '分析中にエラーが発生しました';
      let errorDetails = '';

      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'リクエストがタイムアウトしました';
          errorDetails = '接続に時間がかかりすぎています。もう一度お試しください。';
        } else {
          errorMessage = err.message;

          try {
            const errorResponse = JSON.parse(err.message);
            if (errorResponse.details) {
              errorDetails = errorResponse.details;
            }
          } catch {
            errorDetails = err.message;
          }
        }
      }

      setError(`${errorMessage}${errorDetails ? `\n詳細: ${errorDetails}` : ''}`);

      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 2000 - elapsedTime);

      setTimeout(() => {
        setDiagnosisState('error');
        setShowLoadingScene(false);
        setLoadingProgress(0);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      }, remainingTime);
    }
  };

  const handleLineConversion = async () => {
    try {
      trackConversionButtonClick();

      const response = await apiClient.get('/api/line-redirects/select');

      if (!response.ok) {
        console.error('Failed to get LINE redirect link');
        alert('LINEリンクの取得に失敗しました。しばらくしてからもう一度お試しください。');
        return;
      }

      const data = await response.json();

      if (!data.success || !data.link) {
        console.error('No active LINE redirect links available');
        alert('現在利用可能なLINEリンクがありません。');
        return;
      }

      const lineUrl = data.link.redirect_url;

      trackConversion();

      if (navigator.sendBeacon) {
        const sessionId = userTracking.getSessionId();
        const trackingData = JSON.stringify({
          sessionId: sessionId,
          eventType: 'conversion',
          gclid: urlParams.gclid,
          eventData: {
            conversion_time: new Date().toISOString()
          }
        });
        const blob = new Blob([trackingData], { type: 'application/json' });
        navigator.sendBeacon('/api/tracking/event', blob);
      } else {
        await userTracking.trackConversion({
          gclid: urlParams.gclid
        });
      }

      console.log('LINE conversion tracked successfully');

      window.location.href = lineUrl;
    } catch (error) {
      console.error('LINE conversion error:', error);
      alert('操作に失敗しました。しばらくしてからもう一度お試しください。');
    }
  };

  const handleReportDownload = async () => {
    try {
      const response = await apiClient.get('/api/line-redirects/select');
      let lineRedirectUrl = '';

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.link) {
          lineRedirectUrl = data.link.redirect_url;
        }
      }

      const { generateDiagnosisReport } = await import('../lib/reportGenerator');
      await generateDiagnosisReport({
        stockCode: stockCode,
        stockName: stockData?.info.name || '',
        analysis: analysisResult,
        lineRedirectUrl: lineRedirectUrl
      });

      await userTracking.trackEvent({
        sessionId: userTracking.getSessionId(),
        eventType: 'report_download',
        stockCode: stockCode,
        stockName: stockData?.info.name || '',
        eventData: {
          reportFormat: 'docx',
          timestamp: new Date().toISOString()
        }
      });

      console.log('Report download tracked successfully');
    } catch (error) {
      console.error('Report download error:', error);
      alert('レポートのダウンロードに失敗しました。もう一度お試しください。');
    }
  };

  const closeModal = () => {
    setDiagnosisState('initial');
    setAnalysisResult('');
    setLoadingProgress(0);
    setShowLoadingScene(false);
    setDiagnosisStartTime(0);
    setError(null);
    setStockCode('');
    setInputValue('');
    setStockData(null);

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      <ModernGradientBackground />

      <div className="relative z-10 flex-1 flex flex-col">
        <TabNavigation />

        {!showLoadingScene ? (
          <div className="flex-1 flex flex-col">
            <div id="overview" className="flex flex-col items-center justify-center px-3 py-2">
              <SimpleLogo />
              <div className="text-center px-4">
                <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                  銘柄情報分析
                </h1>
                <p className="text-xs text-text-muted leading-relaxed mb-1">
                  公開情報や市場データをもとに銘柄情報を整理した参考レポートをご提供します。投資判断に必要な基本情報から、最新の市場動向、企業の財務状況、業界内での位置づけなどを分かりやすくまとめています。
                </p>
                <p className="text-xs text-text-muted leading-relaxed mb-1">
                  ※提供される全ての情報は参考情報であり、投資の最終判断は必ずご自身の責任で行ってください。現在無料で提供中ですが、将来的に有料化する可能性があります。
                </p>
              </div>
            </div>

            <div id="analysis-form" className="flex flex-col justify-end mt-2">
              <FormContainer onStockSelect={handleFeaturedStockSelect}>
                <ModernStockInput
                  value={inputValue}
                  onChange={setInputValue}
                  onStockSelect={handleStockSelect}
                  search={search}
                  isLoading={isSearchLoading}
                  loadStockData={loadStockData}
                />

                {autoFillMessage && (
                  <div className="text-center py-2 text-sm text-tech-blue-light font-medium animate-fadeIn">
                    {autoFillMessage}
                  </div>
                )}

                {loading && (
                  <div className="text-center py-4 animate-fadeIn">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-gray-900"></div>
                    <p className="mt-2 text-gray-600 text-sm">Loading...</p>
                  </div>
                )}

                {error && diagnosisState !== 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center animate-fadeIn mt-4">
                    <p className="text-red-600 text-sm font-semibold">{error}</p>
                  </div>
                )}

                {!loading && diagnosisState === 'initial' && (
                  <ModernActionButton onClick={runDiagnosis} disabled={false} />
                )}

                {diagnosisState === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center animate-fadeIn mt-4">
                    <h3 className="text-lg font-bold text-red-600 mb-2">分析エラー</h3>
                    <p className="text-red-600 text-sm mb-4 whitespace-pre-line">{error}</p>
                    <button
                      onClick={() => {
                        setDiagnosisState('initial');
                        setError(null);
                      }}
                      className="px-6 py-3 bg-tech-blue-gradient text-white font-bold rounded-xl transition-all shadow-blue-glow hover:opacity-90"
                    >
                      もう一度試す
                    </button>
                  </div>
                )}
              </FormContainer>
            </div>

            <ProcessStepsSection />

            <DataDisplaySection />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <InlineLoadingScene isVisible={showLoadingScene} />
          </div>
        )}
      </div>

      <DiagnosisModal
        isOpen={diagnosisState === 'streaming' || diagnosisState === 'results'}
        onClose={closeModal}
        analysis={analysisResult}
        stockCode={inputValue}
        stockName={stockData?.info.name || inputValue}
        onLineConversion={handleLineConversion}
        onReportDownload={handleReportDownload}
        isStreaming={diagnosisState === 'streaming'}
        isConnecting={diagnosisState === 'connecting'}
        currentPrice={stockData?.info.price}
        priceChange={stockData?.info.change}
        priceChangePercent={stockData?.info.changePercent}
      />
    </div>
  );
}
