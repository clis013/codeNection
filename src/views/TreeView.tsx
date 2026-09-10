import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { WorkloadItem } from '../types/workload';
import { ArrowLeft, Wind, MessageSquare, CheckSquare, Sparkles, ClipboardCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FallingLeaf {
  id: number;
  startX: number;
  startY: number;
  driftX: number;
  delay: number;
  color: string;
  size: number;
  rotate: number;
}

// Positions matching the user's reference photo for apples on the canopy (% relative to 393x852 screen)
const APPLE_COORDINATES = [
  // Apple 1: Top Center (matches reference photo)
  { x: 188, y: 205, rotate: -6 },
  // Apple 2: Mid-Left (matches reference photo)
  { x: 108, y: 295, rotate: 8 },
  // Apple 3: Lower-Right (matches reference photo)
  { x: 260, y: 355, rotate: -8 },
  // Apple 4: Lower-Left/Center (for 4th active workload)
  { x: 155, y: 385, rotate: 5 },
  // Fallback 5: Mid-Right upper
  { x: 220, y: 275, rotate: 4 },
];

export const TreeView: React.FC = () => {
  const {
    setActiveTab,
    workloads,
    setSelectedWorkload,
    setIsWorkloadDetailOpen,
    setChatSource,
    newAppleWorkloadId,
    setNewAppleWorkloadId,
    gardenerHasQuestion,
    setGardenerHasQuestion,
    sendGardenerQuestionToChat,
    todayCheckIn,
    baselineStressAverage,
    capacityProfile,
    setIsCheckInOpen,
    setCheckInSource
  } = useApp();

  const [isTreeShaking, setIsTreeShaking] = useState(false);
  const [fallingLeaves, setFallingLeaves] = useState<FallingLeaf[]>([]);
  const [hoveredApple, setHoveredApple] = useState<{ workload: WorkloadItem; x: number; y: number } | null>(null);
  const [isHoleHovered, setIsHoleHovered] = useState(false);
  const [isGardenerHovered, setIsGardenerHovered] = useState(false);
  const [isSquirrelHovered, setIsSquirrelHovered] = useState(false);
  const [speechMessage, setSpeechMessage] = useState<string | null>(null);
  const [pickedAppleId, setPickedAppleId] = useState<string | null>(null);
  const [animatingAppleId, setAnimatingAppleId] = useState<string | null>(null);
  const [showCelebrationBanner, setShowCelebrationBanner] = useState(false);

  // Trigger celebration & growing apple bloom animation when returning with new workload
  useEffect(() => {
    if (newAppleWorkloadId) {
      setAnimatingAppleId(newAppleWorkloadId);
      setShowCelebrationBanner(true);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 55,
          spread: 80,
          origin: { y: 0.38 },
          colors: ['#EF4444', '#DC2626', '#FBBF24', '#F59E0B', '#22C55E', '#166534']
        });
      } catch {
        // ignore
      }

      // Rustle tree branches slightly when the new apple blossoms
      setTimeout(() => {
        setIsTreeShaking(true);
        setTimeout(() => setIsTreeShaking(false), 900);
      }, 350);

      // Keep banner and bloom halo visible for 6 seconds
      const timer = setTimeout(() => {
        setShowCelebrationBanner(false);
        setNewAppleWorkloadId(null);
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [newAppleWorkloadId, setNewAppleWorkloadId]);

  // Active workloads represent apples on the tree
  const activeWorkloads = workloads.filter(w => w.status !== 'Completed');

  // ─── Weather logic ────────────────────────────────────────────────────────
  // if got daily check in result, follow today stress level. If no, follow baseline stress level
  // sunny day (normal background) = not stressed today (background.png)
  // cloudy day = stress (background_cloudy.png)
  // rainy day = high stress level (background_rainy.png)
  const weatherInfo = (() => {
    if (todayCheckIn) {
      const cat = todayCheckIn.category;
      const score = todayCheckIn.pssScore ?? 0;
      if (cat === 'Very High' || cat === 'High' || score >= 14) {
        return {
          bg: '/assets/background_rainy.png',
          type: 'rainy',
          label: 'Rainy',
          stressLabel: 'High Stress',
          icon: '🌧️',
          color: '#1E40AF'
        };
      }
      if (cat === 'Elevated' || (cat as string) === 'Moderate' || score >= 11) {
        return {
          bg: '/assets/background_cloudy.png',
          type: 'cloudy',
          label: 'Cloudy',
          stressLabel: 'Elevated Stress',
          icon: '⛅',
          color: '#B45309'
        };
      }
      return {
        bg: '/assets/background.png',
        type: 'sunny',
        label: 'Sunny',
        stressLabel: 'Not Stressed',
        icon: '☀️',
        color: '#15803D'
      };
    } else {
      // Follow baseline stress level
      const baseStress = baselineStressAverage ?? 10.4;
      if (baseStress >= 14) {
        return {
          bg: '/assets/background_rainy.png',
          type: 'rainy',
          label: 'Rainy',
          stressLabel: 'High Stress (Baseline)',
          icon: '🌧️',
          color: '#1E40AF'
        };
      }
      if (baseStress >= 11) {
        return {
          bg: '/assets/background_cloudy.png',
          type: 'cloudy',
          label: 'Cloudy',
          stressLabel: 'Elevated Stress (Baseline)',
          icon: '⛅',
          color: '#B45309'
        };
      }
      return {
        bg: '/assets/background.png',
        type: 'sunny',
        label: 'Sunny',
        stressLabel: 'Not Stressed (Baseline)',
        icon: '☀️',
        color: '#15803D'
      };
    }
  })();

  // ─── Tree Condition logic ──────────────────────────────────────────────────
  // manageable = normal tree (tree.png)
  // strained = tree with yellow leaves (strain_tree.png)
  // overloaded = tree with yellow leaves and broken branches (overloaded_tree.png)
  const treeInfo = (() => {
    const status = capacityProfile.analysisResult.demandResourceStatus;
    let effectiveStatus: 'Manageable' | 'Strained' | 'Overloaded';

    if (status && status !== 'InsufficientData') {
      effectiveStatus = status as 'Manageable' | 'Strained' | 'Overloaded';
    } else {
      // If no check-in yet, evaluate active workload volume against available candidate time
      const totalHours = activeWorkloads.reduce((sum, w) => sum + (w.remainingTimeHours ?? w.estimatedHours ?? 0), 0);
      const available = capacityProfile.candidateTimeHours ?? 19;
      if (totalHours > available + 5 || totalHours >= 24) {
        effectiveStatus = 'Overloaded';
      } else if (totalHours > available - 4 || totalHours >= 15) {
        effectiveStatus = 'Strained';
      } else {
        effectiveStatus = 'Manageable';
      }
    }

    if (effectiveStatus === 'Overloaded') {
      return {
        src: '/assets/overloaded_tree.png',
        status: 'Overloaded',
        label: 'Yellow Leaves & Broken Branches',
        color: '#DC2626'
      };
    }
    if (effectiveStatus === 'Strained') {
      return {
        src: '/assets/strain_tree.png',
        status: 'Strained',
        label: 'Yellow Leaves',
        color: '#D97706'
      };
    }
    return {
      src: '/assets/tree.png',
      status: 'Manageable',
      label: 'Healthy Canopy',
      color: '#166534'
    };
  })();

  // Trigger tree shake & falling leaves
  const handleShakeTree = () => {
    setIsTreeShaking(true);
    const newLeaves: FallingLeaf[] = Array.from({ length: 18 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      startX: Math.random() * 55 + 22,
      startY: Math.random() * 80 + 130,
      driftX: (Math.random() - 0.5) * 110,
      delay: Math.random() * 0.35,
      color: ['#86EFAC', '#4ADE80', '#FDE047', '#FDBA74', '#F472B6', '#C084FC', '#22C55E'][
        Math.floor(Math.random() * 7)
      ],
      size: Math.floor(Math.random() * 8) + 14,
      rotate: Math.floor(Math.random() * 360)
    }));
    setFallingLeaves(newLeaves);

    try {
      confetti({
        particleCount: 22,
        spread: 50,
        origin: { y: 0.35 },
        colors: ['#4ADE80', '#FDE047', '#EF4444', '#86EFAC']
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      setIsTreeShaking(false);
    }, 850);
  };

  // Clicking an apple links to the Workload page
  const handleAppleClick = (workload: WorkloadItem) => {
    setPickedAppleId(workload.id);
    setSelectedWorkload(workload);

    try {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.4 },
        colors: ['#EF4444', '#DC2626', '#FDE047', '#4ADE80']
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      setIsWorkloadDetailOpen(true);
      setActiveTab('workloads');
    }, 380);
  };

  // Clicking Tree Hole links to AI dump stress (AI Dump Chat)
  const handleTreeHoleClick = () => {
    setChatSource('treehole');
    setActiveTab('chat');
  };

  // Clicking Gardener links to AI chat and asks question about tree health
  const handleGardenerClick = () => {
    setChatSource('treehole');
    sendGardenerQuestionToChat();
    setGardenerHasQuestion(false);
    setActiveTab('chat');
  };

  // Clicking Squirrel links to AI chat
  const handleSquirrelClick = () => {
    setChatSource('treehole');
    setSpeechMessage("🐿️ Squirrel: *Squeak!* Whisper your stress into the tree hole!");
    setTimeout(() => {
      setActiveTab('chat');
    }, 450);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '852px',
        maxHeight: '852px',
        overflow: 'hidden',
        backgroundImage: `url(${weatherInfo.bg})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        fontFamily: "'Outfit', -apple-system, sans-serif"
      }}
    >
      {/* Atmospheric Rain Drops Effect for Rainy Weather */}
      {weatherInfo.type === 'rainy' && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 15, overflow: 'hidden' }}>
          {Array.from({ length: 28 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: `-${Math.random() * 20}%`,
                left: `${(i / 28) * 100 + (Math.random() * 3 - 1.5)}%`,
                width: '1.5px',
                height: `${Math.floor(Math.random() * 22 + 28)}px`,
                backgroundColor: 'rgba(255, 255, 255, 0.42)',
                borderRadius: '1px',
                transform: 'rotate(14deg)',
                animation: `rainFall ${0.65 + (i % 5) * 0.12}s linear infinite`,
                animationDelay: `${(i * 0.11) % 1.5}s`
              }}
            />
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP HEADER CONTROLS (MATCHING USER'S REFERENCE IMAGE)                 */}
      {/* ========================================================================= */}



      {/* Top Center: Weather & Tree Condition Pill Indicator */}
      <div
        id="tree-weather-status-pill"
        style={{
          position: 'absolute',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 45,
          backgroundColor: 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '6px 14px',
          borderRadius: '20px',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '11.5px',
          fontWeight: 800,
          whiteSpace: 'nowrap',
          pointerEvents: 'none'
        }}
        title={`Weather: ${weatherInfo.label} (${weatherInfo.stressLabel}) · Tree: ${treeInfo.status}`}
      >
        <span>{weatherInfo.icon}</span>
        <span style={{ color: weatherInfo.color }}>{weatherInfo.label}</span>
        <span style={{ color: '#CBD5E1' }}>•</span>
        <span style={{ color: treeInfo.color }}>{treeInfo.status}</span>
      </div>

      {/* Top-Right: Action Buttons Cluster (Daily Check-in + Shake + Chat + Workloads) */}
      <div
        style={{
          position: 'absolute',
          top: '22px',
          right: '18px',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          alignItems: 'flex-end'
        }}
      >
        {/* Button 1: Shake Tree action (leaves flutter down) */}
        <button
          type="button"
          id="shake-tree-btn"
          onClick={handleShakeTree}
          title="Shake the tree to release tension"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(255, 255, 255, 0.85)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            color: '#166534',
            transition: 'transform 0.15s ease'
          }}
        >
          <Wind size={18} color="#166534" strokeWidth={2.4} />
        </button>

        {/* Button 2: AI Dump Chat shortcut */}
        <button
          type="button"
          onClick={() => {
            setChatSource('treehole');
            setActiveTab('chat');
          }}
          title="AI Dump Stress Chat"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(255, 255, 255, 0.85)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            color: '#166534',
            transition: 'transform 0.15s ease'
          }}
        >
          <MessageSquare size={17} color="#166534" strokeWidth={2.4} />
        </button>

        {/* Button 3: Workloads shortcut */}
        <button
          type="button"
          onClick={() => setActiveTab('workloads')}
          title="View Workloads"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(255, 255, 255, 0.85)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            color: '#166534',
            transition: 'transform 0.15s ease'
          }}
        >
          <CheckSquare size={17} color="#166534" strokeWidth={2.4} />
        </button>

        {/* ── Daily Check-in Button (Positioned at the lowest of action buttons cluster) ── */}
        <div
          id="tree-daily-checkin-wrapper"
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {/* Obvious glowing callout pill if daily check-in is pending */}
          {!todayCheckIn && (
            <div
              style={{
                backgroundColor: 'rgba(254, 243, 199, 0.96)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1.2px solid #F59E0B',
                color: '#92400E',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 800,
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 10px rgba(245, 158, 11, 0.35)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                lineHeight: 1,
                animation: 'pulseHint 1.8s ease-in-out infinite alternate'
              }}
            >
              <span>Daily Check-in</span>
              <Sparkles size={11} color="#D97706" />
            </div>
          )}

          <button
            type="button"
            id="tree-daily-checkin-btn"
            onClick={() => {
              setCheckInSource('tree');
              setIsCheckInOpen(true);
            }}
            title={todayCheckIn ? "Daily Check-in Completed (Tap to view or edit snapshot)" : "Daily Check-in Pending — Tap to check in today!"}
            style={{
              position: 'relative',
              width: !todayCheckIn ? '42px' : '38px',
              height: !todayCheckIn ? '42px' : '38px',
              borderRadius: '50%',
              background: !todayCheckIn
                ? 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)'
                : 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: !todayCheckIn
                ? '2px solid #F59E0B'
                : '1.5px solid rgba(134, 239, 172, 0.95)',
              boxShadow: !todayCheckIn
                ? '0 0 16px rgba(245, 158, 11, 0.95), 0 0 28px rgba(249, 115, 22, 0.55)'
                : '0 4px 12px rgba(0, 0, 0, 0.08)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: !todayCheckIn ? 'checkInGlow 1.8s ease-in-out infinite alternate' : 'none',
              transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <ClipboardCheck
              size={!todayCheckIn ? 21 : 18}
              color={!todayCheckIn ? '#D97706' : '#166534'}
              strokeWidth={!todayCheckIn ? 2.6 : 2.4}
            />

            {/* Notification badge dot */}
            {!todayCheckIn ? (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  width: '11px',
                  height: '11px',
                  borderRadius: '50%',
                  backgroundColor: '#EF4444',
                  border: '2px solid #FFFFFF',
                  boxShadow: '0 0 6px #EF4444',
                  animation: 'pulseDot 1.4s ease-in-out infinite'
                }}
              />
            ) : (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#22C55E',
                  border: '1.5px solid #FFFFFF'
                }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Ephemeral Speech Bubble from Gardener or Squirrel */}
      {speechMessage && (
        <div
          style={{
            position: 'absolute',
            top: '75px',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '280px',
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(14px)',
            padding: '8px 14px',
            borderRadius: '18px',
            border: '1.5px solid #BBF7D0',
            boxShadow: '0 8px 24px rgba(34, 197, 94, 0.15)',
            fontSize: '12px',
            fontWeight: 700,
            color: '#14532D',
            textAlign: 'center',
            zIndex: 60,
            animation: 'fadeInUp 0.25s ease'
          }}
        >
          {speechMessage}
        </div>
      )}

      {/* Top Banner: New Apple Added Celebration */}
      {showCelebrationBanner && (
        <div
          id="new-apple-celebration-banner"
          style={{
            position: 'absolute',
            top: '76px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 60,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(254, 243, 199, 0.95) 100%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1.5px solid #F59E0B',
            borderRadius: '20px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.28)',
            animation: 'bannerSlideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            maxWidth: '350px',
            width: '92%'
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#FEF3C7',
            border: '1.2px solid #FDE68A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            flexShrink: 0
          }}>
            🍎
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#92400E', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>New Apple on Tree!</span>
              <Sparkles size={13} color="#D97706" />
            </span>
            <span style={{ fontSize: '11px', color: '#78350F', lineHeight: 1.3 }}>
              <strong>Tech Carnival Sponsorship</strong> (6h) has bloomed on your branch.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowCelebrationBanner(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '15px',
              color: '#92400E',
              cursor: 'pointer',
              fontWeight: 700,
              padding: '4px',
              lineHeight: 1
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE TREE STAGE (Tree Trunk, Canopy, Hole, & Apples)             */}
      {/* ========================================================================= */}
      <div
        id="tree-interactive-stage"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transformOrigin: '196.5px 735px',
          animation: isTreeShaking
            ? 'treeShake 0.4s ease infinite alternate'
            : 'treeBreeze 6s ease-in-out infinite alternate',
          pointerEvents: 'none',
          zIndex: 15
        }}
      >
        {/* Tree Graphic Wrapper (centered, branches up, trunk base on grass) */}
        <div
          id="tree-wrapper"
          style={{
            position: 'absolute',
            top: '85px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '335px',
            height: '650px',
            pointerEvents: 'none'
          }}
        >
          <img
            src={treeInfo.src}
            alt={`Apple Tree (${treeInfo.status})`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              pointerEvents: 'none',
              userSelect: 'none'
            }}
          />
        </div>

        {/* 3. TREE HOLE (Clickable in the middle of trunk -> AI Dump Stress) */}
        {/* Shifted to left: calc(50% - 13px) to align precisely with visual trunk center */}
        <div
          id="clickable-tree-hole"
          onClick={handleTreeHoleClick}
          onMouseEnter={() => setIsHoleHovered(true)}
          onMouseLeave={() => setIsHoleHovered(false)}
          title="Tree Hole: Click to dump stress in AI Chat"
          style={{
            position: 'absolute',
            top: '575px',
            left: 'calc(50% - 13px)',
            transform: `translateX(-50%) scale(${isHoleHovered ? 1.15 : 1})`,
            width: '34px',
            height: '56px',
            cursor: 'pointer',
            pointerEvents: 'auto',
            zIndex: 25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {/* Outer Knothole Rim Matching Reference Photo */}
          <div
            style={{
              width: '26px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: '#4A1E0B',
              border: isHoleHovered
                ? '2px solid #FDE047'
                : '1.8px solid #371607',
              boxShadow: isHoleHovered
                ? '0 0 16px rgba(253, 224, 71, 0.85), inset 0 0 12px #1C0A00'
                : 'inset 0 4px 10px #1C0A00, 0 2px 6px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.18s ease'
            }}
          >
            {/* Inner Mystical Amber Ember Core */}
            <div
              style={{
                width: '10px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: '#FDE047',
                opacity: isHoleHovered ? 0.95 : 0.45,
                filter: 'blur(2px)',
                animation: 'glowPulse 2s ease-in-out infinite alternate'
              }}
            />
            <span
              style={{
                position: 'absolute',
                fontSize: '9px',
                opacity: isHoleHovered ? 1 : 0.7,
                animation: 'leafFloat 2.4s ease-in-out infinite'
              }}
            >
              🍃
            </span>
          </div>

          {/* Tree Hole Hover Tooltip Callout */}
          {isHoleHovered && (
            <div
              style={{
                position: 'absolute',
                bottom: '-28px',
                whiteSpace: 'nowrap',
                backgroundColor: '#166534',
                color: '#FFFFFF',
                border: '1px solid #4ADE80',
                borderRadius: '12px',
                padding: '3px 10px',
                fontSize: '10.5px',
                fontWeight: 800,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                pointerEvents: 'none',
                animation: 'fadeInUp 0.15s ease'
              }}
            >
              🕳️ Tap to dump stress in AI Chat
            </div>
          )}
        </div>

        {/* 4. APPLES (apple.png.png overlapping tree.png -> Workload Page) */}
        {activeWorkloads.map((workload, idx) => {
          const coord = APPLE_COORDINATES[idx % APPLE_COORDINATES.length];
          const isPicked = pickedAppleId === workload.id;
          const isHovered = hoveredApple?.workload.id === workload.id;
          const isNewApple = (animatingAppleId === workload.id) || (newAppleWorkloadId === workload.id);

          return (
            <div
              key={workload.id}
              id={`apple-workload-${workload.id}`}
              onClick={() => handleAppleClick(workload)}
              onMouseEnter={() =>
                setHoveredApple({ workload, x: coord.x, y: coord.y })
              }
              onMouseLeave={() => setHoveredApple(null)}
              title={`Apple: ${workload.title} (${workload.remainingTimeHours ?? workload.estimatedHours}h) - Click to view in Workload page`}
              style={{
                position: 'absolute',
                left: `${coord.x}px`,
                top: `${coord.y}px`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                pointerEvents: 'auto',
                zIndex: 30,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              {/* New Apple Bloomed Badge */}
              {isNewApple && (
                <div
                  style={{
                    marginBottom: '2px',
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    padding: '2px 7px',
                    borderRadius: '10px',
                    fontSize: '9.5px',
                    fontWeight: 900,
                    boxShadow: '0 3px 10px rgba(220, 38, 38, 0.45)',
                    animation: 'fadeInUp 0.3s ease',
                    letterSpacing: '0.3px',
                    whiteSpace: 'nowrap',
                    zIndex: 35
                  }}
                >
                  ✨ +1 New Apple!
                </div>
              )}

              {/* Apple Image using assets/apple.png.png */}
              <div
                style={{
                  position: 'relative',
                  width: '42px',
                  height: '46px',
                  transform: `rotate(${coord.rotate}deg) scale(${isPicked ? 1.4 : isHovered ? 1.22 : isNewApple ? 1.15 : 1
                    })`,
                  transformOrigin: 'top center',
                  animation: isNewApple
                    ? 'newAppleBloom 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                    : isTreeShaking
                      ? 'appleShake 0.3s ease infinite alternate'
                      : 'appleSway 4s ease-in-out infinite alternate',
                  animationDelay: isNewApple ? '0s' : `${idx * 0.45}s`,
                  transition: 'transform 0.15s ease'
                }}
              >
                {/* Golden Glow Halo for Newly Bloomed Apple */}
                {isNewApple && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      left: '-8px',
                      right: '-8px',
                      bottom: '-8px',
                      borderRadius: '50%',
                      border: '2px dashed #F59E0B',
                      animation: 'sparkleSpin 3.5s linear infinite',
                      pointerEvents: 'none',
                      boxShadow: '0 0 16px rgba(245, 158, 11, 0.65)'
                    }}
                  />
                )}

                <img
                  src="/assets/apple.png.png"
                  alt="Workload Apple"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                    filter: isNewApple
                      ? 'drop-shadow(0 0 16px rgba(245, 158, 11, 0.95)) drop-shadow(0 0 8px rgba(239, 68, 68, 0.9))'
                      : isHovered
                        ? 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.9)) drop-shadow(0 4px 8px rgba(0,0,0,0.25))'
                        : 'drop-shadow(0 3px 6px rgba(0,0,0,0.2))'
                  }}
                />

                {/* Hours Pill Tag Centered on Apple */}
                <div
                  style={{
                    position: 'absolute',
                    top: '55%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.45)',
                    backdropFilter: 'blur(2px)',
                    borderRadius: '6px',
                    padding: '1px 4px',
                    fontSize: '9.5px',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    lineHeight: 1,
                    pointerEvents: 'none'
                  }}
                >
                  {workload.remainingTimeHours ?? workload.estimatedHours}h
                </div>
              </div>

              {/* Workload Title Pill */}
              <div
                style={{
                  marginTop: '2px',
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(6px)',
                  padding: '1px 6px',
                  borderRadius: '8px',
                  border: '1px solid rgba(220, 38, 38, 0.35)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  maxWidth: '68px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: '9px',
                  fontWeight: 800,
                  color: '#991B1B',
                  pointerEvents: 'none'
                }}
              >
                {workload.title}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hovered Apple Tooltip Card */}
      {hoveredApple && (
        <div
          style={{
            position: 'absolute',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(16px)',
            borderRadius: '20px',
            padding: '10px 16px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.16)',
            border: '1.5px solid rgba(239, 68, 68, 0.5)',
            zIndex: 60,
            maxWidth: '320px',
            width: '88%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            animation: 'fadeInUp 0.18s ease forwards'
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '15px' }}>🍎</span>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#0F172A',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {hoveredApple.workload.title}
              </span>
            </div>
            <div
              style={{
                fontSize: '11px',
                color: '#64748B',
                marginTop: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>
                ⏱️ {hoveredApple.workload.remainingTimeHours ?? hoveredApple.workload.estimatedHours}h
              </span>
              <span>•</span>
              <span
                style={{
                  color:
                    hoveredApple.workload.urgency === 'High'
                      ? '#DC2626'
                      : '#D97706',
                  fontWeight: 700
                }}
              >
                {hoveredApple.workload.urgency} Urgency
              </span>
            </div>
          </div>

          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#DC2626',
              backgroundColor: '#FEE2E2',
              padding: '4px 10px',
              borderRadius: '12px',
              whiteSpace: 'nowrap'
            }}
          >
            Open Workload →
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. GARDENER (gardener.png on left side of tree -> links to AI chat)      */}
      {/* ========================================================================= */}
      <div
        id="clickable-gardener"
        onClick={handleGardenerClick}
        onMouseEnter={() => setIsGardenerHovered(true)}
        onMouseLeave={() => setIsGardenerHovered(false)}
        title="Gardener Nicole: Click to chat with AI"
        style={{
          position: 'absolute',
          left: '18px',
          bottom: '75px',
          width: '122px',
          height: '202px',
          cursor: 'pointer',
          zIndex: 25,
          transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: isGardenerHovered ? 'scale(1.06)' : 'scale(1)',
          filter: isGardenerHovered
            ? 'drop-shadow(0 0 14px rgba(34, 197, 94, 0.7))'
            : 'drop-shadow(0 4px 10px rgba(0,0,0,0.18))'
        }}
      >
        <img
          src="/assets/gardener.png"
          alt="Gardener"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            userSelect: 'none'
          }}
        />

        {/* Animated Question Mark to Notice & Click */}
        {gardenerHasQuestion && (
          <div
            id="gardener-question-badge"
            style={{
              position: 'absolute',
              top: '-36px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 35,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              animation: 'questionBounce 1.6s ease-in-out infinite alternate',
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 900,
                boxShadow: '0 0 16px rgba(220, 38, 38, 0.85), 0 4px 10px rgba(0,0,0,0.25)',
                border: '2.5px solid #FFFFFF'
              }}
            >
              ❓
            </div>
            {/* Pointer triangle tail */}
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '6px solid #DC2626',
                marginTop: '-1px'
              }}
            />
            {/* Label callout */}
            <span
              style={{
                marginTop: '2px',
                backgroundColor: '#FEF3C7',
                color: '#92400E',
                border: '1px solid #F59E0B',
                borderRadius: '8px',
                padding: '1px 6px',
                fontSize: '9.5px',
                fontWeight: 800,
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
              }}
            >
              Tap to ask question!
            </span>
          </div>
        )}

        {/* Floating Callout on hover */}
        {isGardenerHovered && !gardenerHasQuestion && (
          <div
            style={{
              position: 'absolute',
              top: '-32px',
              left: '50%',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              backgroundColor: '#15803D',
              color: '#FFFFFF',
              border: '1px solid #86EFAC',
              borderRadius: '12px',
              padding: '4px 10px',
              fontSize: '10.5px',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              pointerEvents: 'none',
              animation: 'fadeInUp 0.15s ease'
            }}
          >
            👨‍🌾 Tap to chat with AI
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. SQUIRREL (squirrel.png beside tree on right -> links to AI chat)       */}
      {/* ========================================================================= */}
      <div
        id="clickable-squirrel"
        onClick={handleSquirrelClick}
        onMouseEnter={() => setIsSquirrelHovered(true)}
        onMouseLeave={() => setIsSquirrelHovered(false)}
        title="Squirrel: Click to chat with AI"
        style={{
          position: 'absolute',
          left: '236px',
          bottom: '105px',
          width: '74px',
          height: '74px',
          cursor: 'pointer',
          zIndex: 25,
          transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: isSquirrelHovered
            ? 'scale(1.15) rotate(-3deg)'
            : 'scale(1)',
          filter: isSquirrelHovered
            ? 'drop-shadow(0 0 12px rgba(251, 146, 60, 0.8))'
            : 'drop-shadow(0 3px 6px rgba(0,0,0,0.15))'
        }}
      >
        <img
          src="/assets/squirrel.png"
          alt="Squirrel"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            userSelect: 'none'
          }}
        />

        {/* Floating Callout on hover */}
        {isSquirrelHovered && (
          <div
            style={{
              position: 'absolute',
              top: '-28px',
              left: '50%',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              backgroundColor: '#C2410C',
              color: '#FFFFFF',
              border: '1px solid #FDBA74',
              borderRadius: '12px',
              padding: '3px 8px',
              fontSize: '10.5px',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              pointerEvents: 'none',
              animation: 'fadeInUp 0.15s ease'
            }}
          >
            🐿️ Tap to chat!
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 7. FALLING LEAVES OVERLAY (WHEN SHAKING TREE)                             */}
      {/* ========================================================================= */}
      {fallingLeaves.map(leaf => (
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
            zIndex: 40,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))'
          }}
        >
          🍃
        </div>
      ))}



      {/* Keyframe Animations */}
      <style>{`
        @keyframes treeBreeze {
          0% { transform: rotate(-0.6deg); }
          100% { transform: rotate(0.6deg); }
        }
        @keyframes treeShake {
          0% { transform: rotate(-2.2deg) scale(1.02); }
          50% { transform: rotate(2.2deg) scale(1.02); }
          100% { transform: rotate(-1.5deg) scale(1.01); }
        }
        @keyframes checkInGlow {
          0% {
            box-shadow: 0 0 10px rgba(245, 158, 11, 0.6), 0 0 20px rgba(249, 115, 22, 0.35);
            transform: scale(1);
            border-color: #F59E0B;
          }
          50% {
            box-shadow: 0 0 22px rgba(245, 158, 11, 1), 0 0 35px rgba(249, 115, 22, 0.75), inset 0 0 8px #FDE68A;
            transform: scale(1.08);
            border-color: #D97706;
          }
          100% {
            box-shadow: 0 0 10px rgba(245, 158, 11, 0.6), 0 0 20px rgba(249, 115, 22, 0.35);
            transform: scale(1);
            border-color: #F59E0B;
          }
        }
        @keyframes pulseDot {
          0% { transform: scale(0.85); opacity: 0.8; }
          50% { transform: scale(1.25); opacity: 1; }
          100% { transform: scale(0.85); opacity: 0.8; }
        }
        @keyframes pulseHint {
          0% { transform: translateX(0px); opacity: 0.92; }
          50% { transform: translateX(-3px); opacity: 1; }
          100% { transform: translateX(0px); opacity: 0.92; }
        }
        @keyframes appleSway {
          0% { transform: rotate(-5deg); }
          100% { transform: rotate(5deg); }
        }
        @keyframes appleShake {
          0% { transform: rotate(-15deg) scale(1.1); }
          100% { transform: rotate(15deg) scale(1.1); }
        }
        @keyframes glowPulse {
          0% { transform: scale(0.85); opacity: 0.4; }
          100% { transform: scale(1.15); opacity: 0.95; }
        }
        @keyframes leafFloat {
          0% { transform: translateY(2px) rotate(0deg); opacity: 0.4; }
          50% { transform: translateY(-3px) rotate(15deg); opacity: 0.9; }
          100% { transform: translateY(2px) rotate(0deg); opacity: 0.4; }
        }
        @keyframes flutterFall {
          0% {
            opacity: 1;
            transform: translateY(0px) rotate(0deg) scale(1);
          }
          50% {
            opacity: 0.9;
            transform: translateY(110px) translateX(25px) rotate(180deg) scale(1.05);
          }
          100% {
            opacity: 0;
            transform: translateY(280px) translateX(-20px) rotate(360deg) scale(0.8);
          }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translate(-50%, 6px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes newAppleBloom {
          0% {
            transform: scale(0) translateY(-40px);
            opacity: 0;
            filter: drop-shadow(0 0 0 rgba(239, 68, 68, 0));
          }
          50% {
            transform: scale(1.4) translateY(6px);
            opacity: 1;
            filter: drop-shadow(0 0 25px #FBBF24) drop-shadow(0 0 15px #EF4444);
          }
          75% {
            transform: scale(0.92) translateY(-2px);
          }
          100% {
            transform: scale(1.15) translateY(0);
            opacity: 1;
            filter: drop-shadow(0 0 16px rgba(245, 158, 11, 0.95)) drop-shadow(0 0 8px rgba(239, 68, 68, 0.9));
          }
        }
        @keyframes sparkleSpin {
          0% { transform: scale(0.85) rotate(0deg); opacity: 0.5; }
          50% { transform: scale(1.15) rotate(180deg); opacity: 1; }
          100% { transform: scale(0.85) rotate(360deg); opacity: 0.5; }
        }
        @keyframes bannerSlideDown {
          0% { transform: translate(-50%, -24px); opacity: 0; }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes questionBounce {
          0% { transform: translateX(-50%) translateY(0) scale(1); }
          50% { transform: translateX(-50%) translateY(-9px) scale(1.1); }
          100% { transform: translateX(-50%) translateY(0) scale(1); }
        }
        @keyframes rainFall {
          0% { transform: translate(30px, -40px) rotate(14deg); opacity: 0; }
          15% { opacity: 0.65; }
          85% { opacity: 0.65; }
          100% { transform: translate(-150px, 880px) rotate(14deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
