interface ModernActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function ModernActionButton({ onClick, disabled = false }: ModernActionButtonProps) {
  return (
    <>
      <style>
        {`
          @keyframes sunrise-hover {
            0% { background-position: 0% 100%; }
            100% { background-position: 0% 0%; }
          }

          .fuji-button:hover {
            animation: sunrise-hover 1s ease-in-out forwards;
          }

          .fuji-button {
            background-size: 100% 200%;
            background-position: 0% 100%;
          }
        `}
      </style>
      <div className="relative animate-fadeIn mt-6" style={{ animationDelay: '0.3s' }}>
        <div className="absolute -inset-1 bg-fuji-sunrise opacity-30 blur-lg rounded-3xl" />

        <button
          onClick={onClick}
          disabled={disabled}
          className="fuji-button relative w-full text-white font-bold py-4 px-6 rounded-3xl shadow-fuji-divine hover:shadow-fuji-sunrise-glow transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden"
          style={{
            height: '56px',
            background: 'linear-gradient(to top, #E60012 0%, #FF6B35 50%, #FFD93D 100%)',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-8 bg-fuji-snow opacity-30 animate-snow-sparkle"
                style={{
                  left: `${20 + i * 20}%`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>

          <span className="text-lg relative z-10 drop-shadow-md">データ更新を確認</span>
        </button>
      </div>
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-600 leading-relaxed">
          本サービスは「情報提供サービス」であり、投資助言ではありません。
        </p>
      </div>
    </>
  );
}
