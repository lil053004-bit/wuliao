import LoadingProgressBars from './LoadingProgressBars';

interface InlineLoadingSceneProps {
  isVisible: boolean;
}

export default function InlineLoadingScene({ isVisible }: InlineLoadingSceneProps) {
  if (!isVisible) return null;

  return (
    <div className="w-full max-w-lg mx-auto px-4 animate-fadeIn">
      <div className="text-center mb-4">
        <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-fuji-red via-fuji-peach to-fuji-gold bg-clip-text text-transparent mb-1">
          銘柄情報分析中
        </h2>
        <p className="text-xs md:text-sm text-fuji-dawn-pink">
          数秒お待ちください...
        </p>
      </div>

      <div className="relative flex items-center justify-center mb-6 h-40">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 200 120" className="w-64 h-32">
            <path d="M 0 120 L 50 80 L 100 20 L 150 80 L 200 120 Z" fill="url(#fujiGradient)" opacity="0.8" />
            <path d="M 80 50 L 100 20 L 120 50 Z" fill="#FFFAFA" opacity="0.9" />
            <defs>
              <linearGradient id="fujiGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E60012" />
                <stop offset="100%" stopColor="#FF6B35" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="absolute bottom-12 w-24 h-24 animate-sunrise">
          <div className="w-full h-full rounded-full bg-fuji-sunrise shadow-fuji-sunrise-glow" />
        </div>

        <div className="absolute inset-0 animate-ray-expand">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-0.5 h-16 bg-gradient-to-t from-fuji-gold to-transparent origin-bottom"
              style={{
                transform: `translate(-50%, -100%) rotate(${i * 45}deg)`,
                opacity: 0.5,
              }}
            />
          ))}
        </div>

        <div className="absolute bottom-0 w-full h-16 opacity-40">
          <svg viewBox="0 0 400 60" className="w-full h-full animate-wave-flow">
            <path d="M 0 30 Q 50 20 100 30 Q 150 40 200 30 Q 250 20 300 30 Q 350 40 400 30 L 400 60 L 0 60 Z"
                  fill="#FFFAFA" opacity="0.6" />
          </svg>
        </div>
      </div>

      <div className="max-w-sm mx-auto">
        <LoadingProgressBars isVisible={isVisible} />
      </div>

      <div className="mt-4 text-center">
        <p className="text-[10px] text-text-muted leading-relaxed">
          すべてのデータは公開されている市場情報を使用しており、
          <br className="hidden sm:inline" />
          公開市場データに基づいて分析を行っています
        </p>
      </div>
    </div>
  );
}
