export default function SimpleLogo() {
  return (
    <>
      <style>
        {`
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes spin-reverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }

          .animate-spin-slow {
            animation: spin-slow 6s linear infinite;
          }

          .animate-spin-reverse {
            animation: spin-reverse 4s linear infinite;
          }
        `}
      </style>
      <div className="flex justify-center items-center mb-2">
        <div className="relative w-48 h-48 flex items-center justify-center">

          <div className="absolute inset-0 flex items-center justify-center animate-spin-slow">
            <div className="w-40 h-40 rounded-full border-4 border-blue-500/30"></div>
            <div className="absolute top-0 w-1.5 h-10 bg-gradient-to-b from-blue-400 via-blue-500 to-transparent rounded-full"></div>
            <div className="absolute bottom-0 w-1.5 h-10 bg-gradient-to-t from-blue-300 via-blue-400 to-transparent rounded-full"></div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center animate-spin-reverse">
            <div className="w-32 h-32 rounded-full border-4 border-cyan-400/40"></div>
            <div className="absolute left-0 w-8 h-1.5 bg-gradient-to-r from-cyan-400 via-cyan-300 to-transparent rounded-full"></div>
            <div className="absolute right-0 w-8 h-1.5 bg-gradient-to-l from-blue-400 via-cyan-400 to-transparent rounded-full"></div>
          </div>

          <div className="relative w-24 h-24 rounded-2xl flex items-center justify-center">
            <img
              src="/assets/logo-pqvxwnoy.png"
              alt="AI Stock Logo"
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </>
  );
}
