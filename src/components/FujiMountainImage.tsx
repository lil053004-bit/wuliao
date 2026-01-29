interface FujiMountainImageProps {
  variant: 'logo' | 'background-far' | 'background-near';
  className?: string;
  style?: React.CSSProperties;
}

export default function FujiMountainImage({ variant, className = '', style = {} }: FujiMountainImageProps) {
  if (variant === 'logo') {
    return (
      <svg viewBox="0 0 300 200" className={className} style={style}>
        <defs>
          <linearGradient id="fujiGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a2b4a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0a1525" stopOpacity="1" />
          </linearGradient>
        </defs>
        <path
          d="M 30 180 L 80 130 L 120 90 L 150 40 L 180 90 L 220 130 L 270 180 Z"
          fill="url(#fujiGradient)"
          opacity="0.85"
        />
        <path
          d="M 120 90 L 135 65 L 150 40 L 165 65 L 180 90 L 175 85 L 160 60 L 150 48 L 140 60 L 125 85 Z"
          fill="#FFFAFA"
          opacity="0.95"
        />
        <path
          d="M 140 75 L 150 55 L 160 75 Z"
          fill="#FFFFFF"
          opacity="0.85"
        />
      </svg>
    );
  }

  if (variant === 'background-far') {
    return (
      <svg viewBox="0 0 800 400" className={className} style={style} preserveAspectRatio="xMidYMax meet">
        <defs>
          <linearGradient id="farMountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2c3e5a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1a2b4a" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <path
          d="M 0 400 L 150 320 L 280 240 L 350 180 L 400 140 L 450 180 L 520 240 L 650 320 L 800 400 Z"
          fill="url(#farMountainGradient)"
        />
        <path
          d="M 320 200 L 360 160 L 400 140 L 440 160 L 480 200 L 465 190 L 425 155 L 400 145 L 375 155 L 335 190 Z"
          fill="#d8e4f0"
          opacity="0.3"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 600 350" className={className} style={style} preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="nearMountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a2b4a" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#0f1e3a" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#050d1a" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <path
        d="M 0 350 L 120 270 L 220 180 L 280 100 L 300 60 L 320 100 L 380 180 L 480 270 L 600 350 Z"
        fill="url(#nearMountainGradient)"
      />
      <path
        d="M 230 140 L 265 105 L 280 80 L 300 60 L 320 80 L 335 105 L 370 140 L 355 130 L 325 95 L 310 75 L 300 68 L 290 75 L 275 95 L 245 130 Z"
        fill="#FFFAFA"
        opacity="0.9"
      />
      <path
        d="M 270 110 L 285 85 L 300 70 L 315 85 L 330 110 L 320 102 L 307 88 L 300 78 L 293 88 L 280 102 Z"
        fill="#FFFFFF"
        opacity="0.95"
      />
    </svg>
  );
}
