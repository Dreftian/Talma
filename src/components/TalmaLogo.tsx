import React from 'react';

interface TalmaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'icon' | 'full' | 'image';
}

export const TalmaLogo: React.FC<TalmaLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'icon',
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16',
  };

  const fullSizeMap = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
    xl: 'h-12',
    '2xl': 'h-16',
  };

  if (variant === 'image') {
    return (
      <img
        src="/logo-talma.png"
        alt="Talma"
        className={`object-contain ${fullSizeMap[size]} ${className}`}
      />
    );
  }

  if (variant === 'icon') {
    return (
      <div className={`relative flex items-center justify-center select-none ${sizeMap[size]} ${className}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Green accent bar on top of the T (matching user's logo) */}
          <path
            d="M 28 12 L 86 12 C 90 12 92 14 90 18 L 84 32 C 82 35 79 36 75 36 L 22 36 C 18 36 17 33 19 29 L 24 16 C 25 13 26 12 28 12 Z"
            fill="#5cb826"
          />
          {/* Main White T letter italic bold */}
          <path
            d="M 12 36 L 46 36 L 35 90 C 34 94 30 96 24 96 L 10 96 C 5 96 2 92 4 87 L 15 36 Z"
            fill="#ffffff"
          />
          <path
            d="M 44 36 L 82 36 L 79 48 L 41 48 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    );
  }

  // Full wordmark SVG with exact stylized italic font & green bar
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <img
        src="/logo-talma.png"
        alt="Talma"
        className={`object-contain rounded-md ${fullSizeMap[size]}`}
      />
    </div>
  );
};
