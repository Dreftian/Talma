import React from 'react';

interface TalmaLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'icon' | 'full' | 'image' | 'avatar';
}

export const TalmaLogo: React.FC<TalmaLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'icon',
}) => {
  const sizeMap = {
    xs: 'w-5 h-5',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16',
  };

  const fullHeightMap = {
    xs: 'h-5',
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
    xl: 'h-12',
    '2xl': 'h-16',
  };

  if (variant === 'image') {
    return (
      <img
        src="/logo-plane.png"
        alt="Talma"
        className={`object-contain ${fullHeightMap[size]} ${className}`}
      />
    );
  }

  if (variant === 'avatar') {
    return (
      <div className={`relative rounded-full overflow-hidden select-none shrink-0 ${sizeMap[size]} ${className}`}>
        <img
          src="/avatar-plane.png"
          alt="Talma Avatar"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Pure SVG Airplane Logo (Aviation brand symbol)
  const AirplaneSvg = (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full drop-shadow-sm select-none"
    >
      <defs>
        <linearGradient id="planeBodyGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1d9bf0" />
          <stop offset="60%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id="speedArcGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1d9bf0" stopOpacity="0" />
          <stop offset="100%" stopColor="#1d9bf0" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Orbital speed arc trail */}
      <path
        d="M 14 82 C 16 54 36 30 64 24 C 76 21 84 25 86 32 C 87 36 84 42 76 46 C 66 52 48 60 28 72"
        stroke="url(#speedArcGrad)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Supersonic Jet taking off (45° flight angle) */}
      <g transform="translate(54, 46) rotate(-45) translate(-50, -50)">
        {/* Fuselage body */}
        <path
          d="M 50 12 C 53 12 55.5 18 55.5 30 L 55 68 C 55 76 53 82 50 84 C 47 82 45 76 45 68 L 44.5 30 C 44.5 18 47 12 50 12 Z"
          fill="url(#planeBodyGrad)"
        />
        {/* Swept Wings */}
        <path
          d="M 50 36 L 88 64 C 91 66 90 68 87 68 L 76 68 L 55 52 L 45 52 L 24 68 L 13 68 C 10 68 9 66 12 64 L 50 36 Z"
          fill="#ffffff"
        />
        {/* Winglets */}
        <path d="M 88 64 L 90 57 L 85 64 Z" fill="#1d9bf0" />
        <path d="M 12 64 L 10 57 L 15 64 Z" fill="#1d9bf0" />
        {/* Underwing Jet Engines */}
        <rect x="62" y="52" width="4.5" height="10" rx="2" fill="#1d9bf0" />
        <rect x="33.5" y="52" width="4.5" height="10" rx="2" fill="#1d9bf0" />
        {/* Tail Fin */}
        <path d="M 50 64 L 52.5 82 L 47.5 82 Z" fill="#1d9bf0" />
        {/* Horizontal Tailplanes */}
        <path
          d="M 50 72 L 68 82 L 64 85 L 50 78 L 36 85 L 32 82 Z"
          fill="#ffffff"
        />
        {/* Cockpit Reflection */}
        <ellipse cx="50" cy="22" rx="2" ry="4" fill="#0b1726" opacity="0.8" />
      </g>
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
        {AirplaneSvg}
      </div>
    );
  }

  // variant === 'full' (Airplane logo + Talma wordmark)
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <div className={`relative flex items-center justify-center shrink-0 ${sizeMap[size]}`}>
        {AirplaneSvg}
      </div>
      <span className="font-black text-xl italic text-white tracking-tighter">
        Talma
      </span>
    </div>
  );
};
