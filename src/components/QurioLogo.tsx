import React from 'react';

interface QurioLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  className?: string;
  variant?: 'light' | 'dark';
}

export const QurioLogo: React.FC<QurioLogoProps> = ({
  size = 'md',
  showTagline = false,
  showBadge = false,
  badgeText = 'Your Smart Study Buddy',
  className = '',
  variant = 'light',
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const markSize = isSm ? 'w-7 h-7' : isLg ? 'w-10 h-10' : 'w-8 h-8';
  const titleSize = isSm ? 'text-sm' : isLg ? 'text-xl' : 'text-base';
  const textColor = variant === 'dark' ? 'text-white' : 'text-[#25344B]';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Friendly Modern Logo Mark */}
      <div
        className={`${markSize} rounded-xl bg-[#397DE0] flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden group`}
        style={{
          boxShadow: '0 2px 8px -1px rgba(57, 125, 224, 0.35)',
        }}
      >
        {/* Subtle Inner Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#2e68bf] to-[#5ea1f9] opacity-90" />
        
        {/* Playful Curiosity Sparkle in the top-right corner */}
        <div 
          className="absolute -top-1 -right-1 w-3 h-3 bg-[#FFD66B] rounded-full blur-[1px] opacity-80" 
          title="Curiosity Spark"
        />

        {/* Stylized Modern Q Icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 relative z-10 text-white"
        >
          {/* Main Q Loop */}
          <circle
            cx="11.5"
            cy="11.5"
            r="6.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Friendly Q Sparkle Tail */}
          <path
            d="M16 16L19 19"
            stroke="#FFD66B"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          {/* Curiosity Center Dot */}
          <circle cx="11.5" cy="11.5" r="2" fill="#FFD66B" />
        </svg>
      </div>

      {/* Typography Hierarchy */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-extrabold ${titleSize} ${textColor} tracking-tight font-sans`}>
            Qurio
          </span>
          {showBadge && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ebf3fd] text-[#397DE0] border border-[#A9D8FF]/70">
              {badgeText}
            </span>
          )}
        </div>
        {showTagline && (
          <span className="text-[11px] font-medium text-[#7487a3] tracking-normal -mt-0.5">
            Your Smart Study Buddy
          </span>
        )}
      </div>
    </div>
  );
};
