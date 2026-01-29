interface ModernActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function ModernActionButton({ onClick, disabled = false }: ModernActionButtonProps) {
  return (
    <>
      <div className="relative animate-fadeIn mt-6" style={{ animationDelay: '0.3s' }}>
        <button
          onClick={onClick}
          disabled={disabled}
          className="w-full text-white font-bold py-4 px-6 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600"
          style={{
            height: '56px'
          }}
        >
          <span className="text-lg">データ更新を確認</span>
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
