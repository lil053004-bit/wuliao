import { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { StockData } from '../types/stock';

interface DataDisplaySectionProps {
  stockData?: StockData | null;
}

export default function DataDisplaySection({ stockData }: DataDisplaySectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const data = stockData?.prices.length
    ? stockData.prices.map(price => ({
        date: price.date,
        close: price.close,
        change: price.change,
        changePercent: price.changePercent,
        volume: price.volume
      }))
    : [];

  useEffect(() => {
    if (data.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % data.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [data.length]);

  if (!stockData?.prices.length) {
    return null;
  }

  return (
    <div id="data-display" className="w-full px-3 py-4 mt-2">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          株価履歴データ
        </h2>
        <p className="text-xs text-text-muted mb-2">
          {stockData.info.name}の過去の株価推移
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden"
        style={{ height: '420px' }}
      >
        <div
          className="space-y-4 transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateY(${currentIndex * -140}px)`
          }}
        >
          {data.map((item, index) => {
            const isPositive = !item.change.startsWith('-');
            const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
            const TrendIcon = isPositive ? TrendingUp : TrendingDown;
            const volume = parseFloat(item.volume.replace(/,/g, ''));
            const maxVolume = Math.max(...data.map(d => parseFloat(d.volume.replace(/,/g, ''))));
            const barWidth = `${(volume / maxVolume) * 100}%`;

            return (
              <div
                key={`${item.date}-${index}`}
                className="bg-dark-secondary/80 backdrop-blur-sm border border-border-blue/30 rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">
                      {item.date}
                    </h3>
                  </div>
                  <span className="text-xs bg-tech-blue/30 px-2 py-1 rounded text-tech-blue-light">
                    終値
                  </span>
                </div>

                <div className="mb-3">
                  <div className="text-2xl font-black text-white mb-1">
                    ¥{item.close}
                  </div>
                </div>

                <div className={`flex items-center gap-2 text-sm font-semibold ${changeColor} mb-3`}>
                  <TrendIcon className="w-4 h-4" />
                  <span>前日比: {item.change} ({item.changePercent})</span>
                </div>

                <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                    style={{ width: barWidth }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-text-muted leading-relaxed">
          ※ データは公開市場情報に基づく参考値です。投資判断の参考としてご利用ください。<br />
          データ更新は5分ごとに行われます。
        </p>
      </div>
    </div>
  );
}
