import React from 'react';

export interface LeafParticle {
  id: number;
  startX: number;
  startY: number;
  driftX: number;
  delay: number;
  color: string;
  size: number;
  rotate: number;
}

interface TreeHoleAnimationViewProps {
  isShaking: boolean;
  fallingLeaves: LeafParticle[];
  statusBadge?: string;
  height?: number | string;
  style?: React.CSSProperties;
}

export const TreeHoleAnimationView: React.FC<TreeHoleAnimationViewProps> = ({
  isShaking,
  fallingLeaves,
  statusBadge = '🌳 Tree Hole Decompression: Tension Absorbed',
  height = '185px',
  style
}) => {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        background: 'linear-gradient(180deg, #F0FDF4 0%, #DCFCE7 60%, #FEF9C3 100%)',
        borderRadius: '22px',
        border: '1.5px solid rgba(187, 247, 208, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 8px rgba(34, 197, 94, 0.06)',
        ...style
      }}
    >
      {/* Falling Leaves Originating from Tree Canopy */}
      {fallingLeaves.map((leaf) => (
        <div
          key={leaf.id}
          style={{
            position: 'absolute',
            left: `${leaf.startX}%`,
            top: `${leaf.startY}px`,
            fontSize: `${leaf.size}px`,
            color: leaf.color,
            pointerEvents: 'none',
            animation: `flutterFall 3.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${leaf.delay}s forwards`,
            transform: `rotate(${leaf.rotate}deg)`,
            zIndex: 10,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
          }}
        >
          🍃
        </div>
      ))}

      {/* Tree SVG with Shake Animation */}
      <svg
        width="220"
        height="175"
        viewBox="0 0 240 200"
        style={{
          animation: isShaking ? 'treeShake 0.4s ease infinite alternate' : 'none',
          transformOrigin: 'bottom center',
          transition: 'transform 0.15s ease'
        }}
      >
        {/* Grassy ground mound */}
        <ellipse cx="120" cy="188" rx="85" ry="12" fill="#86EFAC" />
        <ellipse cx="120" cy="190" rx="70" ry="8" fill="#4ADE80" />

        {/* Tree Trunk & Branches */}
        <path
          d="M108 185 C108 150, 95 125, 85 95 C95 105, 115 110, 120 85 C125 110, 145 105, 155 95 C145 125, 132 150, 132 185 Z"
          fill="#854D0E"
        />

        {/* Hollow Tree Hole for emotional venting */}
        <ellipse cx="120" cy="150" rx="11" ry="16" fill="#422006" />
        <ellipse cx="120" cy="150" rx="7" ry="11" fill="#1C1917" />
        <ellipse cx="120" cy="148" rx="3" ry="5" fill="#FDE047" opacity="0.35" />

        {/* Foliage Puffs (Lush Pastel Green Canopy) */}
        <circle cx="85" cy="80" r="38" fill="#4ADE80" opacity="0.9" />
        <circle cx="155" cy="80" r="38" fill="#4ADE80" opacity="0.9" />
        <circle cx="120" cy="55" r="42" fill="#86EFAC" opacity="0.95" />
        <circle cx="95" cy="50" r="32" fill="#22C55E" opacity="0.85" />
        <circle cx="145" cy="50" r="32" fill="#22C55E" opacity="0.85" />
        <circle cx="120" cy="35" r="28" fill="#BBF7D0" />

        {/* Blossom & stress release sparkles in foliage */}
        <circle cx="90" cy="65" r="3.5" fill="#FDE047" />
        <circle cx="150" cy="65" r="3.5" fill="#F472B6" />
        <circle cx="120" cy="45" r="4" fill="#C084FC" />
        <circle cx="135" cy="75" r="3" fill="#FBCFE8" />
        <circle cx="105" cy="72" r="3" fill="#FEF08A" />
      </svg>

      {/* Tree Hole Hollow Marker Badge */}
      {statusBadge && (
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '3px 12px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 800,
            color: isShaking ? '#DC2626' : '#166534',
            border: isShaking ? '1px solid rgba(254, 202, 202, 0.9)' : '1px solid rgba(187, 247, 208, 0.8)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            zIndex: 12
          }}
        >
          {statusBadge}
        </div>
      )}

      {/* Embedded CSS keyframes for unified animation */}
      <style>{`
        @keyframes treeShake {
          0% { transform: rotate(-2.5deg) scale(1.02); }
          50% { transform: rotate(2.5deg) scale(1.03); }
          100% { transform: rotate(-1.5deg) scale(1.02); }
        }
        @keyframes flutterFall {
          0% {
            opacity: 1;
            transform: translateY(0px) rotate(0deg) scale(1);
          }
          50% {
            opacity: 0.9;
            transform: translateY(60px) translateX(25px) rotate(180deg) scale(1.05);
          }
          100% {
            opacity: 0;
            transform: translateY(135px) translateX(-20px) rotate(360deg) scale(0.85);
          }
        }
      `}</style>
    </div>
  );
};
