interface FujiMountainImageProps {
  variant: 'logo' | 'background-far' | 'background-near';
  className?: string;
  style?: React.CSSProperties;
}

export default function FujiMountainImage({ variant, className = '', style = {} }: FujiMountainImageProps) {
  const imageConfigs = {
    'logo': {
      src: 'https://images.pexels.com/photos/1710795/pexels-photo-1710795.jpeg',
      alt: 'Mount Fuji silhouette with snow cap',
      sizes: '(max-width: 768px) 200px, 400px',
    },
    'background-far': {
      src: 'https://images.pexels.com/photos/3408354/pexels-photo-3408354.jpeg',
      alt: 'Mount Fuji distant view with atmospheric perspective',
      sizes: '(max-width: 768px) 100vw, 1200px',
    },
    'background-near': {
      src: 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg',
      alt: 'Mount Fuji detailed view with snow-covered peak',
      sizes: '(max-width: 768px) 100vw, 1200px',
    },
  };

  const config = imageConfigs[variant];

  return (
    <img
      src={config.src}
      alt={config.alt}
      sizes={config.sizes}
      className={`object-contain ${className}`}
      style={{
        ...style,
        imageRendering: 'high-quality',
      }}
      loading="lazy"
      decoding="async"
    />
  );
}
