import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { WorkloadItem } from '../types/workload';
import { ArrowLeft, Wind, Calendar, CheckSquare, Sparkles, ClipboardCheck, X } from 'lucide-react';
import confetti from 'canvas-confetti';

function getWorkloadProgress(workload: WorkloadItem): number {
  if (workload.status === 'Completed') return 100;
  const totalSubtasks = workload.subtasks?.length ?? 0;
  if (totalSubtasks > 0) {
    const completed = workload.subtasks.filter(s => s.completed).length;
    return Math.round((completed / totalSubtasks) * 100);
  }
  if (workload.remainingTimeHours !== undefined && workload.estimatedHours && workload.estimatedHours > 0) {
    return Math.max(0, Math.min(100, Math.round(((workload.estimatedHours - workload.remainingTimeHours) / workload.estimatedHours) * 100)));
  }
  return 0;
}

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

// Positions matching the tree canopy clusters on 393x852 viewport
const APPLE_COORDINATES = [
  // Apple 1: Upper-Left canopy cluster
  { x: 80, y: 375, rotate: -8 },
  // Apple 2: Lower-Left canopy cluster
  { x: 118, y: 434, rotate: 6 },
  // Apple 3: Mid-Right canopy cluster
  { x: 262, y: 405, rotate: -6 },
  // Apple 4: Far-Right canopy cluster
  { x: 329, y: 434, rotate: 8 },
  // Apple 5: Top-Center canopy cluster
  { x: 196, y: 285, rotate: 4 },
  // Apple 6: Mid-Left canopy cluster
  { x: 145, y: 345, rotate: -6 },
  // Apple 7: Upper-Right canopy cluster
  { x: 288, y: 345, rotate: 6 },
  // Apple 8: Lower-Right canopy cluster
  { x: 220, y: 434, rotate: -4 },
  // Apple 9: Deep Upper-Center canopy cluster
  { x: 135, y: 275, rotate: -4 },
  // Apple 10: Deep Upper-Right canopy cluster
  { x: 250, y: 260, rotate: 5 },
  // Apple 11: Far Left-Edge canopy cluster
  { x: 42, y: 420, rotate: -10 },
  // Apple 12: High-Center Apex canopy cluster
  { x: 190, y: 232, rotate: 2 },
  // Apple 13: Mid-Low Center-Right cluster
  { x: 182, y: 450, rotate: -3 },
  // Apple 14: Outer Right canopy cluster
  { x: 348, y: 380, rotate: 10 },
  // Apple 15: Deep Top-Left apex cluster
  { x: 105, y: 310, rotate: -6 }
];

