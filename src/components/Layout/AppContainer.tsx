import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Navbar } from '../Navigation/Navbar';
import { AppHeader } from './AppHeader';
import { HomeView } from '../../views/HomeView';
import { StressWorkloadMapView } from '../../views/StressWorkloadMapView';
import { AiDumpChatView } from '../../views/AiDumpChatView';
import { WorkloadDetailsView } from '../../views/WorkloadDetailsView';
import { BalanceView } from '../../views/BalanceView';
import { TreeView } from '../../views/TreeView';

import { DailyCheckInModal } from '../CheckIn/DailyCheckInModal';
import { WorkloadDetailModal } from '../Workload/WorkloadDetailModal';
import { AddWorkloadModal } from '../Workload/AddWorkloadModal';
import { TreeHoleModal } from '../Recovery/TreeHoleModal';
import { ColourReflectionModal } from '../Recovery/ColourReflectionModal';
import { FloatingSquirrelAssistant } from '../Assistant/FloatingSquirrelAssistant';

import { Colors } from '../../theme/colors';
import { Smartphone, Monitor } from 'lucide-react';

export const AppContainer: React.FC = () => {
  const { activeTab } = useApp();
  const [isDesktopFrame, setIsDesktopFrame] = useState(true);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <TreeView />;
      case 'map':
        return <StressWorkloadMapView />;
      case 'chat':
        return <AiDumpChatView />;
      case 'workloads':
        return <WorkloadDetailsView />;
      case 'balance':
        return <BalanceView />;
      case 'tree':
        return <TreeView />;
      default:
        return <TreeView />;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F5F6FD',
      backgroundImage: 'radial-gradient(circle at 15% 15%, rgba(221, 214, 254, 0.5) 0%, transparent 50%), radial-gradient(circle at 85% 15%, rgba(186, 230, 253, 0.45) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(254, 215, 170, 0.35) 0%, transparent 50%), radial-gradient(circle at 20% 85%, rgba(252, 231, 243, 0.4) 0%, transparent 50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isDesktopFrame ? '20px 10px' : 0,
      fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Frame Mode Toggle for Desktop Previewers */}
      <div style={{
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(16px)',
        padding: '6px 14px',
        borderRadius: '20px',
        boxShadow: '0 4px 16px rgba(255, 138, 80, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.95)',
        fontSize: '12px',
        color: Colors.textMedium,
      }}>
        <span style={{ fontWeight: 600 }}>App View Frame:</span>
        <button
          onClick={() => setIsDesktopFrame(true)}
          style={{
            border: isDesktopFrame ? '1px solid rgba(187, 247, 208, 0.9)' : 'none',
            background: isDesktopFrame ? 'linear-gradient(135deg, #DCFCE7 0%, #FEF9C3 100%)' : 'transparent',
            color: isDesktopFrame ? '#166534' : Colors.textMuted,
            padding: '4px 10px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: isDesktopFrame ? '0 2px 8px rgba(187, 247, 208, 0.35)' : 'none',
          }}
        >
          <Smartphone size={14} /> iPhone 16 (393×852)
        </button>
        <button
          onClick={() => setIsDesktopFrame(false)}
          style={{
            border: !isDesktopFrame ? '1px solid rgba(187, 247, 208, 0.9)' : 'none',
            background: !isDesktopFrame ? 'linear-gradient(135deg, #DCFCE7 0%, #FEF9C3 100%)' : 'transparent',
            color: !isDesktopFrame ? '#166534' : Colors.textMuted,
            padding: '4px 10px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: !isDesktopFrame ? '0 2px 8px rgba(187, 247, 208, 0.35)' : 'none',
          }}
        >
          <Monitor size={14} /> Full Width
        </button>
      </div>

      {/* Main App Container Shell (Fixed identical dimensions across all views) */}
      <div id="app-shell" style={{
        width: '100%',
        maxWidth: isDesktopFrame ? '393px' : '100%',
        height: isDesktopFrame ? '852px' : '100vh',
        maxHeight: isDesktopFrame ? '852px' : '100vh',
        backgroundColor: '#F7F8FE',
        backgroundImage: 'radial-gradient(circle at 10% 12%, rgba(221, 214, 254, 0.45) 0%, transparent 45%), radial-gradient(circle at 90% 18%, rgba(186, 230, 253, 0.42) 0%, transparent 45%), radial-gradient(circle at 80% 75%, rgba(254, 215, 170, 0.3) 0%, transparent 45%), radial-gradient(circle at 15% 85%, rgba(252, 231, 243, 0.35) 0%, transparent 48%)',
        borderRadius: isDesktopFrame ? '44px' : '0px',
        overflow: 'hidden',
        boxShadow: isDesktopFrame ? '0 24px 70px rgba(139, 92, 246, 0.15), 0 0 0 10px rgba(255, 255, 255, 0.85)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        border: isDesktopFrame ? '1.5px solid rgba(255, 255, 255, 0.95)' : 'none',
      }}>
        {activeTab !== 'tree' && activeTab !== 'home' && activeTab !== 'chat' && <AppHeader />}
        
        {/* Scrollable Main View Area with scroll padding for fixed floating navbar */}
        <div className="hide-scrollbar" style={{
          flex: 1,
          overflowY: (activeTab === 'tree' || activeTab === 'home' || activeTab === 'chat') ? 'hidden' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: (activeTab === 'tree' || activeTab === 'home' || activeTab === 'chat') ? '0' : '86px',
        }}>
          {renderActiveView()}
        </div>

        {/* Floating Squirrel Mascot Assistant */}
        {activeTab !== 'tree' && activeTab !== 'home' && activeTab !== 'chat' && (
          <FloatingSquirrelAssistant />
        )}

        <Navbar />

        {/* Floating Modals */}
        <DailyCheckInModal />
        <WorkloadDetailModal />
        <AddWorkloadModal />
        <TreeHoleModal />
        <ColourReflectionModal />
      </div>
    </div>
  );
};
