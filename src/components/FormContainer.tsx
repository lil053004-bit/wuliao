import { ReactNode } from 'react';

interface FormContainerProps {
  children: ReactNode;
  onStockSelect?: (code: string, name: string) => void;
}

const featuredStocks = [
  { code: '7203', name: 'トヨタ自動車' },
  { code: '6758', name: 'ソニーグループ' },
  { code: '7974', name: '任天堂' },
  { code: '9984', name: 'ソフトバンクG' },
  { code: '6861', name: 'キーエンス' },
  { code: '8306', name: '三菱UFJ' },
];

export default function FormContainer({ children, onStockSelect }: FormContainerProps) {
  return (
    <div className="w-[95%] mx-auto">
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-t-[32px] px-5 py-6 shadow-2xl border border-white/10">
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white text-center mb-2">
              対象銘柄の公開データを確認
            </h2>
            <p className="text-xs text-gray-300 text-center">
              銘柄名または一銘柄コードを入力してください
            </p>
          </div>

          {children}

          <div className="mt-4 bg-white/5 border border-white/10 rounded-lg p-3">
            <h3 className="text-sm font-bold text-white mb-3 text-center">
              注目の銘柄
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {featuredStocks.map((stock) => (
                <button
                  key={stock.code}
                  onClick={() => onStockSelect?.(stock.code, stock.name)}
                  className="bg-blue-600/80 hover:bg-blue-500 text-white text-xs font-semibold py-1.5 px-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <div className="text-left">
                    <div className="font-bold text-[11px]">{stock.code}</div>
                    <div className="text-[9px] opacity-90">{stock.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
