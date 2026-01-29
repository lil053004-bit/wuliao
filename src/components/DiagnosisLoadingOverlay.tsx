import { useEffect, useState } from 'react';

interface DiagnosisLoadingOverlayProps {
  isVisible: boolean;
  progress: number;
  onComplete?: () => void;
}

export default function DiagnosisLoadingOverlay({
  isVisible,
  progress,
  onComplete
}: DiagnosisLoadingOverlayProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (progress >= 100 && isVisible) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 500);
      return () => clearTimeout(timer);
    } else if (!isVisible) {
      setIsExiting(false);
    }
  }, [progress, isVisible, onComplete]);

  useEffect(() => {
    if (isVisible) {
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
  }, [isVisible]);

  if (!isVisible && !isExiting) return null;

  return (
    <div
      className={`fixed inset-0 z-[9997] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-opacity duration-500 ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ touchAction: 'none' }}
    >
      <div className={`w-full max-w-2xl transition-transform duration-500 ${
        isExiting ? 'scale-95' : 'scale-100'
      }`}>
        <div
          className="border-2 rounded-2xl shadow-2xl p-8"
          style={{
            background: 'linear-gradient(to bottom right, #3A3452, #4A4563, #3A3452)',
            borderColor: 'rgba(139, 131, 255, 0.5)'
          }}
        >
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24">
              <div
                className="absolute inset-0 rounded-full animate-pulse opacity-50"
                style={{ background: 'linear-gradient(to bottom right, #8B83FF, #6B63FF)' }}
              ></div>
              <div
                className="absolute inset-2 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(to bottom right, #A78BFA, #8B83FF)' }}
              >
                <span className="text-4xl">🤖</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2 text-center">銘柄情報分析中</h3>
            <p className="text-sm text-center" style={{ color: '#C4B5FD' }}>市場データを深度分析しています...</p>
          </div>

          <div className="relative w-full h-3 bg-gray-800/50 rounded-full overflow-hidden mb-3 border" style={{ borderColor: 'rgba(139, 131, 255, 0.3)' }}>
            <div
              className="absolute top-0 left-0 h-full transition-all duration-300 ease-out shadow-lg"
              style={{
                width: `${Math.min(progress, 100)}%`,
                background: 'linear-gradient(to right, #8B83FF, #6B63FF)',
                boxShadow: '0 0 20px rgba(139, 131, 255, 0.5)'
              }}
            />
          </div>

          <div className="mb-6 text-center">
            <span className="text-sm font-semibold" style={{ color: '#A78BFA' }}>
              {Math.floor(Math.min(progress, 100))}%
            </span>
          </div>

          <div className="bg-gray-900/40 border-2 rounded-lg p-6 backdrop-blur-sm" style={{ borderColor: 'rgba(139, 131, 255, 0.3)' }}>
            <div className="space-y-3 text-sm">
              <p className="text-white font-semibold text-center text-base">
                📊 複数の指標を総合的に評価中
              </p>
              <p className="text-center" style={{ color: '#C4B5FD' }}>
                しばらくお待ちください
              </p>
              <div className="pt-3 border-t border-modern-purple-500/30">
                <p className="text-xs text-gray-300 text-center leading-relaxed">
                  すべてのデータは公開されている市場情報を使用しており、公開市場データに基づいて分析を行っています。財務指標、業界動向、市場トレンドを総合的に評価しています。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
