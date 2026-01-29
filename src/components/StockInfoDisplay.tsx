import { StockData } from '../types/stock';

interface StockInfoDisplayProps {
  stockData: StockData | null;
}

export default function StockInfoDisplay({ stockData }: StockInfoDisplayProps) {
  if (!stockData) {
    return null;
  }

  const { info } = stockData;

  const isPositive = info.change && parseFloat(info.change) >= 0;
  const changeColor = isPositive ? 'text-green-400' : 'text-red-400';

  return (
    <div className="w-[95%] mx-auto mb-3">
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl px-4 py-4 shadow-2xl border border-white/10">
        <h3 className="text-lg font-bold text-white mb-3 text-center border-b border-white/10 pb-2">
          情報参数
        </h3>

        <div className="space-y-3">
          <div className="bg-white/5 rounded-lg p-3 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-xl font-bold text-white">{info.name}</div>
                <div className="text-sm text-gray-400">{info.code} · {info.market}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{info.price}</div>
                <div className={`text-sm font-semibold ${changeColor}`}>
                  {isPositive && '+'}{info.change} ({isPositive && '+'}{info.changePercent})
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/5 rounded-lg p-2 border border-white/5">
              <div className="text-xs text-gray-400 mb-1">PER</div>
              <div className="text-sm font-bold text-white">{info.per || '-'}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2 border border-white/5">
              <div className="text-xs text-gray-400 mb-1">PBR</div>
              <div className="text-sm font-bold text-white">{info.pbr || '-'}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2 border border-white/5">
              <div className="text-xs text-gray-400 mb-1">配当利回り</div>
              <div className="text-sm font-bold text-white">{info.dividend || '-'}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 rounded-lg p-2 border border-white/5">
              <div className="text-xs text-gray-400 mb-1">業種</div>
              <div className="text-sm font-semibold text-white truncate">{info.industry || '-'}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2 border border-white/5">
              <div className="text-xs text-gray-400 mb-1">時価総額</div>
              <div className="text-sm font-semibold text-white">{info.marketCap || '-'}</div>
            </div>
          </div>

          {info.creditRatio && (
            <div className="bg-white/5 rounded-lg p-2 border border-white/5">
              <div className="text-xs text-gray-400 mb-1">信用倍率</div>
              <div className="text-sm font-semibold text-white">{info.creditRatio}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
