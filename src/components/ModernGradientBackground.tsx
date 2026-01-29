export default function ModernGradientBackground() {
  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden">
      <div className="absolute inset-0 w-full h-full bg-fuji-dawn" />

      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-96 opacity-20">
        <svg viewBox="0 0 800 400" className="w-full h-full">
          <path d="M 0 400 L 200 300 L 400 150 L 600 300 L 800 400 Z" fill="#1A2B4A" opacity="0.3" />
        </svg>
      </div>

      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-3xl h-80">
        <svg viewBox="0 0 600 350" className="w-full h-full">
          <path d="M 0 350 L 150 250 L 300 80 L 450 250 L 600 350 Z" fill="#0F1E3A" opacity="0.6" />
          <path d="M 250 150 L 300 80 L 350 150 Z" fill="#FFFAFA" opacity="0.9" />
        </svg>
      </div>

      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 w-48 h-48 animate-sunrise">
        <div className="w-full h-full rounded-full bg-fuji-sunrise shadow-fuji-sunrise-glow" />
        <div className="absolute inset-0 animate-ray-expand">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-1 h-32 bg-gradient-to-t from-fuji-gold to-transparent origin-bottom"
              style={{
                transform: `translate(-50%, -100%) rotate(${i * 30}deg)`,
                opacity: 0.4,
              }}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-64 animate-cloud-float opacity-30">
        <svg viewBox="0 0 1200 200" className="w-full h-full">
          <path d="M 0 150 Q 100 100 200 150 Q 300 100 400 150 Q 500 100 600 150 Q 700 100 800 150 Q 900 100 1000 150 Q 1100 100 1200 150 L 1200 200 L 0 200 Z"
                fill="#FFFAFA" opacity="0.6" />
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-48 animate-cloud-float-slow opacity-20" style={{ animationDelay: '-10s' }}>
        <svg viewBox="0 0 1200 150" className="w-full h-full">
          <path d="M -200 100 Q -100 70 0 100 Q 100 70 200 100 Q 300 70 400 100 Q 500 70 600 100 Q 700 70 800 100 Q 900 70 1000 100 Q 1100 70 1200 100 L 1200 150 L -200 150 Z"
                fill="#FFFAFA" opacity="0.5" />
        </svg>
      </div>

      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-fuji-snow rounded-full animate-snow-sparkle"
          style={{
            top: `${20 + i * 8}%`,
            left: `${30 + i * 10}%`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </div>
  );
}
