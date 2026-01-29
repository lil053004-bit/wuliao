export default function SimpleLogo() {
  return (
    <>
      <style>
        {`
          @keyframes divine-rays {
            0%, 100% { transform: rotate(0deg) scale(1); opacity: 0.6; }
            50% { transform: rotate(45deg) scale(1.1); opacity: 0.9; }
          }

          @keyframes cloud-rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .animate-divine-rays {
            animation: divine-rays 4s ease-in-out infinite;
          }

          .animate-cloud-rotate {
            animation: cloud-rotate 20s linear infinite;
          }
        `}
      </style>
      <div className="flex justify-center items-center mb-2">
        <div className="relative w-56 h-56 flex items-center justify-center">

          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <path d="M 40 160 L 100 60 L 160 160 Z" fill="none" stroke="#E60012" strokeWidth="3" opacity="0.6" />
              <path d="M 80 120 L 100 60 L 120 120 Z" fill="#FFFAFA" opacity="0.8" />
            </svg>
          </div>

          <div className="absolute inset-0 flex items-center justify-center animate-divine-rays">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-24 bg-gradient-to-t from-fuji-gold via-fuji-peach to-transparent origin-center"
                style={{
                  transform: `rotate(${i * 30}deg) translateY(-50px)`,
                }}
              />
            ))}
          </div>

          <div className="absolute inset-0 flex items-center justify-center animate-cloud-rotate">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-12 h-6 bg-white rounded-full opacity-30"
                style={{
                  transform: `rotate(${i * 60}deg) translateY(-80px)`,
                }}
              />
            ))}
          </div>

          <div className="relative w-32 h-32 rounded-full bg-fuji-sunrise shadow-fuji-sunrise-glow flex items-center justify-center">
            <div className="absolute inset-0 rounded-full overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-fuji-snow rounded-full animate-snow-sparkle"
                  style={{
                    top: `${20 + i * 20}%`,
                    left: `${20 + i * 15}%`,
                    animationDelay: `${i * 0.5}s`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-1 h-32 bg-gradient-to-b from-fuji-gold via-fuji-peach to-transparent opacity-40" />
        </div>
      </div>
    </>
  );
}
