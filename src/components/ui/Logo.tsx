import React from 'react';

export function Logo({ size = 'md', variant = 'light' }: { size?: 'sm' | 'md' | 'lg'; variant?: 'light' | 'dark' }) {
  const sizes = { sm: 28, md: 36, lg: 48 };
  const h = sizes[size];
  const textColor = variant === 'dark' ? '#E1E8F0' : '#097895';
  const accentColor = '#097895';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, userSelect: 'none' }}>
      {/* Apollo icon */}
      <svg width={h} height={h} viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="20" fill={accentColor} />
        <path d="M12 28L20 12L28 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <line x1="15" y1="23" x2="25" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <circle cx="20" cy="18" r="2" fill="white" />
      </svg>
      {/* Apollo Smart Check-in text */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 800,
          fontSize: h * 0.5,
          color: textColor,
          letterSpacing: '-0.5px',
        }}>
          Apollo
        </span>
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 700,
          fontSize: h * 0.28,
          color: accentColor,
          letterSpacing: '0.3px',
        }}>
          Smart Check-in
        </span>
      </div>
    </div>
  );
}