// Decorative canopy flowers matching reference photo (shifted upper by 40px)
const CANOPY_FLOWERS = [
  { id: 1, x: 255, y: 300, size: 24, rotate: 12 }, // Top flower in upper right cluster
  { id: 2, x: 138, y: 382, size: 22, rotate: -8 }, // Moved up above Web programming & right of Operating System apple
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
    sendSquirrelInsightToChat,
    isTreeBent: contextIsTreeBent,
    setIsTreeBent,
    isBalancePlanApplied,
    todayCheckIn,
    baselineStressAverage,
    capacityProfile,
    setIsCheckInOpen,
    setCheckInSource,
    harvestedAppleIds,
    harvestApple,
    activeWorkloadSubTab,
    setActiveWorkloadSubTab,
    hasShownInitialTreeHoleNotice,
    setHasShownInitialTreeHoleNotice
  } = useApp();

  const [isGardenerQuestionDismissed, setIsGardenerQuestionDismissed] = useState(false);

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
  const [harvestSuccessWorkload, setHarvestSuccessWorkload] = useState<WorkloadItem | null>(null);
  const [showHarvestBasketModal, setShowHarvestBasketModal] = useState(false);
  const [isHoldingPickedApple, setIsHoldingPickedApple] = useState(false);
  const [isInitialHoleNotice, setIsInitialHoleNotice] = useState(false);
  const [isLongStayHoleNotice, setIsLongStayHoleNotice] = useState(false);

  // When user first enters the app, show tree hole hover once.
  useEffect(() => {
    if (!hasShownInitialTreeHoleNotice) {
      setIsInitialHoleNotice(true);
      setHasShownInitialTreeHoleNotice(true);
    }
  }, [hasShownInitialTreeHoleNotice, setHasShownInitialTreeHoleNotice]);

  // Hide the initial tree hole notice after 2 seconds.
  useEffect(() => {
    if (!isInitialHoleNotice) return;

    const timer = setTimeout(() => {
      setIsInitialHoleNotice(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isInitialHoleNotice]);

  // When user stays on the homepage for a very long time (15s), show the tree hole hover for 2.5s
  useEffect(() => {
    let longStayTimer: ReturnType<typeof setTimeout>;
    let longStayHideTimer: ReturnType<typeof setTimeout>;

    const scheduleNotice = () => {
      clearTimeout(longStayTimer);
      longStayTimer = setTimeout(() => {
        setIsLongStayHoleNotice(true);
        longStayHideTimer = setTimeout(() => {
          setIsLongStayHoleNotice(false);
        }, 2500);
      }, 10000); // 10s threshold
    };

    scheduleNotice();

    const handleUserActivity = () => {
      clearTimeout(longStayTimer);
      scheduleNotice();
    };

    window.addEventListener('pointerdown', handleUserActivity);
    return () => {
      clearTimeout(longStayTimer);
      clearTimeout(longStayHideTimer);
      window.removeEventListener('pointerdown', handleUserActivity);
    };
  }, []);

  // Staged Add-Workload Animation:
  // 1. 'apple-first': Show add apple first. Tree is upright, gardener is normal.
  // 2. 'tree-tilt': Then only tilt the tree under the weight. Gardener is still normal.
  // 3. 'gardener-react': Then only gardener changes emotion to confused and asks question.
  // 4. 'idle': Default state reflecting active workloads & status.
  const [workloadAnimStage, setWorkloadAnimStage] = useState<'idle' | 'apple-first' | 'tree-tilt' | 'gardener-react'>('idle');

  // Trigger staged animation: show add apple first -> then only tilt the tree -> then only gardener change emotion and ask question
  useEffect(() => {
    if (newAppleWorkloadId) {
      setAnimatingAppleId(newAppleWorkloadId);
      setShowCelebrationBanner(true);
      setIsGardenerQuestionDismissed(false);

      // Phase 1: Show add apple first
      setWorkloadAnimStage('apple-first');

      // Phase 2: Then only tilt the tree (after 1.3s)
      const treeTiltTimer = setTimeout(() => {
        setWorkloadAnimStage('tree-tilt');
        setIsTreeShaking(true);
        setTimeout(() => setIsTreeShaking(false), 900);
      }, 1300);

      // Phase 3: Then only gardener changes emotion and asks question (after 2.6s)
      const gardenerTimer = setTimeout(() => {
        setWorkloadAnimStage('gardener-react');
        setGardenerHasQuestion(true);
      }, 2600);

      // Finish celebration and return to idle after 6.5s
      const finishTimer = setTimeout(() => {
        setShowCelebrationBanner(false);
        setNewAppleWorkloadId(null);
        setWorkloadAnimStage('idle');
      }, 6500);

      return () => {
        clearTimeout(treeTiltTimer);
        clearTimeout(gardenerTimer);
        clearTimeout(finishTimer);
      };
    }
  }, [newAppleWorkloadId, setNewAppleWorkloadId, setGardenerHasQuestion]);

  // Workloads represented as apples on tree: active workloads + completed workloads not yet harvested
  const treeApples = workloads.filter(w => {
    if (w.status !== 'Completed') return true;
    return !harvestedAppleIds.includes(w.id);
  });

  // Check if any completed workload is ready to be picked up from the tree
  const hasDoneApplesToPick = treeApples.some(w => getWorkloadProgress(w) >= 100 || w.status === 'Completed');

  // Tree is bent after new workload is added (more than baseline 4 workloads, sponsorship, or explicit flag)
  // When balance plan is applied, tree is un-tilted and upright
  const hasAddedExtraWorkload = treeApples.length > 4 ||
    workloads.some(w => w.id === 'tech-carnival-sponsorship' || w.title.toLowerCase().includes('sponsorship'));

  const isTreeBentCalculated = !isBalancePlanApplied && (
    contextIsTreeBent ||
    hasAddedExtraWorkload
  );

  // During staged animation: apple appears first, tree only tilts in 'tree-tilt', 'gardener-react', or 'idle'
  const isTreeBent = workloadAnimStage === 'apple-first' ? false : isTreeBentCalculated;

  // Reset farmer dismissed question state whenever a new workload/apple is added or tree bends
  useEffect(() => {
    if (newAppleWorkloadId || isTreeBent) {
      setIsGardenerQuestionDismissed(false);
    }
  }, [newAppleWorkloadId, isTreeBent]);

  // ─── Weather logic ────────────────────────────────────────────────────────
  // The daily state is recorded/shown ONLY after the user fills in daily checkin questionnaire.
  // When user signs in before check-in, weather is default sunny/clear.
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
      // Default before daily check-in is clear/sunny with pending status
      return {
        bg: '/assets/background.png',
        type: 'sunny',
        label: 'Sunny',
        stressLabel: 'Pending Check-in',
        icon: '☀️',
        color: '#15803D'
      };
    }
  })();

  // ─── Tree Condition logic ──────────────────────────────────────────────────
  // The daily state (manageable, strained and overloaded) is recorded/shown ONLY after the user fills in daily checkin questionnaire
  // cuz it is a daily refresh record, so when the user signs in to our app will not see the strained_tree/overloaded_tree.
  const treeInfo = (() => {
    if (!todayCheckIn) {
      return {
        src: '/assets/tree.png',
        status: 'Manageable',
        label: isTreeBent ? 'Bent Under Workload' : 'Healthy Canopy',
        color: isTreeBent ? '#D97706' : '#166534'
      };
    }

    const status = capacityProfile.analysisResult.demandResourceStatus;
    let effectiveStatus: 'Manageable' | 'Strained' | 'Overloaded';

    if (status && status !== 'InsufficientData') {
      effectiveStatus = status as 'Manageable' | 'Strained' | 'Overloaded';
    } else {
      const totalHours = treeApples.reduce((sum, w) => sum + (w.remainingTimeHours ?? w.estimatedHours ?? 0), 0);
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
        src: '/assets/yellowTree.png',
        status: 'Overloaded',
        label: isTreeBent ? 'Bent & Broken Branches' : 'Yellow Leaves & Broken Branches',
        color: '#DC2626'
      };
    }
    if (effectiveStatus === 'Strained') {
      return {
        src: '/assets/yellowTree.png',
        status: 'Strained',
        label: isTreeBent ? 'Bent & Yellow Leaves' : 'Yellow Leaves',
        color: '#D97706'
      };
    }
    return {
      src: '/assets/tree.png',
      status: 'Manageable',
      label: isTreeBent ? 'Bent Under Weight' : 'Healthy Canopy',
      color: isTreeBent ? '#D97706' : '#166534'
    };
  })();

  // Gardener emotion change rules:
  // When tree tilted / tree condition changed / weather changed, either one or multiple of them happen together.
  // Emotion returns to normal when user clicks apply balance (isBalancePlanApplied = true).
  const isTreeOrWeatherChanged = isTreeBentCalculated || treeInfo.status !== 'Manageable' || weatherInfo.type !== 'sunny';

  const showGardenerReaction = !isBalancePlanApplied && (
    (workloadAnimStage === 'apple-first' || workloadAnimStage === 'tree-tilt')
      ? false
      : ((isTreeOrWeatherChanged || gardenerHasQuestion) && !isGardenerQuestionDismissed)
  );

  // Dynamic Gardener picture selection (evaluated safely after treeInfo & isTreeBent are initialized):
  // 1. After picking up the apple -> gardener_apple.png
  // 2. When an apple is ready to be picked up -> gardener_basket.png
  // 3. When tree is overloaded / bent / has question (after tree tilt animation) -> confuseGardener.png
  // 4. Default -> gardener.png
  const gardenerImageSrc = (() => {
    if (isHoldingPickedApple) return '/assets/gardener_apple.png';
    if (hasDoneApplesToPick) return '/assets/gardener_basket.png';
    if (showGardenerReaction) {
      return '/assets/confuseGardener.png';
    }
    return '/assets/gardener.png';
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

    setTimeout(() => {
      setIsTreeShaking(false);
    }, 850);
  };

  // Clicking an apple:
  // If workload is done (100% or Completed), it shines gold and user picks it up!
  // Otherwise, links to the Workload page
  const handleAppleClick = (workload: WorkloadItem) => {
    const progress = getWorkloadProgress(workload);
    const isDone = progress >= 100 || workload.status === 'Completed';

    setPickedAppleId(workload.id);

    // ONLY trigger celebrating ribbon (confetti) when user successfully picks up a completed apple
    if (isDone) {
      setIsHoldingPickedApple(true);
      harvestApple(workload.id);
      try {
        confetti({
          particleCount: 65,
          spread: 80,
          origin: { y: 0.42 },
          colors: ['#F59E0B', '#FBBF24', '#EF4444', '#10B981', '#FFD700', '#FCD34D']
        });
      } catch {
        // ignore
      }
      setHarvestSuccessWorkload(workload);
      return;
    }

    setSelectedWorkload(workload);
    setActiveWorkloadSubTab('records');

    setTimeout(() => {
      setIsWorkloadDetailOpen(true);
      setActiveTab('workloads');
    }, 380);
  };

  // Clicking Tree Hole links to AI dump stress (AI Dump Chat)
  const handleTreeHoleClick = () => {
    setChatSource('treehole');
    if (!todayCheckIn) {
      setSpeechMessage("🐿️ Squirrel: *Squeak!* Please complete today's check-in first!");
    }
    setActiveTab('chat');
  };

  // Clicking Gardener links to AI chat and asks question about tree health
  const handleGardenerClick = () => {
    setChatSource('gardener');
    sendGardenerQuestionToChat();
    setGardenerHasQuestion(false);
    setIsGardenerQuestionDismissed(true);
    setActiveTab('chat');
  };

  // Clicking Squirrel links to AI chat and provides daily state & load insight
  const handleSquirrelClick = () => {
    setChatSource('treehole');
    sendSquirrelInsightToChat();
    setSpeechMessage("🐿️ Squirrel: *Squeak!* Showing your daily state & load insight!");
    setTimeout(() => {
      setActiveTab('chat');
    }, 280);
  };

  const showTreeHoleNotice = isHoleHovered || isInitialHoleNotice || isLongStayHoleNotice;

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
      {/* Minimalist Sun for Sunny Weather */}
      {weatherInfo.type === 'sunny' && (
        <div
          id="minimalist-sun"
          style={{
            position: 'absolute',
            top: '36px',
            left: '32px',
            pointerEvents: 'none',
            zIndex: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'sunGentleFloat 4s ease-in-out infinite alternate',
          }}
        >
          {/* Outer Sun Glow */}
          <div
            style={{
              position: 'absolute',
              width: '82px',
              height: '82px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(254, 240, 138, 0.5) 0%, rgba(254, 215, 170, 0.22) 45%, rgba(254, 243, 199, 0) 72%)',
              filter: 'blur(6px)',
              animation: 'sunPulse 3s ease-in-out infinite alternate',
            }}
          />

          {/* Minimalist Sun SVG */}
          <svg width="54" height="54" viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="29" cy="29" r="16" fill="url(#sunGradient)" />
            <circle cx="25" cy="25" r="6" fill="rgba(255, 255, 255, 0.38)" />

            {/* 8 Minimalist Slender Ray Accents */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <line
                key={i}
                x1="29"
                y1="5"
                x2="29"
                y2="9.5"
                stroke="#F59E0B"
                strokeWidth="2.2"
                strokeLinecap="round"
                transform={`rotate(${angle} 29 29)`}
                opacity="0.8"
              />
            ))}

            <defs>
              <linearGradient id="sunGradient" x1="15" y1="15" x2="43" y2="43" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDE047" />
                <stop offset="1" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      {/* Minimalist Clouds for Cloudy Weather */}
      {weatherInfo.type === 'cloudy' && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 14, overflow: 'hidden' }}>
          {/* Cloud 1: Upper Left */}
          <div
            style={{
              position: 'absolute',
              top: '44px',
              left: '26px',
              animation: 'cloudDriftLeft 6s ease-in-out infinite alternate',
              opacity: 0.92,
              filter: 'drop-shadow(0 4px 12px rgba(148, 163, 184, 0.2))'
            }}
          >
            <svg width="84" height="42" viewBox="0 0 86 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22 36H66C74.8366 36 82 28.8366 82 20C82 11.5 75.3 4.5 67 4.1C64.5 1.5 61 0 57 0C49.5 0 43.3 5.1 41.6 12.1C39.8 11.4 37.7 11 35.5 11C26.9 11 20 17.9 20 26.5C20 27.2 20.1 27.8 20.2 28.5C18.9 28.2 17.5 28 16 28C9.4 28 4 33.4 4 40C4 40.7 4.1 41.4 4.2 42H22V36Z"
                fill="url(#cloudGrad1)"
              />
              <defs>
                <linearGradient id="cloudGrad1" x1="4" y1="0" x2="82" y2="42" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFFFFF" />
                  <stop offset="1" stopColor="#E2E8F0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Cloud 2: Upper Right Floating Cloud */}
          <div
            style={{
              position: 'absolute',
              top: '105px',
              right: '24px',
              animation: 'cloudDriftRight 7s ease-in-out infinite alternate',
              opacity: 0.85,
              filter: 'drop-shadow(0 3px 10px rgba(148, 163, 184, 0.15))'
            }}
          >
            <svg width="68" height="34" viewBox="0 0 86 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22 36H66C74.8366 36 82 28.8366 82 20C82 11.5 75.3 4.5 67 4.1C64.5 1.5 61 0 57 0C49.5 0 43.3 5.1 41.6 12.1C39.8 11.4 37.7 11 35.5 11C26.9 11 20 17.9 20 26.5C20 27.2 20.1 27.8 20.2 28.5C18.9 28.2 17.5 28 16 28C9.4 28 4 33.4 4 40C4 40.7 4.1 41.4 4.2 42H22V36Z"
                fill="#FFFFFF"
                fillOpacity="0.94"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Minimalist Clouds for Rainy Weather */}
      {weatherInfo.type === 'rainy' && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 14, overflow: 'hidden' }}>
          {/* Moody Rain Cloud 1 */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: '22px',
              animation: 'cloudDriftLeft 5.5s ease-in-out infinite alternate',
              opacity: 0.94,
              filter: 'drop-shadow(0 6px 16px rgba(30, 58, 138, 0.25))'
            }}
          >
            <svg width="90" height="45" viewBox="0 0 86 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22 36H66C74.8366 36 82 28.8366 82 20C82 11.5 75.3 4.5 67 4.1C64.5 1.5 61 0 57 0C49.5 0 43.3 5.1 41.6 12.1C39.8 11.4 37.7 11 35.5 11C26.9 11 20 17.9 20 26.5C20 27.2 20.1 27.8 20.2 28.5C18.9 28.2 17.5 28 16 28C9.4 28 4 33.4 4 40C4 40.7 4.1 41.4 4.2 42H22V36Z"
                fill="url(#rainCloudGrad1)"
              />
              <defs>
                <linearGradient id="rainCloudGrad1" x1="4" y1="0" x2="82" y2="42" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#94A3B8" />
                  <stop offset="1" stopColor="#64748B" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Moody Rain Cloud 2 */}
          <div
            style={{
              position: 'absolute',
              top: '90px',
              right: '24px',
              animation: 'cloudDriftRight 6s ease-in-out infinite alternate',
              opacity: 0.88,
              filter: 'drop-shadow(0 4px 12px rgba(30, 58, 138, 0.18))'
            }}
          >
            <svg width="74" height="38" viewBox="0 0 86 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22 36H66C74.8366 36 82 28.8366 82 20C82 11.5 75.3 4.5 67 4.1C64.5 1.5 61 0 57 0C49.5 0 43.3 5.1 41.6 12.1C39.8 11.4 37.7 11 35.5 11C26.9 11 20 17.9 20 26.5C20 27.2 20.1 27.8 20.2 28.5C18.9 28.2 17.5 28 16 28C9.4 28 4 33.4 4 40C4 40.7 4.1 41.4 4.2 42H22V36Z"
                fill="url(#rainCloudGrad2)"
              />
              <defs>
                <linearGradient id="rainCloudGrad2" x1="4" y1="0" x2="82" y2="42" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#CBD5E1" />
                  <stop offset="1" stopColor="#94A3B8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      )}

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

        {/* Button 2: Calendar shortcut (links to Calendar in Workload page) */}
        <button
          type="button"
          onClick={() => {
            setActiveWorkloadSubTab('calendar');
            setActiveTab('workloads');
          }}
          title="Calendar Schedule"
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
          <Calendar size={17} color="#166534" strokeWidth={2.4} />
        </button>

        {/* Button 3: Workloads shortcut (links to Workload Records tab in Workload page) */}
        <button
          type="button"
          onClick={() => {
            setActiveWorkloadSubTab('records');
            setActiveTab('workloads');
          }}
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
          {/* Obvious glowing callout pill if daily check-in is pending (Soft edge, clean style) */}
          {!todayCheckIn && (
            <div
              style={{
                backgroundColor: 'rgba(254, 243, 199, 0.96)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(245, 158, 11, 0.45)',
                color: '#92400E',
                padding: '4px 10px',
                borderRadius: '16px',
                fontSize: '11px',
                fontWeight: 800,
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.25)',
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
          {(() => {
            const newlyAddedWorkload = workloads.find(w => w.id === newAppleWorkloadId);
            const newProgress = newlyAddedWorkload ? getWorkloadProgress(newlyAddedWorkload) : 0;
            const isGreen = newProgress < 50;

            return (
              <>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: isGreen ? '#DCFCE7' : '#FEE2E2',
                  border: `1.2px solid ${isGreen ? '#86EFAC' : '#FCA5A5'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <img
                    src={isGreen ? '/assets/greenApple.png' : '/assets/redApple.png'}
                    alt="Apple"
                    style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#92400E', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>New {isGreen ? 'Green' : 'Red'} Apple on Tree!</span>
                    <Sparkles size={13} color="#D97706" />
                  </span>
                  <span style={{ fontSize: '11px', color: '#78350F', lineHeight: 1.3 }}>
                    <strong>{newlyAddedWorkload?.title || 'New Task'}</strong> ({newlyAddedWorkload?.remainingTimeHours ?? newlyAddedWorkload?.estimatedHours ?? 2}h) bloomed on your branch!
                  </span>
                </div>
              </>
            );
          })()}
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
            ? (isTreeBent ? 'treeShakeTilted 0.4s ease infinite alternate' : 'treeShake 0.4s ease infinite alternate')
            : (isTreeBent ? 'treeBreezeTilted 5.5s ease-in-out infinite alternate' : 'treeBreeze 6s ease-in-out infinite alternate'),
          transition: 'transform 0.8s cubic-bezier(0.34, 1.2, 0.64, 1)',
          pointerEvents: 'none',
          zIndex: 30
        }}
      >
        {/* Tree Graphic Wrapper (shifted upper to top: 85px) */}
        <div
          id="tree-wrapper"
          style={{
            position: 'absolute',
            top: '85px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '540px',
            height: '670px',
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
              userSelect: 'none',
              transition: 'transform 0.8s cubic-bezier(0.34, 1.25, 0.64, 1)',
              transform: isTreeBent ? 'rotate(1.8deg) skewX(-1.2deg)' : 'rotate(0deg)',
              transformOrigin: '50% 96%'
            }}
          />
        </div>

        {/* Fallen Broken Branches on the Lawn (Right-hand side, just above squirrel) */}
        {(treeInfo.status === 'Overloaded' || isTreeBent) && (
          <div
            id="fallen-broken-branches"
            style={{
              position: 'absolute',
              left: '232px',
              bottom: '214px',
              width: '136px',
              height: '53px',
              pointerEvents: 'none',
              userSelect: 'none',
              zIndex: 22,
              filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.24))',
              transform: 'rotate(-4deg)'
            }}
          >
            <img
              src="/assets/brokenBranches.png"
              alt="Broken Branches on Lawn"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                userSelect: 'none'
              }}
            />
          </div>
        )}

        {/* Decorative Canopy Flowers matching reference photo */}
        {CANOPY_FLOWERS.map(fl => (
          <div
            key={fl.id}
            style={{
              position: 'absolute',
              left: `${fl.x}px`,
              top: `${fl.y}px`,
              transform: `translate(-50%, -50%) rotate(${fl.rotate}deg)`,
              width: `${fl.size}px`,
              height: `${fl.size}px`,
              pointerEvents: 'none',
              zIndex: 28,
              animation: 'flowerFloat 3.8s ease-in-out infinite alternate',
              animationDelay: `${fl.id * 0.9}s`
            }}
          >
            <img
              src="/assets/flower.png"
              alt="Blossom"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))'
              }}
            />
          </div>
        ))}

        {/* Trunk Base Decorative Stones & Grass Blades matching reference photo */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 18 }}>
          {/* Grey Pebble 1 */}
          <div
            style={{
              position: 'absolute',
              left: '172px',
              bottom: '208px',
              width: '20px',
              height: '13px',
              borderRadius: '50% 50% 45% 55%',
              background: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
              transform: 'rotate(-8deg)'
            }}
          />
          {/* Grey Pebble 2 */}
          <div
            style={{
              position: 'absolute',
              left: '190px',
              bottom: '202px',
              width: '15px',
              height: '10px',
              borderRadius: '50% 50% 50% 50%',
              background: 'linear-gradient(135deg, #A1A1AA 0%, #71717A 100%)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.22)',
              transform: 'rotate(5deg)'
            }}
          />
          {/* Grey Pebble 3 on right of trunk */}
          <div
            style={{
              position: 'absolute',
              left: '238px',
              bottom: '205px',
              width: '14px',
              height: '9px',
              borderRadius: '50% 50% 50% 50%',
              background: 'linear-gradient(135deg, #9CA3AF 0%, #64748B 100%)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              transform: 'rotate(-4deg)'
            }}
          />
        </div>

        {/* 3. TREE HOLE (Clickable right over trunk hole -> AI Dump Stress) */}
        <div
          id="clickable-tree-hole"
          onClick={handleTreeHoleClick}
          onMouseEnter={() => setIsHoleHovered(true)}
          onMouseLeave={() => setIsHoleHovered(false)}
          title="Tree Hole: Click to dump stress in AI Chat"
          style={{
            position: 'absolute',
            top: '543px',
            left: '197.5px',
            transform: `translate(-50%, -50%) rotate(2deg) scale(${showTreeHoleNotice ? 1.08 : 1})`,
            width: '54px',
            height: '72px',
            cursor: 'pointer',
            pointerEvents: 'auto',
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {/* Calibrated visible contour outline on hover */}
          <div
            style={{
              width: '38px',
              height: '56px',
              borderRadius: '48% 52% 48% 52% / 54% 54% 46% 46%',
              border: showTreeHoleNotice ? '2.5px solid rgba(253, 224, 71, 0.95)' : '2px solid transparent',
              boxShadow: showTreeHoleNotice ? '0 0 16px rgba(253, 224, 71, 0.85), inset 0 0 10px rgba(253, 224, 71, 0.4)' : 'none',
              transition: 'all 0.18s ease',
              pointerEvents: 'none'
            }}
          />
          {/* Tree Hole Hover Tooltip Callout */}
          {showTreeHoleNotice && (
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
              🕳️ Dump your stress
            </div>
          )}
        </div>

        {/* 4. APPLES (overlapping tree.png -> Workload Page) */}
        {treeApples.map((workload, idx) => {
          const coord = APPLE_COORDINATES[idx % APPLE_COORDINATES.length];
          const isPicked = pickedAppleId === workload.id;
          const isHovered = hoveredApple?.workload.id === workload.id;
          const isNewApple = (animatingAppleId === workload.id) || (newAppleWorkloadId === workload.id);

          // Progress calculation:
          // < 50% progress -> Green Apple
          // >= 50% progress -> Red Apple
          const progress = getWorkloadProgress(workload);

          const isDone = progress >= 100 || workload.status === 'Completed';
          const isGreenApple = !isDone && progress < 50;
          const isRedApple = !isDone && progress >= 50;

          return (
            <div
              key={workload.id}
              id={`apple-workload-${workload.id}`}
              onClick={() => handleAppleClick(workload)}
              onMouseEnter={() =>
                setHoveredApple({ workload, x: coord.x, y: coord.y })
              }
              onMouseLeave={() => setHoveredApple(null)}
              title={isDone
                ? `Done: ${workload.title} - Click to pick up this golden apple!`
                : `Apple: ${workload.title} (${progress}% progress, ${workload.remainingTimeHours ?? workload.estimatedHours}h) - Click to view in Workload page`}
              style={{
                position: 'absolute',
                left: `${coord.x}px`,
                top: `${coord.y}px`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                pointerEvents: 'auto',
                zIndex: isDone ? 36 : 30,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              {/* Badge above Apple: Done (Shining Gold Tap to Pick Up!) vs New Apple Bloomed */}
              {isDone ? (
                <div
                  style={{
                    marginBottom: '3px',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: '#FFFFFF',
                    padding: '2.5px 7px',
                    borderRadius: '12px',
                    fontSize: '9px',
                    fontWeight: 900,
                    boxShadow: '0 3px 12px rgba(245, 158, 11, 0.75)',
                    animation: 'goldPickBounce 1.6s ease-in-out infinite',
                    letterSpacing: '0.3px',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    zIndex: 40,
                    border: '1.2px solid #FEF08A'
                  }}
                >
                  <span>✨ Tap to pick up! 🧺</span>
                </div>
              ) : isNewApple ? (
                <div
                  style={{
                    marginBottom: '2px',
                    backgroundColor: isGreenApple ? '#15803D' : '#DC2626',
                    color: '#FFFFFF',
                    padding: '2px 7px',
                    borderRadius: '10px',
                    fontSize: '9.5px',
                    fontWeight: 900,
                    boxShadow: `0 3px 10px ${isGreenApple ? 'rgba(21, 128, 61, 0.45)' : 'rgba(220, 38, 38, 0.45)'}`,
                    animation: 'fadeInUp 0.3s ease',
                    letterSpacing: '0.3px',
                    whiteSpace: 'nowrap',
                    zIndex: 35
                  }}
                >
                  ✨ +1 New {isGreenApple ? 'Green' : 'Red'} Apple!
                </div>
              ) : null}

              {/* Apple Image */}
              <div
                style={{
                  position: 'relative',
                  width: '40px',
                  height: '44px',
                  transform: `rotate(${coord.rotate}deg) scale(${isPicked ? 1.4 : isHovered ? 1.25 : isNewApple ? 1.15 : isDone ? 1.12 : 1})`,
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
                {/* Golden Glow Halo for Newly Bloomed Apple (not shown when completed) */}
                {isNewApple && !isDone && (
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

                {/* Apple Image: only outer line of apple shape has gold line when done */}
                <img
                  src={isGreenApple ? '/assets/greenApple.png' : '/assets/redApple.png'}
                  alt={isGreenApple ? 'Green Apple (Progress < 50%)' : 'Red Apple (Progress >= 50%)'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                    filter: isDone
                      ? 'drop-shadow(1.5px 0 0 #F59E0B) drop-shadow(-1.5px 0 0 #F59E0B) drop-shadow(0 1.5px 0 #F59E0B) drop-shadow(0 -1.5px 0 #F59E0B) drop-shadow(0 0 3px rgba(245, 158, 11, 0.75))'
                      : isNewApple
                        ? `drop-shadow(0 0 16px rgba(245, 158, 11, 0.95)) drop-shadow(0 0 8px ${isGreenApple ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)'})`
                        : isHovered
                          ? `drop-shadow(0 0 10px ${isGreenApple ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)'}) drop-shadow(0 4px 8px rgba(0,0,0,0.25))`
                          : 'drop-shadow(0 3px 6px rgba(0,0,0,0.2))'
                  }}
                />

                {/* Progress Pill Tag Centered on Apple */}
                <div
                  style={{
                    position: 'absolute',
                    top: '55%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: isDone ? 'rgba(217, 119, 6, 0.92)' : 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(2px)',
                    borderRadius: '6px',
                    padding: '1px 4px',
                    fontSize: '9px',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    lineHeight: 1,
                    pointerEvents: 'none',
                    border: isDone ? '1px solid rgba(254, 240, 138, 0.8)' : 'none'
                  }}
                >
                  {isDone ? '100%' : `${progress}%`}
                </div>
              </div>

              {/* Workload Title Pill */}
              <div
                style={{
                  marginTop: '2px',
                  backgroundColor: isDone ? '#FEF3C7' : 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(6px)',
                  padding: '1px 6px',
                  borderRadius: '8px',
                  border: isDone
                    ? '1.2px solid #F59E0B'
                    : isGreenApple
                      ? '1px solid rgba(21, 128, 61, 0.4)'
                      : '1px solid rgba(220, 38, 38, 0.35)',
                  boxShadow: isDone ? '0 2px 8px rgba(245, 158, 11, 0.35)' : '0 2px 6px rgba(0,0,0,0.1)',
                  maxWidth: '72px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: '9px',
                  fontWeight: 800,
                  color: isDone ? '#92400E' : isGreenApple ? '#166534' : '#991B1B',
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
      {/* 5. GARDENER (gardener_basket when ready to pick, gardener_apple after pick) */}
      {/* ========================================================================= */}
      <div
        id="clickable-gardener"
        onClick={handleGardenerClick}
        onMouseEnter={() => setIsGardenerHovered(true)}
        onMouseLeave={() => setIsGardenerHovered(false)}
        title={
          isHoldingPickedApple
            ? "Gardener Nicole: Apple harvested! Click to chat with AI"
            : hasDoneApplesToPick
              ? "Gardener Nicole: Ready with basket to harvest! Click to chat with AI"
              : "Gardener Nicole: Click to chat with AI"
        }
        style={{
          position: 'absolute',
          left: '12px',
          bottom: '108px',
          width: '182px',
          height: '215px',
          cursor: 'pointer',
          zIndex: 25,
          transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: isGardenerHovered ? 'scale(1.05)' : 'scale(1)',
          filter: isGardenerHovered
            ? 'drop-shadow(0 0 14px rgba(34, 197, 94, 0.7))'
            : 'drop-shadow(0 4px 10px rgba(0,0,0,0.18))'
        }}
      >
        <img
          src={gardenerImageSrc}
          alt={
            isHoldingPickedApple
              ? "Gardener with Picked Apple"
              : hasDoneApplesToPick
                ? "Gardener with Harvest Basket"
                : "Gardener"
          }
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            userSelect: 'none'
          }}
        />

        {/* Badge 1: Holding Picked Apple (Active after picking an apple) */}
        {isHoldingPickedApple && (
          <div
            id="gardener-apple-badge"
            style={{
              position: 'absolute',
              top: '-32px',
              left: '42%',
              transform: 'translateX(-50%)',
              zIndex: 35,
              backgroundColor: '#15803D',
              color: '#FFFFFF',
              border: '1.5px solid #86EFAC',
              borderRadius: '12px',
              padding: '2px 8px',
              fontSize: '10px',
              fontWeight: 900,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(21, 128, 61, 0.45)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              animation: 'goldPickBounce 1.6s ease-in-out infinite'
            }}
          >
            <span>🍎 Picked Apple!</span>
          </div>
        )}

        {/* Badge 2: Ready to harvest with basket (When finished apple awaits pickup) */}
        {!isHoldingPickedApple && hasDoneApplesToPick && (
          <div
            id="gardener-basket-badge"
            style={{
              position: 'absolute',
              top: '-32px',
              left: '42%',
              transform: 'translateX(-50%)',
              zIndex: 35,
              backgroundColor: '#D97706',
              color: '#FFFFFF',
              border: '1.5px solid #FEF08A',
              borderRadius: '12px',
              padding: '2px 8px',
              fontSize: '10px',
              fontWeight: 900,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.45)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              animation: 'goldPickBounce 1.6s ease-in-out infinite'
            }}
          >
            <span>🧺 Ready to pick!</span>
          </div>
        )}

        {/* Animated Question Mark to Notice & Click (triggered only after tree tilts when not picking) */}
        {!isHoldingPickedApple && !hasDoneApplesToPick && showGardenerReaction && (
          <div
            id="gardener-question-badge"
            style={{
              position: 'absolute',
              top: '-36px',
              left: '42%',
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
                backgroundColor: '#FFFFFF',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(220, 38, 38, 0.65), 0 4px 10px rgba(0,0,0,0.25)',
                border: '2.5px solid #DC2626'
              }}
            >
              <span
                style={{
                  color: '#DC2626',
                  fontSize: '21px',
                  fontWeight: 900,
                  lineHeight: '1',
                  fontFamily: "'Outfit', -apple-system, sans-serif",
                  transform: 'translateY(-1px)'
                }}
              >
                ?
              </span>
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
        {isGardenerHovered && !isHoldingPickedApple && !hasDoneApplesToPick && !showGardenerReaction && (
          <div
            style={{
              position: 'absolute',
              top: '-32px',
              left: '42%',
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
            👨‍🌾 What's going on?
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
          left: '265px',
          bottom: '144px',
          width: '64px',
          height: '64px',
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
              border: '0px solid #FDBA74',
              borderRadius: '12px',
              padding: '3px 8px',
              fontSize: '10.5px',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              pointerEvents: 'none',
              animation: 'fadeInUp 0.15s ease'
            }}
          >
            🐿️ Daily Insight!
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6B. HARVEST BASKET BUTTON ON LAWN (Basket icon only, safe clearance above navbar) */}
      {/* ========================================================================= */}
      <button
        type="button"
        id="tree-harvest-basket-btn"
        onClick={() => setShowHarvestBasketModal(true)}
        title={`Harvest Basket: ${harvestedAppleIds.length} picked apples`}
        style={{
          position: 'absolute',
          bottom: '104px',
          right: '18px',
          zIndex: 35,
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '2px solid #F59E0B',
          boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35), 0 2px 6px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 18px rgba(245, 158, 11, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 14px rgba(245, 158, 11, 0.35), 0 2px 6px rgba(0,0,0,0.1)';
        }}
      >
        <span style={{ fontSize: '20px', lineHeight: 1, userSelect: 'none' }}>🧺</span>
        {harvestedAppleIds.length > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#F59E0B',
              color: '#FFFFFF',
              borderRadius: '10px',
              fontSize: '10px',
              fontWeight: 900,
              minWidth: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
              border: '1.5px solid #FFFFFF',
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              lineHeight: 1
            }}
          >
            {harvestedAppleIds.length}
          </span>
        )}
      </button>

      {/* ========================================================================= */}
      {/* 6C. CELEBRATION MODAL: GOLDEN APPLE HARVESTED (gardener_apple + balance button) */}
      {/* ========================================================================= */}
      {harvestSuccessWorkload && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.48)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 210,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFBEB 100%)',
            borderRadius: '24px',
            border: '2px solid #F59E0B',
            boxShadow: '0 20px 50px rgba(245, 158, 11, 0.4)',
            maxWidth: '340px',
            width: '100%',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '12px',
            position: 'relative',
            animation: 'fadeInUp 0.3s ease'
          }}>
            {/* Top-Right Dismiss Cross */}
            <button
              type="button"
              onClick={() => setHarvestSuccessWorkload(null)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: 'none',
                borderRadius: '50%',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#92400E'
              }}
              title="Close"
            >
              <X size={15} />
            </button>

            {/* Top Badge: gardener_apple picture replacing red apple */}
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              backgroundColor: '#FEF3C7',
              border: '2.5px solid #F59E0B',
              boxShadow: '0 0 24px rgba(245, 158, 11, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              animation: 'goldPulseGlow 2s infinite alternate',
              overflow: 'hidden'
            }}>
              <img
                src="/assets/gardener_apple.png"
                alt="Gardener with Apple"
                style={{
                  width: '78px',
                  height: '78px',
                  objectFit: 'contain'
                }}
              />
              <span style={{ position: 'absolute', top: '2px', right: '4px', fontSize: '18px' }}>✨</span>
            </div>

            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Golden Harvest Complete!
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#92400E', margin: '4px 0 0 0' }}>
                Apple Picked Up!
              </h3>
            </div>

            <p style={{ fontSize: '12.5px', color: '#78350F', margin: 0, lineHeight: 1.4 }}>
              Congratulations! You completed <strong>"{harvestSuccessWorkload.title}"</strong> and picked its shining golden apple from your tree!
            </p>

            <div style={{
              backgroundColor: '#FEF3C7',
              border: '1px solid #FDE68A',
              borderRadius: '12px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 800,
              color: '#B45309',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>🧺 Added to Harvest Basket</span>
              <span style={{ backgroundColor: '#F59E0B', color: '#FFFFFF', padding: '1px 6px', borderRadius: '8px', fontSize: '11px' }}>
                {harvestedAppleIds.length} Picked
              </span>
            </div>

            {/* Action Buttons: Keep Harvesting & View Details */}
            <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '6px' }}>
              <button
                type="button"
                id="btn-keep-harvesting"
                onClick={() => setHarvestSuccessWorkload(null)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#15803D',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(21, 128, 61, 0.3)'
                }}
              >
                Keep Harvesting
              </button>

              <button
                type="button"
                id="btn-view-harvest-details"
                onClick={() => {
                  setSelectedWorkload(harvestSuccessWorkload);
                  setHarvestSuccessWorkload(null);
                  setActiveWorkloadSubTab('records');
                  setIsWorkloadDetailOpen(true);
                  setActiveTab('workloads');
                }}
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#FFFFFF',
                  color: '#92400E',
                  border: '1px solid #FCD34D',
                  borderRadius: '14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6D. HARVEST BASKET MODAL                                                  */}
      {/* ========================================================================= */}
      {showHarvestBasketModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.48)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 210,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            maxWidth: '350px',
            width: '100%',
            maxHeight: '75vh',
            overflowY: 'auto',
            padding: '20px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            border: '2px solid #FDE68A'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🧺</span>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#92400E', margin: 0 }}>
                    Harvest Basket
                  </h3>
                  <span style={{ fontSize: '11px', color: '#B45309', fontWeight: 600 }}>
                    {harvestedAppleIds.length} Golden Apples Picked
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHarvestBasketModal(false)}
                style={{
                  border: 'none',
                  background: '#F1F5F9',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {harvestedAppleIds.length === 0 ? (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '32px' }}>🌳</span>
                <p style={{ fontSize: '13px', margin: 0, fontWeight: 600 }}>Your basket is currently empty!</p>
                <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: 0 }}>
                  Complete your tasks on the tree! When an apple is 100% done, it will shine with a gold line so you can tap and pick it up.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {workloads.filter(w => harvestedAppleIds.includes(w.id)).map(w => (
                  <div
                    key={w.id}
                    onClick={() => {
                      setSelectedWorkload(w);
                      setShowHarvestBasketModal(false);
                      setActiveWorkloadSubTab('records');
                      setIsWorkloadDetailOpen(true);
                      setActiveTab('workloads');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '14px',
                      backgroundColor: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: '#FEF3C7',
                      border: '1.5px solid #F59E0B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <img src="/assets/redApple.png" alt="Apple" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#92400E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {w.title}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#B45309', fontWeight: 600 }}>
                        Harvested • {w.estimatedHours}h
                      </div>
                    </div>
                    <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#15803D', backgroundColor: '#DCFCE7', padding: '2px 6px', borderRadius: '8px' }}>
                      Done ✨
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowHarvestBasketModal(false)}
              style={{
                padding: '10px',
                backgroundColor: '#92400E',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '14px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: '4px'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

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
        @keyframes goldPulseRing {
          0% {
            transform: scale(0.96);
            box-shadow: 0 0 10px #FBBF24, 0 0 18px #F59E0B, inset 0 0 6px #F59E0B;
          }
          100% {
            transform: scale(1.1);
            box-shadow: 0 0 20px #FBBF24, 0 0 32px #F59E0B, inset 0 0 12px #FBBF24;
          }
        }
        @keyframes goldPulseGlow {
          0% {
            filter: drop-shadow(0 0 6px #F59E0B) drop-shadow(0 0 14px #FBBF24);
            transform: scale(1.08) rotate(0deg);
          }
          50% {
            filter: drop-shadow(0 0 12px #F59E0B) drop-shadow(0 0 24px #FBBF24) drop-shadow(0 0 32px #FCD34D);
            transform: scale(1.16) rotate(2deg);
          }
          100% {
            filter: drop-shadow(0 0 6px #F59E0B) drop-shadow(0 0 14px #FBBF24);
            transform: scale(1.08) rotate(0deg);
          }
        }
        @keyframes goldPickBounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px) scale(1.05);
          }
        }
        @keyframes treeBreeze {
          0% { transform: rotate(-0.6deg); }
          100% { transform: rotate(0.6deg); }
        }
        @keyframes treeBreezeTilted {
          0% { transform: rotate(2.8deg); }
          100% { transform: rotate(4.2deg); }
        }
        @keyframes treeShake {
          0% { transform: rotate(-2.2deg) scale(1.02); }
          50% { transform: rotate(2.2deg) scale(1.02); }
          100% { transform: rotate(-1.5deg) scale(1.01); }
        }
        @keyframes treeShakeTilted {
          0% { transform: rotate(1.4deg) scale(1.02); }
          50% { transform: rotate(5.4deg) scale(1.02); }
          100% { transform: rotate(2.2deg) scale(1.01); }
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
        @keyframes flowerFloat {
          0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
          50% { transform: translate(-50%, -54%) rotate(4deg) scale(1.04); }
          100% { transform: translate(-50%, -50%) rotate(-2deg) scale(1); }
        }
        @keyframes sunGentleFloat {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-4px); }
        }
        @keyframes sunPulse {
          0% { transform: scale(0.95); opacity: 0.55; }
          100% { transform: scale(1.08); opacity: 0.85; }
        }
        @keyframes cloudDriftLeft {
          0% { transform: translateX(0px); }
          100% { transform: translateX(12px); }
        }
        @keyframes cloudDriftRight {
          0% { transform: translateX(0px); }
          100% { transform: translateX(-10px); }
        }
        @keyframes gardenerReact {
          0% { transform: scale(1); }
          40% { transform: scale(1.12) translateY(-4px); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
