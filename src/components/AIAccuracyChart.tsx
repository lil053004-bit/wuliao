export default function AIAccuracyChart() {
  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-blue-200">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-blue-900 mb-2">AI株価予測精度</h3>
        <p className="text-sm text-blue-600">機械学習モデルによる高精度分析</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 shadow-md text-center border border-blue-100">
          <div className="text-3xl font-bold text-blue-600 mb-1">94%</div>
          <div className="text-xs text-gray-600">トレンド予測</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-md text-center border border-indigo-100">
          <div className="text-3xl font-bold text-indigo-600 mb-1">87%</div>
          <div className="text-xs text-gray-600">価格変動予測</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-md text-center border border-cyan-100">
          <div className="text-3xl font-bold text-cyan-600 mb-1">91%</div>
          <div className="text-xs text-gray-600">リスク評価</div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700 font-medium">テクニカル分析</span>
            <span className="text-blue-600 font-semibold">96%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-grow-bar"
              style={{ width: '96%', animationDelay: '0.1s' }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700 font-medium">ファンダメンタル分析</span>
            <span className="text-indigo-600 font-semibold">89%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full animate-grow-bar"
              style={{ width: '89%', animationDelay: '0.2s' }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700 font-medium">センチメント分析</span>
            <span className="text-cyan-600 font-semibold">92%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full animate-grow-bar"
              style={{ width: '92%', animationDelay: '0.3s' }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700 font-medium">機械学習モデル</span>
            <span className="text-purple-600 font-semibold">95%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full animate-grow-bar"
              style={{ width: '95%', animationDelay: '0.4s' }}
            ></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-center gap-2 text-blue-900">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">最新AIモデル ver.2.5 使用中</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes grow-bar {
          from {
            width: 0;
            opacity: 0.5;
          }
          to {
            opacity: 1;
          }
        }
        .animate-grow-bar {
          animation: grow-bar 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
