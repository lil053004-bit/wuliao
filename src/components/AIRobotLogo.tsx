export default function AIRobotLogo() {
  return (
    <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 mx-auto animate-robot-float transition-transform hover:scale-110 duration-300">
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xl"
        style={{ filter: 'drop-shadow(0 0 10px rgba(139, 131, 255, 0.3))' }}
      >
        <defs>
          <linearGradient id="robotGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8B83FF" />
            <stop offset="100%" stopColor="#6B63FF" />
          </linearGradient>
          <linearGradient id="bookGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#8B83FF" />
          </linearGradient>
        </defs>

        <g className="robot-body">
          <rect
            x="60"
            y="50"
            width="80"
            height="90"
            rx="15"
            fill="url(#robotGradient)"
            stroke="#E0DEFF"
            strokeWidth="3"
          />

          <circle cx="85" cy="75" r="8" fill="white" className="robot-eye-left">
            <animate
              attributeName="ry"
              values="8;1;8"
              dur="3s"
              repeatCount="indefinite"
              begin="2s"
            />
          </circle>
          <circle cx="85" cy="75" r="4" fill="#4A42C7" className="robot-pupil-left" />

          <circle cx="115" cy="75" r="8" fill="white" className="robot-eye-right">
            <animate
              attributeName="ry"
              values="8;1;8"
              dur="3s"
              repeatCount="indefinite"
              begin="2s"
            />
          </circle>
          <circle cx="115" cy="75" r="4" fill="#4A42C7" className="robot-pupil-right" />

          <path
            d="M 85 95 Q 100 105 115 95"
            stroke="#4A42C7"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />

          <rect x="75" y="30" width="8" height="20" rx="4" fill="#6B63FF" />
          <circle cx="79" cy="25" r="5" fill="#A78BFA" />

          <rect x="50" y="80" width="15" height="40" rx="8" fill="url(#robotGradient)" />
          <rect x="135" y="80" width="15" height="40" rx="8" fill="url(#robotGradient)" />
        </g>

        <g className="book-group animate-book-read" transform="translate(70, 140)">
          <rect
            x="0"
            y="0"
            width="60"
            height="45"
            rx="3"
            fill="url(#bookGradient)"
            stroke="#E0DEFF"
            strokeWidth="2"
          />
          <line x1="30" y1="0" x2="30" y2="45" stroke="#E0DEFF" strokeWidth="2" />
          <line x1="10" y1="15" x2="22" y2="15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="10" y1="22" x2="22" y2="22" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="10" y1="29" x2="22" y2="29" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="38" y1="15" x2="50" y2="15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="38" y1="22" x2="50" y2="22" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="38" y1="29" x2="50" y2="29" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        <g className="magnifier-group animate-magnifier-scan">
          <circle cx="30" cy="165" r="18" fill="rgba(255,255,255,0.2)" stroke="#FFD700" strokeWidth="3" />
          <circle cx="30" cy="165" r="12" fill="rgba(255,255,255,0.4)" />
          <line x1="42" y1="177" x2="52" y2="187" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
        </g>

        <circle cx="100" cy="50" r="30" fill="rgba(139,131,255,0.1)">
          <animate attributeName="r" values="30;35;30" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.1;0.2;0.1" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}
