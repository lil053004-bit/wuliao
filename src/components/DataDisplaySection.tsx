import { TrendingDown } from 'lucide-react';

const mockStocksData = [
  {
    name: '日本証券商事',
    code: '0000',
    price: '2,450.5',
    change: '-42.5',
    changePercent: '-1.67%',
    barWidth: '65%'
  },
  {
    name: 'グローバルエナジー',
    code: '123ム',
    price: '1,890.0',
    change: '-12.5',
    changePercent: '-0.66%',
    barWidth: '45%'
  },
  {
    name: 'サクサイベーション',
    code: '567年',
    price: '5,120.0',
    change: '-120.0',
    changePercent: '-2.30%',
    barWidth: '85%'
  }
];

export default function DataDisplaySection() {
  return (
    <div id="data-display" className="w-full px-3 py-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          データ表示例（デモ）
        </h2>
        <p className="text-xs text-text-muted mb-2">
          AIが公開市場データから整理して、表示例です
        </p>
      </div>

      <div className="space-y-4">
        {mockStocksData.map((stock) => (
          <div
            key={stock.code}
            className="bg-dark-secondary/80 backdrop-blur-sm border border-border-blue/30 rounded-xl p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  {stock.name} ({stock.code})
                </h3>
              </div>
              <span className="text-xs bg-tech-blue/30 px-2 py-1 rounded text-tech-blue-light">
                証券所
              </span>
            </div>

            <div className="mb-3">
              <div className="text-2xl font-black text-white mb-1">
                {stock.price}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-red-400 mb-3">
              <TrendingDown className="w-4 h-4" />
              <span>前日比: {stock.change} ({stock.changePercent})</span>
            </div>

            <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                style={{ width: stock.barWidth }}
              />
            </div>
          </div>
        ))}
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
