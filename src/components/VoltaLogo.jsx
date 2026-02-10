import React from 'react';

const VoltaLogo = ({ size = 24, color = '#39FF88', className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Minimalist lightning bolt - inspired by electric/voltage symbol */}
      <path
        d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
        fill={color}
        stroke={color}
        strokeWidth="0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Optional glow effect for neon aesthetic */}
      <path
        d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
        fill="none"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
        style={{
          filter: `drop-shadow(0 0 4px ${color})`,
        }}
      />
    </svg>
  );
};

export default VoltaLogo;