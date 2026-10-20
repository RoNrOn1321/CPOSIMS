import React from 'react';

interface AdminComputerIconProps {
  className?: string;
  size?: number;
}

/**
 * AdminComputerIcon: A stylized vector logo depicting a system administrator
 * working on a laptop with an administration gear, rendered in school Gold (#fbbf24)
 * and deep Maroon (#5c1516).
 */
export default function AdminComputerIcon({
  className = 'w-6 h-6',
  size = 24,
}: AdminComputerIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Rich Gold Gradient */}
        <linearGradient id="adminGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Soft Gold Translucent Glow */}
        <linearGradient id="adminGoldSoft" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fde047" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      {/* 1. Background System Administration Gear (Cog wheel behind his shoulder) */}
      <g stroke="url(#adminGoldGrad)" strokeWidth="1.2" opacity="0.75">
        {/* Gear center */}
        <circle cx="23" cy="8.5" r="4.5" fill="none" />
        <circle cx="23" cy="8.5" r="2" fill="#5c1516" stroke="url(#adminGoldGrad)" strokeWidth="1" />
        {/* Gear teeth */}
        <line x1="23" y1="2.6" x2="23" y2="4.2" strokeLinecap="round" strokeWidth="1.5" />
        <line x1="23" y1="12.8" x2="23" y2="14.4" strokeLinecap="round" strokeWidth="1.5" />
        <line x1="17.1" y1="8.5" x2="18.7" y2="8.5" strokeLinecap="round" strokeWidth="1.5" />
        <line x1="27.3" y1="8.5" x2="28.9" y2="8.5" strokeLinecap="round" strokeWidth="1.5" />
        <line x1="18.8" y1="4.3" x2="19.9" y2="5.4" strokeLinecap="round" strokeWidth="1.5" />
        <line x1="26.1" y1="11.6" x2="27.2" y2="12.7" strokeLinecap="round" strokeWidth="1.5" />
        <line x1="18.8" y1="12.7" x2="19.9" y2="11.6" strokeLinecap="round" strokeWidth="1.5" />
        <line x1="26.1" y1="5.4" x2="27.2" y2="4.3" strokeLinecap="round" strokeWidth="1.5" />
      </g>

      {/* 2. Man's Torso & Suit Jacket */}
      <path
        d="M6 26.5 C6 21 9 17.5 13 16.8 L13 19.5 L15 20.5 L17 19.5 L17 16.8 C21 17.5 24 21 24 26.5 Z"
        fill="url(#adminGoldSoft)"
        stroke="url(#adminGoldGrad)"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />

      {/* Collar / Tie detail */}
      <path
        d="M13 17 L15 21 L17 17"
        stroke="url(#adminGoldGrad)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="15" y1="21" x2="15" y2="24" stroke="url(#adminGoldGrad)" strokeWidth="1.2" strokeLinecap="round" />

      {/* 3. Man's Head */}
      {/* Face */}
      <ellipse
        cx="15"
        cy="10.5"
        rx="3.5"
        ry="4"
        fill="#5c1516"
        stroke="url(#adminGoldGrad)"
        strokeWidth="1.3"
      />
      {/* Hair (Sleek side-parted hair matching reference photo) */}
      <path
        d="M11.5 10 C11.3 7 13 5.2 15 5.2 C17.8 5.2 19 7 18.5 10 C17.8 8.2 16.5 7.5 14.5 7.8 C13 8 12 9 11.5 10 Z"
        fill="url(#adminGoldGrad)"
      />

      {/* 4. Laptop in Front of Him */}
      {/* Laptop Screen (angled open) */}
      <path
        d="M9 19.5 H21 L19.8 25.5 H10.2 L9 19.5 Z"
        fill="#5c1516"
        stroke="url(#adminGoldGrad)"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      {/* Glowing screen center / logo dot */}
      <circle cx="15" cy="22.5" r="1" fill="url(#adminGoldGrad)" />

      {/* Laptop Base / Keyboard Desk Surface */}
      <rect
        x="7"
        y="25.5"
        width="16"
        height="1.8"
        rx="0.9"
        fill="url(#adminGoldGrad)"
      />
    </svg>
  );
}
