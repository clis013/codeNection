import React from 'react';
import { Colors } from '../../theme/colors';

export const AppHeader: React.FC = () => {
  return (
    <div style={{
      padding: '20px 20px 8px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Left: Avatar with warm sunset glass glow + Nicole greeting */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFB088 0%, #FF8A50 50%, #FF6B6B 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '17px',
          fontWeight: 800,
          color: '#FFFFFF',
          boxShadow: '0 6px 18px rgba(255, 138, 80, 0.35)',
          border: '2px solid rgba(255, 255, 255, 0.95)'
        }}>
          N
        </div>

        <div>
          <span style={{ fontSize: '12px', color: Colors.textMuted, fontWeight: 500, letterSpacing: '0.2px' }}>
            Good Day,
          </span>
          <h1 style={{
            fontSize: '20px',
            fontWeight: 800,
            color: Colors.textDark,
            letterSpacing: '-0.4px',
            lineHeight: 1.15
          }}>
            Hi Nicole
          </h1>
        </div>
      </div>

      {/* Right: Date badge ('Today, 05 Sep') */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1.5px solid rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '6px 14px',
        fontSize: '12px',
        fontWeight: 700,
        color: Colors.textDark,
        boxShadow: '0 2px 10px rgba(255, 138, 80, 0.06)'
      }}>
        <span>Today, 05 Sep</span>
      </div>
    </div>
  );
};
