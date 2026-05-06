import React from 'react';

// Full-figure SVG illustrations — the node IS the figure, not a colored block with an icon
export function NodeFigure({ label, color, w, h }: { label: string; color: string; w: number; h: number }) {
  const key = label.toLowerCase().replace(/[\s\/]+/g, '');
  const s = Math.min(w, h) * 0.85; // figure size
  const glowStyle = { filter: `drop-shadow(0 0 20px ${color}40) drop-shadow(0 0 40px ${color}20)` };

  switch (key) {
    case 'cell':
      return (
        <svg width={s} height={s} viewBox="0 0 80 80" fill="none" style={glowStyle}>
          <ellipse cx="40" cy="40" rx="36" ry="30" stroke={color} strokeWidth="2.5" fill={`${color}08`} />
          <ellipse cx="40" cy="40" rx="36" ry="30" stroke={color} strokeWidth="1" strokeDasharray="4 3" opacity="0.2" />
          <ellipse cx="40" cy="38" rx="14" ry="12" fill={`${color}15`} stroke={color} strokeWidth="1.5" />
          <circle cx="40" cy="36" r="4" fill={color} opacity="0.4" />
          <circle cx="28" cy="52" r="3" fill={color} opacity="0.1" />
          <circle cx="54" cy="30" r="2.5" fill={color} opacity="0.1" />
        </svg>
      );

    case 'dnahelix':
      return (
        <svg width={s * 0.6} height={s} viewBox="0 0 50 90" fill="none" style={glowStyle}>
          <path d="M12 5 C6 18 6 25 18 35 C30 45 30 55 18 65 C6 75 6 80 12 88" stroke={color} strokeWidth="2.8" strokeLinecap="round" />
          <path d="M38 5 C44 18 44 25 32 35 C20 45 20 55 32 65 C44 75 44 80 38 88" stroke={color} strokeWidth="2.8" strokeLinecap="round" />
          <line x1="14" y1="12" x2="36" y2="12" stroke={color} strokeWidth="1.5" opacity="0.3" />
          <line x1="10" y1="22" x2="40" y2="22" stroke={color} strokeWidth="1.5" opacity="0.3" />
          <line x1="18" y1="35" x2="32" y2="35" stroke={color} strokeWidth="1.5" opacity="0.3" />
          <line x1="14" y1="80" x2="36" y2="80" stroke={color} strokeWidth="1.5" opacity="0.3" />
          <circle cx="12" cy="12" r="2.5" fill={color} opacity="0.6" />
          <circle cx="36" cy="12" r="2.5" fill={color} opacity="0.4" />
        </svg>
      );

    case 'protein':
      return (
        <svg width={s} height={s * 0.7} viewBox="0 0 90 60" fill="none" style={glowStyle}>
          <path d="M8 45 Q14 10 25 30 Q36 50 42 20 Q48 -5 58 28 Q68 55 78 15" stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <circle cx="8" cy="45" r="4" fill={color} opacity="0.6" />
          <circle cx="78" cy="15" r="4" fill={color} opacity="0.6" />
        </svg>
      );

    case 'virus':
      return (
        <svg width={s} height={s} viewBox="0 0 80 80" fill="none" style={glowStyle}>
          <circle cx="40" cy="40" r="18" fill={`${color}08`} stroke={color} strokeWidth="2" />
          <circle cx="40" cy="40" r="8" fill={`${color}12`} stroke={color} strokeWidth="1" />
          {[0, 60, 120, 180, 240, 300].map(deg => {
            const r = (deg * Math.PI) / 180;
            const ix = 40 + 18 * Math.cos(r), iy = 40 + 18 * Math.sin(r);
            const ox = 40 + 30 * Math.cos(r), oy = 40 + 30 * Math.sin(r);
            return <g key={deg}>
              <line x1={ix} y1={iy} x2={ox} y2={oy} stroke={color} strokeWidth="1.8" />
              <circle cx={ox} cy={oy} r="3" fill={color} opacity="0.6" />
            </g>;
          })}
        </svg>
      );

    case 'molecule':
      return (
        <svg width={s} height={s} viewBox="0 0 80 80" fill="none" style={glowStyle}>
          <line x1="40" y1="24" x2="22" y2="48" stroke={color} strokeWidth="2.5" />
          <line x1="40" y1="24" x2="58" y2="48" stroke={color} strokeWidth="2.5" />
          <line x1="22" y1="48" x2="58" y2="48" stroke={color} strokeWidth="2.5" />
          <circle cx="40" cy="24" r="7" fill="white" stroke={color} strokeWidth="2" />
          <circle cx="22" cy="48" r="6" fill="white" stroke={color} strokeWidth="2" />
          <circle cx="58" cy="48" r="6" fill="white" stroke={color} strokeWidth="2" />
          <text x="37" y="27" fill={color} fontSize="7" fontWeight="bold" fontFamily="sans-serif">C</text>
        </svg>
      );

    case 'rxnarrow':
      return (
        <svg width={s} height={s * 0.4} viewBox="0 0 100 40" fill="none" style={glowStyle}>
          <line x1="5" y1="20" x2="95" y2="20" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="90,12 100,20 90,28" fill={color} />
          <text x="50" y="14" fill={color} fontSize="8" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">k1</text>
        </svg>
      );

    case 'spectrograph':
      return (
        <svg width={s} height={s * 0.6} viewBox="0 0 100 60" fill="none" style={glowStyle}>
          <polyline points="0,50 15,50 25,10 35,50 45,50 55,20 65,50 80,50 90,5 100,50" stroke={color} strokeWidth="2.5" strokeLinejoin="round" fill="none" />
          <line x1="0" y1="55" x2="100" y2="55" stroke={color} strokeWidth="1" opacity="0.3" />
        </svg>
      );

    case 'barriers':
      return (
        <svg width={s} height={s * 0.6} viewBox="0 0 100 60" fill="none" style={glowStyle}>
          <rect x="10" y="10" width="80" height="40" rx="4" stroke={color} strokeWidth="2.5" fill={`${color}08`} />
          <line x1="10" y1="25" x2="90" y2="25" stroke={color} strokeWidth="1" opacity="0.3" />
          <line x1="10" y1="35" x2="90" y2="35" stroke={color} strokeWidth="1" opacity="0.3" />
          <circle cx="30" cy="30" r="6" fill={color} opacity="0.5" />
          <circle cx="70" cy="30" r="6" fill={color} opacity="0.5" />
        </svg>
      );

    case 'microscope':
      return (
        <svg width={s} height={s} viewBox="0 0 80 80" fill="none" style={glowStyle}>
          <path d="M20 70 L60 70 M40 70 L40 50 M40 50 L20 30 Q15 20 30 15 L50 35" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="35" cy="25" r="4" fill={color} opacity="0.6" />
        </svg>
      );

    case 'petridish':
      return (
        <svg width={s} height={s} viewBox="0 0 80 80" fill="none" style={glowStyle}>
          <circle cx="40" cy="40" r="35" stroke={color} strokeWidth="2" fill={`${color}05`} />
          <circle cx="40" cy="40" r="32" stroke={color} strokeWidth="0.8" strokeDasharray="3 3" opacity="0.3" />
          <path d="M30 35 Q35 30 40 35 T50 35" stroke={color} strokeWidth="1.5" opacity="0.6" />
          <circle cx="32" cy="45" r="2" fill={color} opacity="0.4" />
          <circle cx="48" cy="48" r="2.5" fill={color} opacity="0.4" />
        </svg>
      );

    case 'lightbeam':
      return (
        <svg width={s} height={s * 0.4} viewBox="0 0 100 40" fill="none" style={glowStyle}>
          <path d="M5 20 L40 20 L60 5 L95 35" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M40 20 L60 35 L95 5" stroke={color} strokeWidth="1.5" opacity="0.4" strokeDasharray="4 4" />
          <rect x="38" y="12" width="4" height="16" fill={color} />
        </svg>
      );

    case 'neuron':
      return (
        <svg width={s} height={s} viewBox="0 0 80 80" fill="none" style={glowStyle}>
          <circle cx="25" cy="40" r="10" stroke={color} strokeWidth="2.5" fill={`${color}10`} />
          <line x1="35" y1="40" x2="75" y2="40" stroke={color} strokeWidth="3" strokeLinecap="round" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
            const r = (deg * Math.PI) / 180;
            const x = 25 + 10 * Math.cos(r), y = 40 + 10 * Math.sin(r);
            const ox = 25 + 18 * Math.cos(r), oy = 40 + 18 * Math.sin(r);
            return <line key={deg} x1={x} y1={y} x2={ox} y2={oy} stroke={color} strokeWidth="1.5" opacity="0.6" />;
          })}
        </svg>
      );

    default:
      return (
        <svg width={s} height={s} viewBox="0 0 80 80" fill="none" style={glowStyle}>
          <rect x="15" y="15" width="50" height="50" rx="8" stroke={color} strokeWidth="2.5" fill={`${color}08`} />
          <path d="M30 40 L50 40 M40 30 L40 50" stroke={color} strokeWidth="2" opacity="0.4" />
        </svg>
      );
  }
}
