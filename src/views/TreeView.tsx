import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { WorkloadItem } from '../types/workload';
import { ArrowLeft, Wind, MessageSquare, CheckSquare, Sparkles } from 'lucide-react';
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
    setNewAppleWorkloadId
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

  // Clicking Gardener links to AI chat
  const handleGardenerClick = () => {
    setChatSource('treehole');
    setSpeechMessage("👨‍🌾 Gardener Nicole: Need to talk? Let's dump your stress in the Tree Hole chat!");
    setTimeout(() => {
      setActiveTab('chat');
    }, 450);
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
        backgroundImage: 'url(/assets/background.png)',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        fontFamily: "'Outfit', -apple-system, sans-serif"
      }}
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER CONTROLS (MATCHING USER'S REFERENCE IMAGE)                 */}
      {/* ========================================================================= */}

      {/* Top-Left: Back to Home Button */}
      <button
        type="button"
        id="tree-back-home-btn"
        onClick={() => setActiveTab('home')}
        style={{
          position: 'absolute',
          top: '24px',
          left: '18px',
          zIndex: 50,
          border: '1.5px solid rgba(255, 255, 255, 0.85)',
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          color: '#166534',
          padding: '6px 14px',
          borderRadius: '20px',
          cursor: 'pointer',
          fontWeight: 800,
          fontSize: '12.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 14px rgba(34, 197, 94, 0.12)',
          transition: 'all 0.15s ease'
        }}
        title="Return to Homepage"
      >
        <ArrowLeft size={16} strokeWidth={2.5} />
        <span>Home</span>
      </button>

      {/* Top-Right: 3 Translucent Circular Buttons (As seen in reference photo) */}
      <div
        style={{
          position: 'absolute',
          top: '22px',
          right: '18px',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
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
      {/* 2. THE TREE (tree.png) & INTERACTIVE OVERLAYS                             */}
      {/* ========================================================================= */}

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
          zIndex: 10,
          animation: isTreeShaking
            ? 'treeShake 0.4s ease infinite alternate'
            : 'treeBreeze 6s ease-in-out infinite alternate',
          transformOrigin: 'bottom center',
          pointerEvents: 'none'
        }}
      >
        <img
          src="/assets/tree.png"
          alt="Apple Tree"
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

      {/* ========================================================================= */}
      {/* 3. TREE HOLE (Clickable in the middle of trunk -> AI Dump Stress)         */}
      {/* ========================================================================= */}
      <div
        id="clickable-tree-hole"
        onClick={handleTreeHoleClick}
        onMouseEnter={() => setIsHoleHovered(true)}
        onMouseLeave={() => setIsHoleHovered(false)}
        title="Tree Hole: Click to dump stress in AI Chat"
        style={{
          position: 'absolute',
          top: '575px',
          left: '50%',
          transform: `translateX(-50%) scale(${isHoleHovered ? 1.15 : 1})`,
          width: '34px',
          height: '56px',
          cursor: 'pointer',
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

      {/* ========================================================================= */}
      {/* 4. APPLES (apple.png.png overlapping tree.png -> Workload Page)           */}
      {/* ========================================================================= */}
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
                transform: `rotate(${coord.rotate}deg) scale(${
                  isPicked ? 1.4 : isHovered ? 1.22 : isNewApple ? 1.15 : 1
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

        {/* Floating Callout on hover */}
        {isGardenerHovered && (
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
          0% { transform: translateX(-50%) rotate(-0.5deg); }
          100% { transform: translateX(-50%) rotate(0.6deg); }
        }
        @keyframes treeShake {
          0% { transform: translateX(-50%) rotate(-2.2deg) scale(1.02); }
          50% { transform: translateX(-50%) rotate(2.2deg) scale(1.02); }
          100% { transform: translateX(-50%) rotate(-1.5deg) scale(1.01); }
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
      `}</style>
    </div>
  );
};
