
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="logo_blue_grad" x1="0" y1="100" x2="100" y2="0" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0ea5e9" />
        <stop offset="0.6" stopColor="#3b82f6" />
        <stop offset="1" stopColor="#1d4ed8" />
      </linearGradient>
      <filter id="logo_glow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Background Grid Elements */}
    <rect x="25" y="25" width="50" height="50" stroke="white" strokeWidth="0.5" strokeOpacity="0.1" />
    <line x1="50" y1="25" x2="50" y2="75" stroke="white" strokeWidth="0.5" strokeOpacity="0.1" />
    <line x1="25" y1="50" x2="75" y2="50" stroke="white" strokeWidth="0.5" strokeOpacity="0.1" />

    {/* Candlesticks */}
    <g filter="url(#logo_glow)">
      {/* Candlestick 1 */}
      <line x1="30" y1="55" x2="30" y2="75" stroke="url(#logo_blue_grad)" strokeWidth="1" strokeOpacity="0.8" />
      <rect x="27.5" y="60" width="5" height="10" fill="url(#logo_blue_grad)" rx="0.5" />
      
      {/* Candlestick 2 */}
      <line x1="42" y1="45" x2="42" y2="65" stroke="url(#logo_blue_grad)" strokeWidth="1" strokeOpacity="0.8" />
      <rect x="39.5" y="50" width="5" height="12" fill="url(#logo_blue_grad)" rx="0.5" />
      
      {/* Candlestick 3 */}
      <line x1="54" y1="35" x2="54" y2="55" stroke="url(#logo_blue_grad)" strokeWidth="1" strokeOpacity="0.8" />
      <rect x="51.5" y="40" width="5" height="10" fill="url(#logo_blue_grad)" rx="0.5" />
      
      {/* Candlestick 4 */}
      <line x1="66" y1="25" x2="66" y2="45" stroke="url(#logo_blue_grad)" strokeWidth="1" strokeOpacity="0.8" />
      <rect x="63.5" y="30" width="5" height="12" fill="url(#logo_blue_grad)" rx="0.5" />
    </g>

    {/* Dynamic Upward Growth Arrow */}
    <path 
      d="M15 80 Q35 75 55 50 T85 15" 
      stroke="url(#logo_blue_grad)" 
      strokeWidth="6" 
      strokeLinecap="round" 
      fill="none" 
      filter="url(#logo_glow)"
    />
    <path 
      d="M78 15 L86 14 L87 22" 
      stroke="url(#logo_blue_grad)" 
      strokeWidth="6" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      fill="none"
      filter="url(#logo_glow)"
    />
  </svg>
);
