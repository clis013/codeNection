import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';
import { getDemandLabel } from '../utils/demandHelpers';
import {
  Sparkles, AlertTriangle, ArrowRight, Brain,
  Clock, ChevronDown, ChevronUp, Scale, CheckCircle2,
  Activity, Info, BarChart3, Layers, Zap, Heart,
  ShieldCheck, Gauge
} from 'lucide-react';

export const StressWorkloadMapView: React.FC = () => {
  const {
    workloads,
    todayCheckIn,
    capacityProfile,
    setActiveTab,
    setSelectedWorkload,
    setIsWorkloadDetailOpen,
    chatMessages,
  } = useApp();

  // "Why we're seeing this" accordion is closed by default as requested
  const [isExplanationOpen, setIsExplanationOpen] = useState<boolean>(false);

  // Open Time Info Popover state
  const [isOpenTimeInfoOpen, setIsOpenTimeInfoOpen] = useState<boolean>(false);

  // Demand Profile Pie Chart Hovered/Selected Slice
  const [activeDemandSlice, setActiveDemandSlice] = useState<'cognitive' | 'emotional' | 'physical'>('cognitive');

  // Workload Area Distribution Pie Chart Hovered/Selected Slice
  const [activeAreaSlice, setActiveAreaSlice] = useState<'Academic' | 'Social' | 'Self-Care'>('Academic');

  const activeWorkloads = workloads.filter(w => w.status === 'Active');

  // Nearest priority task (e.g., Database Assignment)
  const priorityTask = activeWorkloads.find(w => w.title.toLowerCase().includes('database')) || activeWorkloads[0];

  // 1. STRESS & DEMAND-RESOURCE STATUS & CARD THEME (IDENTICAL TO HOME VIEW STATE & LOAD INSIGHT)
  const status = capacityProfile.analysisResult.demandResourceStatus;
  const isMan = status === 'Manageable';
  const isOver = status === 'Overloaded';
  const isStrain = status === 'Strained';
  const isInsufficient = status === 'InsufficientData';
  const cardTheme = isMan ? {
    outerBg: 'linear-gradient(135deg, rgba(240, 253, 244, 0.88) 0%, rgba(220, 252, 231, 0.68) 100%)',
    outerBorder: '1.5px solid #86EFAC',
    shadow: '0 8px 30px rgba(22, 101, 52, 0.08)',
    dotColor: '#16A34A',
    titleColor: '#166534',
    badgeBg: '#DCFCE7',
    badgeBorder: '#86EFAC',
    badgeText: '#166534',
    innerBorder: '#DCFCE7',
    accentColor: '#16A34A',
    captionColor: '#166534',
    statusLabel: 'MANAGEABLE'
  } : isOver ? {
    outerBg: 'linear-gradient(135deg, rgba(254, 242, 242, 0.88) 0%, rgba(254, 226, 226, 0.68) 100%)',
    outerBorder: '1.5px solid #FECACA',
    shadow: '0 8px 30px rgba(220, 38, 38, 0.08)',
    dotColor: '#DC2626',
    titleColor: '#991B1B',
    badgeBg: '#FEE2E2',
    badgeBorder: '#FECACA',
    badgeText: '#991B1B',
    innerBorder: '#FEE2E2',
    accentColor: '#DC2626',
    captionColor: '#991B1B',
    statusLabel: 'OVERLOADED'
  } : isStrain ? {
    outerBg: 'linear-gradient(135deg, rgba(254, 252, 232, 0.88) 0%, rgba(254, 243, 199, 0.68) 100%)',
    outerBorder: '1.5px solid #FDE68A',
    shadow: '0 8px 30px rgba(217, 119, 6, 0.08)',
    dotColor: '#D97706',
    titleColor: '#92400E',
    badgeBg: '#FEF3C7',
    badgeBorder: '#FDE68A',
    badgeText: '#92400E',
    innerBorder: '#FEF3C7',
    accentColor: '#D97706',
    captionColor: '#92400E',
    statusLabel: 'STRAINED'
  } : {
    // InsufficientData
    outerBg: 'linear-gradient(135deg, rgba(248, 250, 252, 0.88) 0%, rgba(241, 245, 249, 0.68) 100%)',
    outerBorder: '1.5px solid #E2E8F0',
    shadow: '0 8px 30px rgba(100, 116, 139, 0.08)',
    dotColor: '#94A3B8',
    titleColor: '#334155',
    badgeBg: '#F1F5F9',
    badgeBorder: '#E2E8F0',
    badgeText: '#475569',
    innerBorder: '#F1F5F9',
    accentColor: '#64748B',
    captionColor: '#475569',
    statusLabel: 'UNKNOWN'
  };

  const currentLoadStatus: 'MANAGEABLE' | 'STRAINED' | 'OVERLOAD' =
    isOver ? 'OVERLOAD' : isMan ? 'MANAGEABLE' : 'STRAINED';

  // No fallback to a hardcoded stress category — if no check-in, mismatch detection
  // uses the actual missing state rather than fabricating a value.
  const perceivedStressCategory = todayCheckIn?.category ?? null;

  // 2. STRESS & LOAD MISMATCH CONDITION
  const mismatch = capacityProfile.analysisResult.mismatch;
  const hasMismatch = mismatch.detected;
  const isHighStressManageable = mismatch.type === 'HighStressManageableLoad';
  const isNormalStressOverloaded = mismatch.type === 'NormalStressOverloadedLoad';

  // 3. DEMAND PROFILES — using centralized getDemandLabel() from demandHelpers
  // (1-2=Low, 3=Moderate, 4-5=High — single source of truth)
  const demandCounts = {
    cognitive: { high: 0, moderate: 0, low: 0 },
    emotional: { high: 0, moderate: 0, low: 0 },
    physical: { high: 0, moderate: 0, low: 0 }
  };

  activeWorkloads.forEach(item => {
    const cogLabel = getDemandLabel(item.demandProfile.cognitive);
    if (cogLabel === 'High') demandCounts.cognitive.high++;
    else if (cogLabel === 'Moderate') demandCounts.cognitive.moderate++;
    else demandCounts.cognitive.low++;

    const emoLabel = getDemandLabel(item.demandProfile.emotional);
    if (emoLabel === 'High') demandCounts.emotional.high++;
    else if (emoLabel === 'Moderate') demandCounts.emotional.moderate++;
    else demandCounts.emotional.low++;

    const phyLabel = getDemandLabel(item.demandProfile.physical);
    if (phyLabel === 'High') demandCounts.physical.high++;
    else if (phyLabel === 'Moderate') demandCounts.physical.moderate++;
    else demandCounts.physical.low++;
  });

  // SVG circle circumference for r=38 is 2 * PI * 38 = 238.76
  const CIRCLE_CIRCUMFERENCE = 238.76;

  // 4. LIVE DEMAND DONUT CALCULATIONS (derived from workload demand scores)
  const cogScoreSum = activeWorkloads.reduce((acc, w) => acc + (w.demandProfile?.cognitive || 1), 0);
  const emoScoreSum = activeWorkloads.reduce((acc, w) => acc + (w.demandProfile?.emotional || 1), 0);
  const phyScoreSum = activeWorkloads.reduce((acc, w) => acc + (w.demandProfile?.physical || 1), 0);
  const totalDemandScore = cogScoreSum + emoScoreSum + phyScoreSum || 1;

  const cogPct = Math.round((cogScoreSum / totalDemandScore) * 100);
  const emoPct = Math.round((emoScoreSum / totalDemandScore) * 100);
  const phyPct = Math.max(0, 100 - cogPct - emoPct);

  const cogDash = Number(((cogPct / 100) * CIRCLE_CIRCUMFERENCE).toFixed(2));
  const emoDash = Number(((emoPct / 100) * CIRCLE_CIRCUMFERENCE).toFixed(2));
  const phyDash = Number(((phyPct / 100) * CIRCLE_CIRCUMFERENCE).toFixed(2));

  const cogOffset = 0;
  const emoOffset = -cogDash;
  const phyOffset = -(cogDash + emoDash);

  // 5. WORKLOAD AREA COUNTS & PERCENTAGES (DYNAMICALLY BASED ON NUMBER OF TASKS)
  const totalActiveTasks = activeWorkloads.length;
  const rawAcademicTasks = activeWorkloads.filter(w => w.area === 'Academic').length;
  const rawSocialTasks = activeWorkloads.filter(w => w.area === 'Social' || w.area === 'Personal').length;
  const rawSelfCareTasks = activeWorkloads.filter(w => w.area === 'Self-Care').length;

  const academicTasks = totalActiveTasks > 0 ? rawAcademicTasks : 0;
  const socialTasks = totalActiveTasks > 0 ? rawSocialTasks : 0;
  const selfCareTasks = totalActiveTasks > 0 ? rawSelfCareTasks : 0;
  const totalAreaTasks = totalActiveTasks > 0 ? totalActiveTasks : 1;

  const academicPct = Math.round((academicTasks / totalAreaTasks) * 100);
  const socialPct = Math.round((socialTasks / totalAreaTasks) * 100);
  const selfCarePct = Math.max(0, 100 - academicPct - socialPct);

  const academicDash = Number(((academicPct / 100) * CIRCLE_CIRCUMFERENCE).toFixed(2));
  const socialDash = Number(((socialPct / 100) * CIRCLE_CIRCUMFERENCE).toFixed(2));
  const selfCareDash = Number(((selfCarePct / 100) * CIRCLE_CIRCUMFERENCE).toFixed(2));

  const academicOffset = 0;
  const socialOffset = -academicDash;
  const selfCareOffset = -(academicDash + socialDash);

  const isStressDumpConfirmed = activeWorkloads.some(w => w.id === 'tech-carnival-sponsorship') ||
    activeWorkloads.some(w => w.id === 'web-programming-group' && (w.remainingTimeHours === 18 || (w as any).estimatedHours === 18)) ||
    (chatMessages && chatMessages.some(m => m.nicoleConfirmed));

  const getLoadAnalysis = () => {
    // ============================================================
    // 1. INSUFFICIENT DATA / CHECK-IN NOT COMPLETED
    // ============================================================
    if (!todayCheckIn || isInsufficient) {
      return {
        badgeLabel: 'Pending Check-in',

        overallInterpretation:
          "Your workload is recorded, but we still needs today's check-in to understand how manageable it feels for you.",

        recentPattern:
          "Today's stress, energy and sense of control are not available yet.",

        whySections: {
          time:
            "You already have several commitments due over the upcoming week.",

          demand:
            "Some of your recorded academic tasks require high mental effort.",

          resources:
            "Today's energy, stress and sense of control are still unknown.",

          mainContributors:
            "The Operating System Quiz and Web Programming assignment are your nearest major commitments.",

          supportingPattern:
            "Complete today's check-in to compare your current state with your recent pattern."
        }
      };
    }

    // ============================================================
    // 2. OVERLOADED
    // ============================================================
    if (isOver) {

      // ----------------------------------------------------------
      // AFTER STRESS DUMP
      // ----------------------------------------------------------
      if (isStressDumpConfirmed) {
        return {
          badgeLabel: 'Overloaded',

          overallInterpretation:
            "Your workload is more overloaded than it first appeared. The additional Web Programming responsibility and Tech Carnival Sponsorship create even more competition around your closest deadlines.",

          recentPattern:
            "Today is much more demanding than usual for you: stress is well above your usual level, while energy and control are well below it.",

          whySections: {
            time:
              "About 37h of work is due within the next 7 days, but only 19h of candidate calendar time is available. At least 18h currently has nowhere to fit.",

            demand:
              "3 of your 5 active workloads have high cognitive demand. Tech Carnival Sponsorship also adds high emotional and social demand alongside your academic work.",

            resources:
              "Your energy and sense of control are both much lower than usual today, while your confidence in handling your workload is also lower than usual.",

            mainContributors:
              "The immediate bottleneck is 5h for the OS Quiz by Sep 10 morning, 6h for Sponsorship by Sep 10 evening, and 18h of Web Programming work by Sep 11.",

            supportingPattern: [
              "5 of the last 7 days were Strained or Overloaded.",
              "3 of those days occurred consecutively.",
              "Low energy appeared on 4 of the last 7 days."
            ]
          }
        };
      }

      // ----------------------------------------------------------
      // BEFORE STRESS DUMP
      // ----------------------------------------------------------
      return {
        badgeLabel: 'Overloaded',

        overallInterpretation:
          "Your current workload is overloaded mainly because several large academic commitments are competing for limited time while your energy and sense of control are unusually low.",

        recentPattern:
          "Today is much more demanding than usual for you: stress is well above your usual level, while energy and control are well below it.",

        whySections: {
          time:
            "About 25h of work is due within the next 7 days, but only 19h of candidate calendar time is available. At least 6h currently has nowhere to fit.",

          demand:
            "3 of your 4 active workloads have high cognitive demand: the OS Quiz, Web Programming assignment and FCG Test.",

          resources:
            "Your energy and sense of control are both much lower than usual today, while your confidence in handling your workload is also lower than usual.",

          mainContributors:
            "The immediate pressure comes from 5h of OS Quiz preparation due Sep 10 and 12h of Web Programming work due Sep 11. The 8h FCG Test preparation follows soon after.",

          supportingPattern: [
            "5 of the last 7 days were Strained or Overloaded.",
            "3 of those days occurred consecutively.",
            "Low energy appeared on 4 of the last 7 days."
          ]
        }
      };
    }

    // ============================================================
    // 3. STRAINED
    // ============================================================
    if (isStrain) {
      return {
        badgeLabel: 'Strained',

        overallInterpretation:
          "Your current workload is creating noticeable pressure, but it may still be manageable with some adjustment.",

        recentPattern:
          "Recent check-ins suggest that pressure is starting to increase.",

        whySections: {
          time:
            "Your upcoming work is getting close to the amount of open time available before its deadlines.",

          demand:
            "Several upcoming commitments require sustained mental effort.",

          resources:
            "Your energy or sense of control is lower than usual today.",

          mainContributors:
            "Some nearby deadlines are competing for the same focus time.",

          supportingPattern:
            "Recent check-ins suggest pressure is increasing rather than staying stable."
        }
      };
    }

    // ============================================================
    // 4. MANAGEABLE
    // ============================================================
    return {
      badgeLabel: 'Manageable',

      overallInterpretation:
        "Your current commitments appear manageable with the time and resources available right now.",

      recentPattern:
        "Your recent check-ins appear relatively stable.",

      whySections: {
        time:
          "Your recorded work appears to fit within the available time before its deadlines.",

        demand:
          "Your current workload does not show a major concentration of demand.",

        resources:
          "Today's check-in does not show a strong resource constraint.",

        mainContributors:
          "No single recorded commitment is creating a major source of pressure right now.",

        supportingPattern:
          "Recent check-ins do not show a clear build-up of strain."
      }
    };
  };

  const loadAnalysis = getLoadAnalysis();

  return (
    <div style={{
      padding: '12px 18px 36px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
      fontFamily: "'Outfit', -apple-system, sans-serif"
    }}>

      {/* TOP HEADER */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <h1 className="serif-title" style={{
          fontSize: '24px',
          fontWeight: 700,
          color: Colors.textDark,
          margin: 0,
          letterSpacing: '-0.4px'
        }}>
          Stress & Workload Map
        </h1>
        <span style={{ fontSize: '12px', color: Colors.textMuted, fontWeight: 500 }}>
          Demand–Resource Analysis & Feasibility Map
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 1. YOUR CURRENT LOAD (PICTURE 3 & 4 SHORTER & CLEARER UI)                 */}
      {/* ========================================================================= */}
      <div style={{
        background: cardTheme.outerBg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '26px',
        padding: '18px',
        border: cardTheme.outerBorder,
        boxShadow: `${cardTheme.shadow}, inset 0 1px 2px rgba(255, 255, 255, 0.95)`,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Header: Title on Left, Badge on Right */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: Colors.textDark, margin: 0 }}>
            Your Current Load
          </h3>
          <span style={{
            backgroundColor: cardTheme.badgeBg,
            color: cardTheme.badgeText,
            border: `1px solid ${cardTheme.badgeBorder}`,
            borderRadius: '14px',
            padding: '3px 12px',
            fontSize: '12px',
            fontWeight: 800
          }}>
            {loadAnalysis.badgeLabel}
          </span>
        </div>

        {/* Overall interpretation (1–2 short sentences explaining what the state means) */}
        <div style={{
          fontSize: '13px',
          color: Colors.textDark,
          lineHeight: 1.45,
          margin: 0
        }}>
          {loadAnalysis.overallInterpretation}
        </div>

        {/* Inner White Container */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.88)',
          borderRadius: '18px',
          padding: '14px 16px',
          border: `1px solid ${cardTheme.innerBorder}`,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {/* Recent pattern */}
          <div>
            <span style={{ fontSize: '12px', fontWeight: 800, color: cardTheme.titleColor }}>
              Recent pattern
            </span>
            <p style={{ fontSize: '12.5px', color: Colors.textDark, lineHeight: 1.45, margin: '3px 0 0 0' }}>
              {loadAnalysis.recentPattern}
            </p>
          </div>

          <div style={{ height: '1px', backgroundColor: 'rgba(0, 0, 0, 0.05)', margin: '2px 0' }} />

          {/* Collapsible Accordion: Why? */}
          <button
            type="button"
            onClick={() => setIsExplanationOpen(!isExplanationOpen)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '12px', color: cardTheme.titleColor }}>
              Why?
            </span>
            {isExplanationOpen ? <ChevronUp size={16} color={cardTheme.accentColor} /> : <ChevronDown size={16} color={cardTheme.accentColor} />}
          </button>

          {isExplanationOpen && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              paddingTop: '6px',
              borderTop: '1px solid rgba(0, 0, 0, 0.05)'
            }}>
              {/* Time */}
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: cardTheme.accentColor, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Time
                </span>
                <p style={{ fontSize: '12px', color: '#334155', lineHeight: 1.45, margin: '2px 0 0 0' }}>
                  {loadAnalysis.whySections.time}
                </p>
              </div>

              {/* Demand */}
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: cardTheme.accentColor, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Demand
                </span>
                <p style={{ fontSize: '12px', color: '#334155', lineHeight: 1.45, margin: '2px 0 0 0' }}>
                  {loadAnalysis.whySections.demand}
                </p>
              </div>

              {/* Resources */}
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: cardTheme.accentColor, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Resources
                </span>
                <p style={{ fontSize: '12px', color: '#334155', lineHeight: 1.45, margin: '2px 0 0 0' }}>
                  {loadAnalysis.whySections.resources}
                </p>
              </div>

              {/* Main contributors */}
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: cardTheme.accentColor, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Main contributors
                </span>
                <p style={{ fontSize: '12px', color: '#334155', lineHeight: 1.45, margin: '2px 0 0 0' }}>
                  {loadAnalysis.whySections.mainContributors}
                </p>
              </div>

              {/* Recent pattern (supporting trend) */}
              {loadAnalysis.whySections.supportingPattern && (
                <div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: cardTheme.accentColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px'
                  }}>
                    Supporting pattern
                  </span>

                  {Array.isArray(loadAnalysis.whySections.supportingPattern) ? (
                    <ul style={{
                      margin: '5px 0 0 0',
                      paddingLeft: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      {loadAnalysis.whySections.supportingPattern.map((pattern, index) => (
                        <li
                          key={index}
                          style={{
                            fontSize: '12px',
                            color: '#334155',
                            lineHeight: 1.45
                          }}
                        >
                          {pattern}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ fontSize: '12px', color: '#334155', lineHeight: 1.45, margin: '2px 0 0 0' }}>
                      {loadAnalysis.whySections.supportingPattern}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STRESS & LOAD MISMATCH CARD [CONDITIONAL: ONLY SHOWS IF MISMATCH EXISTS]*/}
      {/* ========================================================================= */}
      {hasMismatch && (
        <div style={{
          backgroundColor: isHighStressManageable ? '#FFFBEB' : '#FEF2F2',
          borderRadius: '24px',
          padding: '16px 18px',
          border: `1.5px solid ${isHighStressManageable ? '#FDE68A' : '#FECACA'}`,
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color={isHighStressManageable ? '#D97706' : '#DC2626'} />
            <h3 style={{
              fontSize: '12.5px',
              fontWeight: 900,
              color: isHighStressManageable ? '#92400E' : '#991B1B',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.3px'
            }}>
              YOUR STRESS AND RECORDED LOAD DON'T FULLY MATCH
            </h3>
          </div>

          {isHighStressManageable ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p style={{ fontSize: '13px', color: '#92400E', margin: 0, lineHeight: 1.45 }}>
                Your perceived stress is <b>High</b>, but your recorded workload currently appears <b>Manageable</b>.
              </p>
              <p style={{ fontSize: '12px', color: '#78350F', margin: 0, lineHeight: 1.4 }}>
                Something affecting you may not be captured in your workload data (such as emotional pressures, unexpected personal tasks, or sleep quality). We encourage exploring these in Tree Hole Release.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p style={{ fontSize: '13px', color: '#991B1B', margin: 0, lineHeight: 1.45 }}>
                Your perceived stress is <b>Normal</b>, but your recorded workload currently appears <b>Overloaded</b>.
              </p>
              <p style={{ fontSize: '12px', color: '#7F1D1D', margin: 0, lineHeight: 1.4 }}>
                Although you don't feel acute stress right now, your current workload may be difficult to sustain with the time and resources available. We strongly recommend taking early rebalancing action before fatigue builds up.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. RESOURCES & FEASIBILITY (COMBINED CARD AS SHOWN IN PICTURE 2)          */}
      {/* ========================================================================= */}
      {(() => {
        const horizonEnd = '2026-09-15T22:15:00+08:00';
        const workloadsInHorizon = activeWorkloads.filter(w => !w.deadline || w.deadline <= horizonEnd);
        const horizonDueHours = workloadsInHorizon.reduce((acc, w) => acc + (w.remainingTimeHours ?? w.estimatedHours ?? 0), 0);
        const availableHours = capacityProfile.candidateTimeHours ?? 19;
        const deficitHours = Math.max(0, Number((horizonDueHours - availableHours).toFixed(1)));
        const hasCheckIn = !!todayCheckIn;
        const energyState = hasCheckIn && todayCheckIn?.energyLevel != null
          ? (todayCheckIn.energyLevel >= 4 ? 'High' : todayCheckIn.energyLevel === 3 ? 'Moderate' : 'Low')
          : 'Pending';
        const controlScoreVal = todayCheckIn?.controlScore ?? todayCheckIn?.q2_control;
        const controlState = hasCheckIn && controlScoreVal != null
          ? (controlScoreVal >= 4 ? 'High' : controlScoreVal === 3 ? 'Moderate' : 'Low')
          : 'Pending';

        return (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '18px',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            {/* Header: Battery Icon + Resources & Feasibility */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                backgroundColor: '#DCFCE7',
                border: '1px solid #86EFAC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="13" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="18" height="14" rx="3" stroke="#059669" strokeWidth="2" fill="none" />
                  <rect x="3.5" y="3.5" width="10" height="9" rx="1.5" fill="#059669" />
                  <path d="M21 5.5C21.8284 5.5 22.5 6.17157 22.5 7V9C22.5 9.82843 21.8284 10.5 21 10.5V5.5Z" fill="#059669" />
                </svg>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#065F46', margin: 0 }}>
                Resources & Feasibility
              </h3>
            </div>

            {/* 3 Metric Cards (Energy, Control, Avail. Time) as clean white boxes with colored text values */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '12px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                border: '1.5px solid #E2E8F0',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)'
              }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>Energy</span>
                <span style={{ fontSize: '15px', fontWeight: 900, color: energyState === 'Low' ? '#DC2626' : energyState === 'Moderate' ? '#B45309' : energyState === 'High' ? '#15803D' : '#94A3B8' }}>
                  {energyState}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                  {hasCheckIn && todayCheckIn?.energyLevel != null ? `${todayCheckIn.energyLevel} / 5` : '—'}
                </span>
              </div>

              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '12px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                border: '1.5px solid #E2E8F0',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)'
              }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>Control</span>
                <span style={{ fontSize: '15px', fontWeight: 900, color: controlState === 'Low' ? '#DC2626' : controlState === 'Moderate' ? '#B45309' : controlState === 'High' ? '#1D4ED8' : '#94A3B8' }}>
                  {controlState}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                  {hasCheckIn && controlScoreVal != null ? `${controlScoreVal} / 5` : '—'}
                </span>
              </div>

              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '12px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                border: '1.5px solid #E2E8F0',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>Open Time</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpenTimeInfoOpen(!isOpenTimeInfoOpen);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '1px',
                      margin: 0,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isOpenTimeInfoOpen ? '#0284C7' : '#94A3B8',
                      transition: 'color 0.15s ease'
                    }}
                    title="What is Open Time?"
                    aria-label="What is Open Time?"
                  >
                    <Info size={12} />
                  </button>
                </div>
                <span style={{ fontSize: '15px', fontWeight: 900, color: availableHours !== null ? '#15803D' : '#94A3B8' }}>
                  {availableHours !== null ? `${availableHours}h` : '19h'}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                  next 7 days
                </span>

                {/* Popover Explanation */}
                {isOpenTimeInfoOpen && (
                  <>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpenTimeInfoOpen(false);
                      }}
                      style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 40
                      }}
                    />
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        right: 0,
                        width: '235px',
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid #BAE6FD',
                        borderRadius: '14px',
                        padding: '12px 13px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
                        zIndex: 50,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Info size={13} color="#0284C7" />
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#0369A1' }}>
                            What is Open Time?
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsOpenTimeInfoOpen(false)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '0 2px',
                            cursor: 'pointer',
                            color: '#94A3B8',
                            fontSize: '15px',
                            lineHeight: 1,
                            fontWeight: 600
                          }}
                        >
                          ×
                        </button>
                      </div>
                      <p style={{
                        fontSize: '11.5px',
                        color: '#334155',
                        lineHeight: 1.45,
                        margin: 0
                      }}>
                        Time not occupied by fixed events or protected time. It shows when work could potentially be scheduled — not how much you should work.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Sub-card: Time Feasibility explanation with preserved color */}
            <div style={{
              background: deficitHours > 0
                ? 'linear-gradient(135deg, #FFF7ED 0%, #FEF2F2 100%)'
                : 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
              borderRadius: '18px',
              padding: '14px 16px',
              border: deficitHours > 0 ? '1.5px solid #FED7AA' : '1.5px solid #BBF7D0',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} color={deficitHours > 0 ? '#C2410C' : '#15803D'} />
                <span style={{ fontSize: '13.5px', fontWeight: 800, color: deficitHours > 0 ? '#9A3412' : '#166534' }}>Time Availability — next 7 Days</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {deficitHours > 0 ? (
                  <>
                    <p style={{
                      fontSize: '12.5px',
                      color: '#7C2D12',
                      lineHeight: 1.45,
                      margin: 0,
                      fontWeight: 700
                    }}>
                      There isn't enough open time for all of your upcoming work.
                    </p>

                    <p style={{
                      fontSize: '12.5px',
                      color: '#7C2D12',
                      lineHeight: 1.45,
                      margin: 0
                    }}>
                      About {horizonDueHours}h of work is due within the next 7 days, but only {availableHours}h of open calendar time is currently available. At least {deficitHours}h still has nowhere to fit.
                    </p>

                    <p style={{
                      fontSize: '11.5px',
                      color: '#9A3412',
                      lineHeight: 1.4,
                      margin: 0
                    }}>
                      Open time means time not occupied by fixed events or protected time. It is not a recommended amount of work.
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{
                      fontSize: '12.5px',
                      color: '#14532D',
                      lineHeight: 1.45,
                      margin: 0,
                      fontWeight: 700
                    }}>
                      Your recorded workload fits within your open calendar time overall.
                    </p>

                    <p style={{
                      fontSize: '12.5px',
                      color: '#14532D',
                      lineHeight: 1.45,
                      margin: 0
                    }}>
                      About {horizonDueHours}h of work is due within the next 7 days, with {availableHours}h of open calendar time identified. Individual deadlines may still make some days tighter than others.
                    </p>


                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* 4. WORKLOAD DEMAND PROFILE PIE CHART (POINTER HOVER SHOWS HIGH/MOD/LOW)    */}
      {/* ========================================================================= */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '18px',
        border: '1.5px solid #E2E8F0',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 900, color: Colors.textDark, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Workload Demand Profile
          </span>
          <span style={{ fontSize: '11px', color: Colors.textMuted }}>
            Hover / Tap Slice to Inspect
          </span>
        </div>

        {/* Donut Pie Chart for Demand (Cognitive, Emotional, Physical) - Exact matching layout with Area Distribution */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px', padding: '6px 0' }}>
          {/* Interactive SVG Pie Chart (Circumference ~ 238.76) */}
          <div style={{ position: 'relative', width: '115px', height: '115px', flexShrink: 0 }}>
            <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '115px', height: '115px' }}>
              {/* Background circle */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F5F9" strokeWidth="18" />

              {/* Cognitive */}
              <circle
                cx="50" cy="50" r="38"
                fill="none"
                stroke="#a16ff7ff"
                strokeWidth={activeDemandSlice === 'cognitive' ? 22 : 18}
                strokeDasharray={`${cogDash} 238.76`}
                strokeDashoffset={`${cogOffset}`}
                style={{ cursor: 'pointer', transition: 'stroke-width 0.2s ease, filter 0.2s ease' }}
                onMouseEnter={() => setActiveDemandSlice('cognitive')}
                onClick={() => setActiveDemandSlice('cognitive')}
              />

              {/* Emotional */}
              <circle
                cx="50" cy="50" r="38"
                fill="none"
                stroke="#e05573ff"
                strokeWidth={activeDemandSlice === 'emotional' ? 22 : 18}
                strokeDasharray={`${emoDash} 238.76`}
                strokeDashoffset={`${emoOffset}`}
                style={{ cursor: 'pointer', transition: 'stroke-width 0.2s ease, filter 0.2s ease' }}
                onMouseEnter={() => setActiveDemandSlice('emotional')}
                onClick={() => setActiveDemandSlice('emotional')}
              />

              {/* Physical */}
              <circle
                cx="50" cy="50" r="38"
                fill="none"
                stroke="#48ae6dff"
                strokeWidth={activeDemandSlice === 'physical' ? 22 : 18}
                strokeDasharray={`${phyDash} 238.76`}
                strokeDashoffset={`${phyOffset}`}
                style={{ cursor: 'pointer', transition: 'stroke-width 0.2s ease, filter 0.2s ease' }}
                onMouseEnter={() => setActiveDemandSlice('physical')}
                onClick={() => setActiveDemandSlice('physical')}
              />
            </svg>

            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 900,
                color: activeDemandSlice === 'cognitive' ? '#7C3AED' : activeDemandSlice === 'emotional' ? '#E11D48' : '#16A34A',
                textTransform: 'capitalize'
              }}>
                {activeDemandSlice}
              </span>
              <span style={{ fontSize: '9px', color: Colors.textMuted }}>Demand</span>
            </div>
          </div>

          {/* Right-Hand Details matching Picture 2 (Exact same size as Workload Area Distribution tags) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            {/* High Tag */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '38px',
              padding: '0 14px',
              borderRadius: '12px',
              backgroundColor: '#FFF1F2',
              border: '1.5px solid #FECDD3',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#E11D48' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#9F1239' }}>High</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#9F1239' }}>
                {demandCounts[activeDemandSlice].high}
              </span>
            </div>

            {/* Moderate Tag */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '38px',
              padding: '0 14px',
              borderRadius: '12px',
              backgroundColor: '#FFFBEB',
              border: '1.5px solid #FDE68A',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#92400E' }}>Moderate</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#92400E' }}>
                {demandCounts[activeDemandSlice].moderate}
              </span>
            </div>

            {/* Low Tag */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '38px',
              padding: '0 14px',
              borderRadius: '12px',
              backgroundColor: '#F0FDF4',
              border: '1.5px solid #BBF7D0',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#166534' }}>Low</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#166534' }}>
                {demandCounts[activeDemandSlice].low}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. WORKLOAD AREA DISTRIBUTION PIE CHART (SEPARATE FROM DEMAND)            */}
      {/* ========================================================================= */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '18px',
        border: '1.5px solid #E2E8F0',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 900, color: Colors.textDark, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Workload Area Distribution
          </span>
          <span style={{ fontSize: '11px', color: Colors.textMuted }}>
            Hover/Tap Slide to Inspect
          </span>
        </div>

        {/* Interactive SVG Pie Chart for Workload Areas */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px', padding: '6px 0' }}>
          <div style={{ position: 'relative', width: '115px', height: '115px', flexShrink: 0 }}>
            <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '115px', height: '115px' }}>
              <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F5F9" strokeWidth="18" />

              {/* Academic */}
              <circle
                cx="50" cy="50" r="38"
                fill="none"
                stroke="#60A5FA"
                strokeWidth={activeAreaSlice === 'Academic' ? 24 : 17}
                strokeDasharray={`${academicDash} 238.76`}
                strokeDashoffset={`${academicOffset}`}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: activeAreaSlice === 'Academic' ? 1 : 0.65,
                  filter: activeAreaSlice === 'Academic' ? 'drop-shadow(0 0 5px rgba(37, 99, 235, 0.45))' : 'none'
                }}
                onMouseEnter={() => setActiveAreaSlice('Academic')}
                onClick={() => setActiveAreaSlice('Academic')}
              >
                <title>Academic: {academicTasks} tasks ({academicPct}%)</title>
              </circle>

              {/* Social */}
              <circle
                cx="50" cy="50" r="38"
                fill="none"
                stroke="#FB923C"
                strokeWidth={activeAreaSlice === 'Social' ? 24 : 17}
                strokeDasharray={`${socialDash} 238.76`}
                strokeDashoffset={`${socialOffset}`}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: activeAreaSlice === 'Social' ? 1 : 0.65,
                  filter: activeAreaSlice === 'Social' ? 'drop-shadow(0 0 5px rgba(234, 88, 12, 0.45))' : 'none'
                }}
                onMouseEnter={() => setActiveAreaSlice('Social')}
                onClick={() => setActiveAreaSlice('Social')}
              >
                <title>Social: {socialTasks} tasks ({socialPct}%)</title>
              </circle>

              {/* Self-Care */}
              <circle
                cx="50" cy="50" r="38"
                fill="none"
                stroke="#34D399"
                strokeWidth={activeAreaSlice === 'Self-Care' ? 24 : 17}
                strokeDasharray={`${selfCareDash} 238.76`}
                strokeDashoffset={`${selfCareOffset}`}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: activeAreaSlice === 'Self-Care' ? 1 : 0.65,
                  filter: activeAreaSlice === 'Self-Care' ? 'drop-shadow(0 0 5px rgba(16, 185, 129, 0.45))' : 'none'
                }}
                onMouseEnter={() => setActiveAreaSlice('Self-Care')}
                onClick={() => setActiveAreaSlice('Self-Care')}
              >
                <title>Self-Care: {selfCareTasks} buffers ({selfCarePct}%)</title>
              </circle>
            </svg>

            {/* Clear Center Display showing how many tasks */}
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}>
              <span style={{
                fontSize: '22px',
                fontWeight: 900,
                color: Colors.textDark,
                lineHeight: 1
              }}>
                {activeAreaSlice === 'Academic' ? academicTasks : activeAreaSlice === 'Social' ? socialTasks : selfCareTasks}
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: Colors.textMuted,
                marginTop: '3px'
              }}>
                {activeAreaSlice === 'Self-Care' ? (selfCareTasks === 1 ? 'buffer' : 'buffers') : (activeAreaSlice === 'Academic' ? (academicTasks === 1 ? 'task' : 'tasks') : (socialTasks === 1 ? 'task' : 'tasks'))}
              </span>
            </div>
          </div>

          {/* Legend Items with Strong Active Indicator */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <button
              type="button"
              onMouseEnter={() => setActiveAreaSlice('Academic')}
              onClick={() => setActiveAreaSlice('Academic')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 14px',
                borderRadius: '12px',
                backgroundColor: activeAreaSlice === 'Academic' ? '#EFF6FF' : '#F8FAFC',
                border: activeAreaSlice === 'Academic' ? '2px solid #3B82F6' : '1px solid #E2E8F0',
                boxShadow: activeAreaSlice === 'Academic' ? '0 4px 12px rgba(59, 130, 246, 0.18)' : 'none',
                transform: activeAreaSlice === 'Academic' ? 'scale(1.02)' : 'scale(1)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#3B82F6' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#1E40AF', whiteSpace: 'nowrap' }}>Academic</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#1E40AF' }}>
                {academicPct}%
              </span>
            </button>

            <button
              type="button"
              onMouseEnter={() => setActiveAreaSlice('Social')}
              onClick={() => setActiveAreaSlice('Social')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 14px',
                borderRadius: '12px',
                backgroundColor: activeAreaSlice === 'Social' ? '#FFF7ED' : '#F8FAFC',
                border: activeAreaSlice === 'Social' ? '2px solid #F97316' : '1px solid #E2E8F0',
                boxShadow: activeAreaSlice === 'Social' ? '0 4px 12px rgba(249, 115, 22, 0.18)' : 'none',
                transform: activeAreaSlice === 'Social' ? 'scale(1.02)' : 'scale(1)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#F97316' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#9A3412', whiteSpace: 'nowrap' }}>Extracurricular</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#9A3412' }}>
                {socialPct}%
              </span>
            </button>

            <button
              type="button"
              onMouseEnter={() => setActiveAreaSlice('Self-Care')}
              onClick={() => setActiveAreaSlice('Self-Care')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 14px',
                borderRadius: '12px',
                backgroundColor: activeAreaSlice === 'Self-Care' ? '#F0FDF4' : '#F8FAFC',
                border: activeAreaSlice === 'Self-Care' ? '2px solid #10B981' : '1px solid #E2E8F0',
                boxShadow: activeAreaSlice === 'Self-Care' ? '0 4px 12px rgba(16, 185, 129, 0.18)' : 'none',
                transform: activeAreaSlice === 'Self-Care' ? 'scale(1.02)' : 'scale(1)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#166534', whiteSpace: 'nowrap' }}>Self-Care</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#166534' }}>
                {selfCarePct}%
              </span>
            </button>
          </div>
        </div>
      </div>



      {/* ========================================================================= */}
      {/* 7. BALANCE BUTTON (LINKED TO BALANCE PAGE)                                */}
      {/* ========================================================================= */}
      <button
        type="button"
        onClick={() => setActiveTab('balance')}
        style={{
          width: '100%',
          height: '52px',
          borderRadius: '20px',
          border: '1.5px solid #FDBA74',
          background: 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)',
          color: '#9A3412',
          fontWeight: 800,
          fontSize: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(234, 88, 12, 0.18)',
          transition: 'all 0.15s ease',
          letterSpacing: '-0.2px'
        }}
      >
        <Scale size={18} />
        <span>Balance Workload</span>
        <ArrowRight size={16} />
      </button>

    </div>
  );
};
