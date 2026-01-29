import { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { StockData } from '../types/stock';

const mockStocksData = [
  {
    date: '2024-01-25',
    close: '2,450.5',
    change: '-42.5',
    changePercent: '-1.67%',
    volume: '1,234,500'
  },
  {
    date: '2024-01-24',
    close: '2,493.0',
    change: '+15.0',
    changePercent: '+0.60%',
    volume: '987,600'
  },
  {
    date: '2024-01-23',
    close: '2,478.0',
    change: '-8.5',
    changePercent: '-0.34%',
    volume: '1,456,200'
  },
  {
    date: '2024-01-22',
    close: '2,486.5',
    change: '+32.0',
    changePercent: '+1.30%',
    volume: '1,678,900'
  },
  {
    date: '2024-01-19',
    close: '2,454.5',
    change: '-18.5',
    changePercent: '-0.75%',
    volume: '1,123,400'
  }
];

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
    : mockStocksData;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % data.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [data.length]);

  return (
    <div id="data-display" className="w-full px-3 py-4 mt-2">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-fuji-red via-fuji-peach to-fuji-gold bg-clip-text text-transparent mb-2">
          株価履歴データ
        </h2>
        <p className="text-xs text-fuji-dawn-pink mb-2">
          {stockData?.info.name ? `${stockData.info.name}の過去の株価推移` : '株式の過去の価格推移を表示します'}
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
                className="relative bg-gradient-to-br from-fuji-snow/90 to-pink-50/80 backdrop-blur-sm border-2 border-fuji-dawn-pink rounded-xl p-4 overflow-hidden group hover:shadow-fuji-gold-glow transition-all"
              >
                <svg className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 400 140" preserveAspectRatio="none">
                  <path d="M 0 70 Q 50 50 100 70 Q 150 90 200 70 Q 250 50 300 70 Q 350 90 400 70" stroke="#E60012" strokeWidth="2" fill="none" />
                </svg>

                <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-fuji-sunrise opacity-40" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-bold text-fuji-red mb-1">
                        {item.date}
                      </h3>
                    </div>
                    <span className="text-xs bg-fuji-gold/30 px-2 py-1 rounded text-fuji-red font-semibold">
                      終値
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="text-2xl font-black bg-gradient-to-r from-fuji-red to-fuji-peach bg-clip-text text-transparent mb-1">
                      ¥{item.close}
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 text-sm font-semibold ${changeColor} mb-3`}>
                    <TrendIcon className="w-4 h-4" />
                    <span>前日比: {item.change} ({item.changePercent})</span>
                  </div>

                  <div className="w-full bg-gray-300/50 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-fuji-red to-fuji-gold rounded-full transition-all duration-500"
                      style={{ width: barWidth }}
                    />
                  </div>
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
