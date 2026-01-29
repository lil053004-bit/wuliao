import AstronautAnimation from './AstronautAnimation';
import RocketAnimation from './RocketAnimation';
import LoadingProgressBars from './LoadingProgressBars';

interface InlineLoadingSceneProps {
  isVisible: boolean;
}

export default function InlineLoadingScene({ isVisible }: InlineLoadingSceneProps) {
  if (!isVisible) return null;

  return (
    <div className="w-full max-w-lg mx-auto px-4 animate-fadeIn">
      <div className="text-center mb-4">
        <h2 className="text-lg md:text-xl font-bold text-white mb-1">
          銘柄情報分析中
        </h2>
        <p className="text-xs md:text-sm text-text-muted">
          数秒お待ちください...
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 mb-4 scale-75">
        <AstronautAnimation />
        <RocketAnimation />
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
