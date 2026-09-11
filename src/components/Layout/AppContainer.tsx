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

  // Per-tab scroll position memory
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const tabScrollPositions = React.useRef<Record<string, number>>({});
  const prevTabRef = React.useRef<string>(activeTab);
  const isRestoringScrollRef = React.useRef<boolean>(false);

  // Handle scroll events to remember position for current tab
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isRestoringScrollRef.current) return;
    const currentTabKey = activeTab === 'home' ? 'tree' : activeTab;
    tabScrollPositions.current[currentTabKey] = e.currentTarget.scrollTop;
  };

  // Restore scroll position when tab changes (or scroll to top if opened for the first time)
  React.useEffect(() => {
    const currentTabKey = activeTab === 'home' ? 'tree' : activeTab;
    const hasVisited = Object.prototype.hasOwnProperty.call(tabScrollPositions.current, currentTabKey);

    prevTabRef.current = activeTab;

    const container = scrollContainerRef.current;
    if (!container) return;

    const targetScroll = hasVisited ? (tabScrollPositions.current[currentTabKey] || 0) : 0;

    if (!hasVisited) {
      tabScrollPositions.current[currentTabKey] = 0;
    }

    isRestoringScrollRef.current = true;
    container.scrollTop = targetScroll;

    // Double-check with rAF and short delay in case subcomponents lay out asynchronously
    const frameId = requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = targetScroll;
      }
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = targetScroll;
        }
        isRestoringScrollRef.current = false;
      }, 50);
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [activeTab]);

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
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="hide-scrollbar"
          style={{
            flex: 1,
            overflowY: (activeTab === 'tree' || activeTab === 'home' || activeTab === 'chat') ? 'hidden' : 'auto',
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: (activeTab === 'tree' || activeTab === 'home' || activeTab === 'chat') ? '0' : '86px',
          }}
        >
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
