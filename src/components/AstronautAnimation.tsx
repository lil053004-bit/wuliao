export default function AstronautAnimation() {
  return (
    <div className="w-32 h-32 sm:w-40 sm:h-40 animate-astronaut-float">
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xl"
      >
        <defs>
          <linearGradient id="astronautGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E0E7FF" />
            <stop offset="100%" stopColor="#C7D2FE" />
          </linearGradient>
          <linearGradient id="helmetGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#DBEAFE" />
            <stop offset="100%" stopColor="#93C5FD" />
          </linearGradient>
          <radialGradient id="visorGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.8" />
          </radialGradient>
        </defs>

        <ellipse cx="100" cy="180" rx="40" ry="8" fill="#1E293B" opacity="0.2">
          <animate attributeName="rx" values="40;45;40" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;0.15;0.2" dur="3s" repeatCount="indefinite" />
        </ellipse>

        <g className="astronaut-body">
          <rect x="70" y="90" width="60" height="70" rx="10" fill="url(#astronautGradient)" stroke="#6366F1" strokeWidth="2" />

          <rect x="55" y="100" width="20" height="50" rx="10" fill="url(#astronautGradient)" stroke="#6366F1" strokeWidth="2" />
          <rect x="125" y="100" width="20" height="50" rx="10" fill="url(#astronautGradient)" stroke="#6366F1" strokeWidth="2">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 135 100; -5 135 100; 0 135 100"
              dur="2s"
              repeatCount="indefinite"
            />
          </rect>

          <rect x="75" y="155" width="20" height="35" rx="8" fill="url(#astronautGradient)" stroke="#6366F1" strokeWidth="2" />
          <rect x="105" y="155" width="20" height="35" rx="8" fill="url(#astronautGradient)" stroke="#6366F1" strokeWidth="2" />

          <circle cx="85" cy="190" r="8" fill="#475569" />
          <circle cx="115" cy="190" r="8" fill="#475569" />

          <circle cx="100" cy="60" r="35" fill="url(#helmetGradient)" stroke="#6366F1" strokeWidth="3" />

          <ellipse cx="100" cy="60" rx="25" ry="20" fill="url(#visorGradient)">
            <animate attributeName="opacity" values="0.9;0.7;0.9" dur="4s" repeatCount="indefinite" />
          </ellipse>

          <circle cx="90" cy="55" r="3" fill="white" opacity="0.8" />
          <circle cx="95" cy="50" r="2" fill="white" opacity="0.6" />

          <rect x="95" y="25" width="10" height="8" rx="2" fill="#EF4444" />
          <circle cx="100" cy="22" r="3" fill="#FCA5A5" />

          <path d="M 75 110 L 70 120 L 75 120" fill="none" stroke="#6366F1" strokeWidth="2" />
          <path d="M 125 110 L 130 120 L 125 120" fill="none" stroke="#6366F1" strokeWidth="2" />

          <circle cx="85" cy="125" r="4" fill="#8B5CF6" opacity="0.6" />
          <circle cx="115" cy="125" r="4" fill="#8B5CF6" opacity="0.6" />
        </g>

        <g className="stars" opacity="0.6">
          <circle cx="30" cy="30" r="2" fill="#FDE047">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="170" cy="50" r="1.5" fill="#FDE047">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" begin="0.5s" />
          </circle>
          <circle cx="160" cy="150" r="2" fill="#FDE047">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2.5s" repeatCount="indefinite" begin="1s" />
          </circle>
        </g>
      </svg>
    </div>
  );
}
