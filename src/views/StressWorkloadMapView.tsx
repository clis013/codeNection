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
  } = useApp();

  // "Why we're seeing this" accordion is closed by default as requested
  const [isExplanationOpen, setIsExplanationOpen] = useState<boolean>(false);
  const [isPatternOpen, setIsPatternOpen] = useState<boolean>(false);

  // Demand Profile Pie Chart Hovered/Selected Slice
  const [activeDemandSlice, setActiveDemandSlice] = useState<'cognitive' | 'emotional' | 'physical'>('cognitive');

  // Workload Area Distribution Pie Chart Hovered/Selected Slice
  const [activeAreaSlice, setActiveAreaSlice] = useState<'Academic' | 'Extracurricular' | 'Self-Care'>('Academic');

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

  // 4. WORKLOAD AREA COUNTS & PERCENTAGES (DYNAMICALLY BASED ON NUMBER OF TASKS)
  const totalActiveTasks = activeWorkloads.length;
  const rawAcademicTasks = activeWorkloads.filter(w => w.area === 'Academic').length;
  const rawExtraTasks = activeWorkloads.filter(w => w.area === 'Social' || w.area === 'Personal').length;
  const rawSelfCareTasks = activeWorkloads.filter(w => w.area === 'Self-Care' || (!['Academic', 'Social', 'Personal'].includes(w.area))).length;

  const academicTasks = totalActiveTasks > 0 ? rawAcademicTasks : 2;
  const extracurricularTasks = totalActiveTasks > 0 ? rawExtraTasks : 2;
  const selfCareTasks = totalActiveTasks > 0 ? rawSelfCareTasks : 1;
  const totalAreaTasks = totalActiveTasks > 0 ? totalActiveTasks : (academicTasks + extracurricularTasks + selfCareTasks);

  const academicPct = Math.round((academicTasks / totalAreaTasks) * 100);
  const extraPct = Math.round((extracurricularTasks / totalAreaTasks) * 100);
  const selfCarePct = Math.max(0, 100 - academicPct - extraPct);

  // SVG circle circumference for r=38 is 2 * PI * 38 = 238.76
  const CIRCLE_CIRCUMFERENCE = 238.76;
  const academicDash = Number(((academicPct / 100) * CIRCLE_CIRCUMFERENCE).toFixed(2));
  const extraDash = Number(((extraPct / 100) * CIRCLE_CIRCUMFERENCE).toFixed(2));
  const selfCareDash = Number(((selfCarePct / 100) * CIRCLE_CIRCUMFERENCE).toFixed(2));

  const academicOffset = 0;
  const extraOffset = -academicDash;
  const selfCareOffset = -(academicDash + extraDash);

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
            {cardTheme.statusLabel === 'OVERLOADED' ? 'Overloaded' : cardTheme.statusLabel === 'MANAGEABLE' ? 'Manageable' : 'Strained'}
          </span>
        </div>

        {/* Short & Clear Natural Interpretation */}
        <p style={{
          fontSize: '13px',
          color: Colors.textDark,
          lineHeight: 1.45,
          margin: 0
        }}>
          {isOver
            ? 'Your current demands exceed your available capacity. Immediate adjustments are needed to make the plan manageable.'
            : isMan
            ? 'Your demands and resources are currently well aligned. Your schedule has healthy recovery buffers.'
            : isStrain 
            ? 'Your current demands show meaningful pressure. Immediate adjustments are recommended to make the plan manageable.'
            : (activeWorkloads.length > 0)
            ? "Your workload is recorded, but today's resource state is missing. Complete today's check-in to compare your demands with your current resources."
            : 'Please record some workloads and complete a daily check-in to see your analysis.'}
        </p>

        {/* Inner White Container (Picture 3 & 4) */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          borderRadius: '18px',
          padding: '14px 16px',
          border: `1px solid ${cardTheme.innerBorder}`,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Recent pattern with Sustained strain label */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: cardTheme.titleColor }}>
              Recent pattern
            </span>
            {false && ( // Sustained strain removed in Stage 2B
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                color: cardTheme.badgeText,
                backgroundColor: cardTheme.badgeBg,
                padding: '2px 8px',
                borderRadius: '6px',
                border: `1px solid ${cardTheme.badgeBorder}`
              }}>
                Sustained strain
              </span>
            )}
          </div>
          <span style={{ fontSize: '12.5px', color: Colors.textDark, lineHeight: 1.4 }}>
            Your recent workload pattern analysis will appear here.
          </span>

          <div style={{ height: '1px', backgroundColor: 'rgba(0, 0, 0, 0.05)', margin: '4px 0' }} />

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
            <span style={{ fontSize: '13px', fontWeight: 800, color: cardTheme.titleColor }}>
              Why?
            </span>
            {isExplanationOpen ? <ChevronUp size={16} color={cardTheme.accentColor} /> : <ChevronDown size={16} color={cardTheme.accentColor} />}
          </button>

          {isExplanationOpen && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '12px',
              color: '#334155',
              lineHeight: 1.45,
              paddingTop: '6px',
              borderTop: '1px solid rgba(0, 0, 0, 0.05)'
            }}>
              {capacityProfile.analysisResult.evidence.length > 0 ? (
                capacityProfile.analysisResult.evidence.map((ev, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <span style={{ color: cardTheme.accentColor, fontWeight: 900 }}>•</span>
                    <span>{ev.message}</span>
                  </div>
                ))
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: cardTheme.accentColor, fontWeight: 900 }}>•</span>
                  <span>No specific evidence available.</span>
                </div>
              )}

              {/* Supporting pattern */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: cardTheme.titleColor }}>
                  Supporting pattern
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: cardTheme.accentColor, fontWeight: 900 }}>•</span>
                  <span>6 strained / overloaded days</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: cardTheme.accentColor, fontWeight: 900 }}>•</span>
                  <span>Low energy on 3 days</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: cardTheme.accentColor, fontWeight: 900 }}>•</span>
                  <span>Time pressure repeated across multiple days</span>
                </div>
              </div>
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
        const totalWorkloadHours = activeWorkloads.reduce((acc, w) => acc + (w.estimatedHours || 0), 0) || 0;
        const availableHours = capacityProfile.candidateTimeHours;
        const deficitHours = availableHours !== null ? Math.max(0, Number((totalWorkloadHours - availableHours).toFixed(1))) : null;
        const energyState = todayCheckIn?.energyLevel ? (todayCheckIn.energyLevel >= 4 ? 'Moderate' : todayCheckIn.energyLevel === 3 ? 'Moderate' : 'Low') : 'Moderate';
        const controlState = todayCheckIn?.controlScore ? (todayCheckIn.controlScore >= 4 ? 'Moderate' : todayCheckIn.controlScore === 3 ? 'Moderate' : 'Low') : 'Moderate';

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
                <span style={{ fontSize: '15px', fontWeight: 900, color: energyState === 'Low' ? '#DC2626' : energyState === 'Moderate' ? '#B45309' : '#15803D' }}>
                  {energyState}
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
                <span style={{ fontSize: '15px', fontWeight: 900, color: '#1D4ED8' }}>
                  {controlState}
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
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>Candidate Time</span>
                <span style={{ fontSize: '15px', fontWeight: 900, color: availableHours !== null ? '#15803D' : '#94A3B8' }}>
                  {availableHours !== null ? `${availableHours}h (7d)` : '—'}
                </span>
              </div>
            </div>

            {/* Sub-card: Time Feasibility explanation with preserved color */}
            <div style={{
              background: deficitHours !== null && deficitHours > 0
                ? 'linear-gradient(135deg, #FFF7ED 0%, #FEF2F2 100%)'
                : 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
              borderRadius: '18px',
              padding: '14px 16px',
              border: deficitHours !== null && deficitHours > 0 ? '1.5px solid #FED7AA' : '1.5px solid #BBF7D0',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} color={deficitHours !== null && deficitHours > 0 ? '#C2410C' : '#15803D'} />
                <span style={{ fontSize: '13.5px', fontWeight: 800, color: deficitHours !== null && deficitHours > 0 ? '#9A3412' : '#166534' }}>Candidate Time (7 Days)</span>
              </div>
              <p style={{ fontSize: '12.5px', color: deficitHours !== null && deficitHours > 0 ? '#7C2D12' : '#14532D', lineHeight: 1.45, margin: 0 }}>
                {deficitHours === null
                  ? 'Calendar data required. Connect schedule information to view candidate time.'
                  : deficitHours > 0
                  ? `Your 7-day candidate time (${availableHours}h) is less than your total workload volume (${totalWorkloadHours}h). Deadline scheduling may be tight.`
                  : `Your 7-day candidate time (${availableHours}h) mathematically covers your total workload volume (${totalWorkloadHours}h), but actual feasibility depends on specific deadlines.`}
              </p>
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
              
              {/* Cognitive: ~45% (dash 107.4) */}
              <circle
                cx="50" cy="50" r="38"
                fill="none"
                stroke="#7C3AED"
                strokeWidth={activeDemandSlice === 'cognitive' ? 22 : 18}
                strokeDasharray="107.4 238.76"
                strokeDashoffset="0"
                style={{ cursor: 'pointer', transition: 'stroke-width 0.2s ease, filter 0.2s ease' }}
                onMouseEnter={() => setActiveDemandSlice('cognitive')}
                onClick={() => setActiveDemandSlice('cognitive')}
              />

              {/* Emotional: ~30% (dash 71.6) */}
              <circle
                cx="50" cy="50" r="38"
                fill="none"
                stroke="#E11D48"
                strokeWidth={activeDemandSlice === 'emotional' ? 22 : 18}
                strokeDasharray="71.6 238.76"
                strokeDashoffset="-107.4"
                style={{ cursor: 'pointer', transition: 'stroke-width 0.2s ease, filter 0.2s ease' }}
                onMouseEnter={() => setActiveDemandSlice('emotional')}
                onClick={() => setActiveDemandSlice('emotional')}
              />

              {/* Physical: ~25% (dash 59.7) */}
              <circle
                cx="50" cy="50" r="38"
                fill="none"
                stroke="#16A34A"
                strokeWidth={activeDemandSlice === 'physical' ? 22 : 18}
                strokeDasharray="59.7 238.76"
                strokeDashoffset="-179"
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
                stroke="#8B5CF6"
                strokeWidth={activeAreaSlice === 'Academic' ? 24 : 17}
                strokeDasharray={`${academicDash} 238.76`}
                strokeDashoffset={`${academicOffset}`}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: activeAreaSlice === 'Academic' ? 1 : 0.65,
                  filter: activeAreaSlice === 'Academic' ? 'drop-shadow(0 0 5px rgba(139, 92, 246, 0.45))' : 'none'
                }}
                onMouseEnter={() => setActiveAreaSlice('Academic')}
                onClick={() => setActiveAreaSlice('Academic')}
              >
                <title>Academic: {academicTasks} tasks ({academicPct}%)</title>
              </circle>

              {/* Extracurricular */}
              <circle
                cx="50" cy="50" r="38"
                fill="none"
                stroke="#FF6B6B"
                strokeWidth={activeAreaSlice === 'Extracurricular' ? 24 : 17}
                strokeDasharray={`${extraDash} 238.76`}
                strokeDashoffset={`${extraOffset}`}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: activeAreaSlice === 'Extracurricular' ? 1 : 0.65,
                  filter: activeAreaSlice === 'Extracurricular' ? 'drop-shadow(0 0 5px rgba(255, 107, 107, 0.45))' : 'none'
                }}
                onMouseEnter={() => setActiveAreaSlice('Extracurricular')}
                onClick={() => setActiveAreaSlice('Extracurricular')}
              >
                <title>Extracurricular: {extracurricularTasks} tasks ({extraPct}%)</title>
              </circle>

              {/* Self-Care */}
              <circle
                cx="50" cy="50" r="38"
                fill="none"
                stroke="#0284C7"
                strokeWidth={activeAreaSlice === 'Self-Care' ? 24 : 17}
                strokeDasharray={`${selfCareDash} 238.76`}
                strokeDashoffset={`${selfCareOffset}`}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: activeAreaSlice === 'Self-Care' ? 1 : 0.65,
                  filter: activeAreaSlice === 'Self-Care' ? 'drop-shadow(0 0 5px rgba(2, 132, 199, 0.45))' : 'none'
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
                {activeAreaSlice === 'Academic' ? academicTasks : activeAreaSlice === 'Extracurricular' ? extracurricularTasks : selfCareTasks}
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: Colors.textMuted,
                marginTop: '3px'
              }}>
                {activeAreaSlice === 'Self-Care' ? (selfCareTasks === 1 ? 'buffer' : 'buffers') : (activeAreaSlice === 'Academic' ? (academicTasks === 1 ? 'task' : 'tasks') : (extracurricularTasks === 1 ? 'task' : 'tasks'))}
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
                backgroundColor: activeAreaSlice === 'Academic' ? '#F3EEFD' : '#F8FAFC',
                border: activeAreaSlice === 'Academic' ? '2px solid #8B5CF6' : '1px solid #E2E8F0',
                boxShadow: activeAreaSlice === 'Academic' ? '0 4px 12px rgba(139, 92, 246, 0.18)' : 'none',
                transform: activeAreaSlice === 'Academic' ? 'scale(1.02)' : 'scale(1)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#8B5CF6' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#7C3AED', whiteSpace: 'nowrap' }}>Academic</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#7C3AED' }}>
                {academicPct}%
              </span>
            </button>

            <button
              type="button"
              onMouseEnter={() => setActiveAreaSlice('Extracurricular')}
              onClick={() => setActiveAreaSlice('Extracurricular')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 14px',
                borderRadius: '12px',
                backgroundColor: activeAreaSlice === 'Extracurricular' ? '#FFF1F2' : '#F8FAFC',
                border: activeAreaSlice === 'Extracurricular' ? '2px solid #FF6B6B' : '1px solid #E2E8F0',
                boxShadow: activeAreaSlice === 'Extracurricular' ? '0 4px 12px rgba(255, 107, 107, 0.18)' : 'none',
                transform: activeAreaSlice === 'Extracurricular' ? 'scale(1.02)' : 'scale(1)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#FF6B6B' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#E11D48', whiteSpace: 'nowrap' }}>Extracurricular</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#E11D48' }}>
                {extraPct}%
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
                backgroundColor: activeAreaSlice === 'Self-Care' ? '#E0F2FE' : '#F8FAFC',
                border: activeAreaSlice === 'Self-Care' ? '2px solid #0284C7' : '1px solid #E2E8F0',
                boxShadow: activeAreaSlice === 'Self-Care' ? '0 4px 12px rgba(2, 132, 199, 0.18)' : 'none',
                transform: activeAreaSlice === 'Self-Care' ? 'scale(1.02)' : 'scale(1)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#0284C7' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0369A1', whiteSpace: 'nowrap' }}>Self-Care</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#0369A1' }}>
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
