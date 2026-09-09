import React from 'react';
import { useApp } from '../../context/AppContext';
import { Colors } from '../../theme/colors';
import { Home, BarChart2, Scale, MessageSquare, CheckSquare } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  return (
    <div style={{
      position: 'absolute',
      bottom: '16px',
      left: '16px',
      right: '16px',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.35) 100%)',
      backdropFilter: 'blur(20px) saturate(160%)',
      WebkitBackdropFilter: 'blur(20px) saturate(160%)',
      borderRadius: '40px',
      padding: '8px 6px',
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      alignItems: 'center',
      justifyItems: 'center',
      boxShadow: '0 16px 40px rgba(31, 38, 135, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
      border: '1.5px solid rgba(255, 255, 255, 0.72)',
      zIndex: 100,
    }}>
      {/* 1. Home */}
      <button
        onClick={() => setActiveTab('home')}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          cursor: 'pointer',
          padding: '4px 0',
          color: activeTab === 'home' ? Colors.peachText : Colors.textMuted,
        }}
      >
        <div style={{
          width: '26px',
          height: '26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Home size={22} strokeWidth={activeTab === 'home' ? 2.5 : 1.8} />
        </div>
        <span style={{
          fontSize: '11px',
          fontWeight: activeTab === 'home' ? 800 : 500,
          color: activeTab === 'home' ? Colors.peachText : Colors.textMuted,
          lineHeight: 1,
        }}>
          Home
        </span>
      </button>

      {/* 2. Activity */}
      <button
        onClick={() => setActiveTab('map')}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          cursor: 'pointer',
          padding: '4px 0',
          color: activeTab === 'map' ? Colors.peachText : Colors.textMuted,
        }}
      >
        <div style={{
          width: '26px',
          height: '26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <BarChart2 size={22} strokeWidth={activeTab === 'map' ? 2.5 : 1.8} />
        </div>
        <span style={{
          fontSize: '11px',
          fontWeight: activeTab === 'map' ? 800 : 500,
          color: activeTab === 'map' ? Colors.peachText : Colors.textMuted,
          lineHeight: 1,
        }}>
          Map
        </span>
      </button>

      {/* 3. Center Chat Floating Button */}
      <button
        onClick={() => setActiveTab('chat')}
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #DCFCE7 0%, #FEF9C3 100%)',
          border: '3px solid #FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(187, 247, 208, 0.5), 0 4px 12px rgba(254, 249, 195, 0.4)',
          marginTop: '-22px',
          color: '#166534',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
        title="AI Stress Dump Chat"
      >
        <MessageSquare size={22} fill="#166534" color="#166534" />
      </button>

      {/* 4. Workload / Tasks */}
      <button
        onClick={() => setActiveTab('workloads')}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          cursor: 'pointer',
          padding: '4px 0',
          color: activeTab === 'workloads' ? Colors.peachText : Colors.textMuted,
        }}
      >
        <div style={{
          width: '26px',
          height: '26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <CheckSquare size={22} strokeWidth={activeTab === 'workloads' ? 2.5 : 1.8} />
        </div>
        <span style={{
          fontSize: '11px',
          fontWeight: activeTab === 'workloads' ? 800 : 500,
          color: activeTab === 'workloads' ? Colors.peachText : Colors.textMuted,
          lineHeight: 1,
        }}>
          Workload
        </span>
      </button>

      {/* 5. Balance */}
      <button
        onClick={() => setActiveTab('balance')}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          cursor: 'pointer',
          padding: '4px 0',
          color: activeTab === 'balance' ? Colors.peachText : Colors.textMuted,
        }}
      >
        <div style={{
          width: '26px',
          height: '26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Scale size={22} strokeWidth={activeTab === 'balance' ? 2.5 : 1.8} />
        </div>
        <span style={{
          fontSize: '11px',
          fontWeight: activeTab === 'balance' ? 800 : 500,
          color: activeTab === 'balance' ? Colors.peachText : Colors.textMuted,
          lineHeight: 1,
        }}>
          Balance
        </span>
      </button>
    </div>
  );
};
