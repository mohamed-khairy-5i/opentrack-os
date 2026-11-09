import React from "react";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  glow?: boolean;
}

export function OpenTrackLogo({ size = 32, glow = true, className = "", ...props }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
      {...props}
    >
      <defs>
        {/* Neon Gradient Blue to Indigo */}
        <linearGradient id="ot-primary-grad" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>

        {/* Ambient Halo */}
        <linearGradient id="ot-halo-grad" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
        </linearGradient>

        {glow && (
          <filter id="ot-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}
      </defs>

      {/* Radar Target Outer Ring */}
      <circle
        cx="50"
        cy="50"
        r="44"
        stroke="url(#ot-primary-grad)"
        strokeWidth="2.5"
        strokeDasharray="4 6"
        opacity="0.45"
      />

      {/* Solid Orbit Ring */}
      <circle
        cx="50"
        cy="50"
        r="36"
        stroke="url(#ot-primary-grad)"
        strokeWidth="1.5"
        opacity="0.7"
      />

      {/* Four Precision Ticks (N, S, E, W) */}
      <line x1="50" y1="4" x2="50" y2="12" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="50" y1="88" x2="50" y2="96" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="4" y1="50" x2="12" y2="50" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="88" y1="50" x2="96" y2="50" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" />

      {/* Core Dynamic Navigation Delta Arrow */}
      <g filter={glow ? "url(#ot-glow)" : undefined}>
        <path
          d="M50 18L76 74L50 62L24 74L50 18Z"
          fill="url(#ot-primary-grad)"
        />
        {/* Inner Highlight Wing */}
        <path
          d="M50 24L70 70L50 60L50 24Z"
          fill="#ffffff"
          fillOpacity="0.28"
        />
        {/* Precision Central Navigation Point */}
        <circle cx="50" cy="52" r="3.5" fill="#ffffff" />
      </g>
    </svg>
  );
}
