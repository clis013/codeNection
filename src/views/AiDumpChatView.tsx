import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';
import {
  Send, Mic, Sparkles, Check, ArrowRight, ArrowLeft, Zap, Coffee, Clock,
  Play, Pause, Volume2, X, RotateCcw, Feather, TreePine, AlertCircle,
  Square, CheckCircle2, Edit3, Heart, Palette, Scale, BarChart2, Plus, AlertTriangle,
  ClipboardList, ShieldCheck
} from 'lucide-react';
import { TreeHoleAnimationView } from '../components/Recovery/TreeHoleAnimationView';
import { NICOLE_NARRATIVE, TECH_CARNIVAL_SPONSORSHIP_ITEM } from '../demo/nicoleDemo';

interface LeafParticle {
  id: number;
  startX: number;
  startY: number;
  driftX: number;
  delay: number;
  color: string;
  size: number;
  rotate: number;
}

export const isLoadOverloaded = (
  status: string,
  checkIn: any,
  taskList: any[]
): boolean => {
  if (status === 'Overloaded') return true;
  if (checkIn && (checkIn.category === 'Very High' || (checkIn.category === 'High' && checkIn.energyLevel <= 2))) {
    return true;
  }
  const activeHours = taskList.filter(w => w.status !== 'Completed').reduce((acc, w) => acc + (w.estimatedHours || 0), 0);
  return activeHours > 20;
};

// Reusable AI Analysis Card (displays Homepage Section 2 Daily State & Load Insight + Recovery Recommendation if overloaded)
const AiAnalysisNextPlanCard: React.FC<{
  taskTitle?: string;
  taskHours?: number;
  totalWorkloadHours?: number;
  availableHours?: number;
  deficit?: number;
  isOverloaded?: boolean;
  isNicoleAnalysisPlan?: boolean;
  onTreeHole?: () => void;
  onColourReflection?: () => void;
  onGoToAnalysis?: () => void;
  onGoToBalance?: () => void;
}> = ({
  onTreeHole,
  onColourReflection,
  onGoToAnalysis,
  onGoToBalance,
}) => {
    const {
      capacityProfile,
      todayCheckIn,
      workloads,
      setActiveTab,
      setIsTreeHoleOpen,
      setIsColourReflectionOpen,
      setIsCheckInOpen,
      setCheckInSource
    } = useApp();

    const status = capacityProfile.analysisResult.demandResourceStatus;
    const isMan = status === 'Manageable';
    const isOver = status === 'Overloaded';
    const isStrain = status === 'Strained';
    const isPending = !todayCheckIn || status === 'InsufficientData';

    // 1. Stress Level
    const stressCategory = todayCheckIn ? todayCheckIn.category : null;
    const stressDisplay = stressCategory ?? '--';
    const stressColor = !todayCheckIn ? '#94A3B8'
      : (stressCategory === 'Very High' || stressCategory === 'High')
        ? '#DC2626'
        : stressCategory === 'Elevated'
          ? '#D97706'
          : '#15803D';

    // 2. Energy
    const energyNum = todayCheckIn?.energyLevel ?? null;
    const energyDisplay = energyNum === null
      ? '--'
      : (energyNum <= 2 ? 'Low' : energyNum === 3 ? 'Moderate' : 'High');
    const energyColor = energyNum === null ? '#94A3B8'
      : energyNum <= 2 ? '#991B1B'
        : energyNum === 3 ? '#D97706'
          : '#15803D';

    // 3. Time Load (active remaining hours vs available candidate time hours)
    const activeWorkloadsList = workloads.filter(w => w.status !== 'Completed');
    const totalWorkloadHours = Number(activeWorkloadsList.reduce((acc, w) => acc + (w.remainingTimeHours ?? w.estimatedHours ?? 0), 0).toFixed(1));
    const availableHours = capacityProfile.candidateTimeHours !== null ? Number(capacityProfile.candidateTimeHours.toFixed(1)) : 19;
    const timeLoadDisplay = `${totalWorkloadHours}h / ${availableHours}h`;

    // Theme configuration matching Homepage Section 2
    const theme = isPending ? {
      outerBg: 'linear-gradient(180deg, #e2e8f0ff 0%, #f1f5f9ff 60%, #F8FAFC 100%)',
      outerBorder: '1.5px solid #E2E8F0',
      shadow: '0 8px 30px rgba(100, 116, 139, 0.05)',
      headerColor: '#475569',
      badgeText: 'Pending Check-in',
      badgeBorder: '#CBD5E1',
      badgeColor: '#475569',
      heroIconBg: '#F1F5F9',
      heroIconBorder: '1px solid #E2E8F0',
      heroIconColor: '#64748B',
      HeroIcon: Clock,
      heroTitle: 'Daily check-in pending',
      heroSubtitle: "Complete today's check-in to compare your personal resources with your recorded workload.",
      timeLoadColor: '#334155',
      btnColor: '#334155'
    } : isMan ? {
      outerBg: 'linear-gradient(180deg, #bbf7d0ff 0%, #dcfce7ff 60%, #F8FAFC 100%)',
      outerBorder: '1.5px solid #DCFCE7',
      shadow: '0 8px 30px rgba(220, 252, 231, 0.15)',
      headerColor: '#15803D',
      badgeText: 'Manageable',
      badgeBorder: '#86EFAC',
      badgeColor: '#15803D',
      heroIconBg: '#DCFCE7',
      heroIconBorder: '1px solid #86EFAC',
      heroIconColor: '#15803D',
      HeroIcon: ShieldCheck,
      heroTitle: 'Workload is balanced',
      heroSubtitle: 'Your current commitments appear manageable with the resources you have available.',
      timeLoadColor: '#15803D',
      btnColor: '#15803D'
    } : isStrain ? {
      outerBg: 'linear-gradient(180deg, #fde68aff 0%, #fef3c7ff 60%, #F8FAFC 100%)',
      outerBorder: '1.5px solid #FDE68A',
      shadow: '0 8px 30px rgba(217, 119, 6, 0.05)',
      headerColor: '#B45309',
      badgeText: 'Strained',
      badgeBorder: '#FDE68A',
      badgeColor: '#B45309',
      heroIconBg: '#FEF3C7',
      heroIconBorder: '1px solid #FDE68A',
      heroIconColor: '#D97706',
      HeroIcon: AlertTriangle,
      heroTitle: 'Workload pressure is elevated',
      heroSubtitle: 'Your current demands show meaningful pressure. Adjustments are recommended to make the plan manageable.',
      timeLoadColor: '#D97706',
      btnColor: '#B45309'
    } : {
      // Overloaded
      outerBg: 'linear-gradient(180deg, #ffced2ff 0%, #ffededff 60%, #F8FAFC 100%)',
      outerBorder: '1.5px solid #FECDD3',
      shadow: '0 8px 30px rgba(220, 38, 38, 0.05)',
      headerColor: '#B91C1C',
      badgeText: 'Overloaded',
      badgeBorder: '#FECDD3',
      badgeColor: '#B91C1C',
      heroIconBg: '#FEE2E2',
      heroIconBorder: '1px solid #FECDD3',
      heroIconColor: '#DC2626',
      HeroIcon: AlertTriangle,
      heroTitle: 'Workload is overloaded',
      heroSubtitle: 'Your current demands appear difficult to manage with the resources and time available right now.',
      timeLoadColor: '#DC2626',
      btnColor: '#B91C1C'
    };

    const analysisMismatch = capacityProfile.analysisResult.mismatch;
    const displaySubtitle = (analysisMismatch?.detected && analysisMismatch.insight)
      ? analysisMismatch.insight
      : theme.heroSubtitle;

    const { HeroIcon } = theme;

    return (
      <div style={{
        background: theme.outerBg,
        borderRadius: '24px',
        padding: '16px',
        border: theme.outerBorder,
        boxShadow: `${theme.shadow}, inset 0 1px 2px rgba(255, 255, 255, 0.9)`,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Top Header: Sparkle + Title & Status Badge Pill (Homepage Style) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px', lineHeight: 1 }}>✨</span>
            <h3 style={{
              fontSize: '12px',
              fontWeight: 900,
              color: theme.headerColor,
              margin: 0,
              letterSpacing: '0.4px',
              textTransform: 'uppercase'
            }}>
              DAILY STATE &amp; LOAD INSIGHT
            </h3>
          </div>

          <span style={{
            fontSize: '11px',
            color: theme.badgeColor,
            fontWeight: 800,
            backgroundColor: '#FFFFFF',
            padding: '2px 10px',
            borderRadius: '999px',
            border: `1px solid ${theme.badgeBorder}`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
          }}>
            {theme.badgeText}
          </span>
        </div>

        {/* Hero Insight Block */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            backgroundColor: theme.heroIconBg,
            border: theme.heroIconBorder,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <HeroIcon size={20} color={theme.heroIconColor} strokeWidth={2.2} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
            <h4 style={{
              fontSize: '15px',
              fontWeight: 900,
              color: '#0F172A',
              margin: 0,
              letterSpacing: '-0.2px'
            }}>
              {theme.heroTitle}
            </h4>
            <p style={{
              fontSize: '12px',
              color: '#475569',
              margin: 0,
              lineHeight: '1.4'
            }}>
              {displaySubtitle}
            </p>
          </div>
        </div>

        {/* 3 Metric Cards: STRESS LEVEL | ENERGY | TIME LOAD */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '8px 4px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)',
            border: '1px solid #F1F5F9'
          }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              STRESS LEVEL
            </span>
            <span style={{ fontSize: '13.5px', fontWeight: 900, color: stressColor }}>
              {stressDisplay}
            </span>
          </div>

          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '8px 4px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)',
            border: '1px solid #F1F5F9'
          }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              ENERGY
            </span>
            <span style={{ fontSize: '13.5px', fontWeight: 900, color: energyColor }}>
              {energyDisplay}
            </span>
          </div>

          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '8px 4px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)',
            border: '1px solid #F1F5F9'
          }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              TIME LOAD
            </span>
            <span style={{ fontSize: '13.5px', fontWeight: 900, color: theme.timeLoadColor }}>
              {timeLoadDisplay}
            </span>
          </div>
        </div>

        {/* Divider Line matching Homepage */}
        <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '2px 0 0 0' }} />

        {/* Button to analysis page: Understand My Load (or Daily Check in if check-in is pending) */}
        <button
          type="button"
          id={isPending ? "chat-card-daily-checkin-btn" : "chat-card-understand-load-btn"}
          onClick={() => {
            if (isPending) {
              setCheckInSource('chat');
              setIsCheckInOpen(true);
            } else if (onGoToAnalysis) {
              onGoToAnalysis();
            } else {
              setActiveTab('map');
            }
          }}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            border: isPending ? '1.5px solid #7C3AED' : '1px solid #E2E8F0',
            backgroundColor: isPending ? '#7C3AED' : '#FFFFFF',
            color: isPending ? '#FFFFFF' : theme.btnColor,
            padding: '11px 16px',
            borderRadius: '14px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: isPending ? '0 4px 14px rgba(124, 58, 237, 0.28)' : '0 2px 6px rgba(0, 0, 0, 0.02)',
            transition: 'all 0.15s ease'
          }}
        >
          <span>{isPending ? 'Daily Check in' : 'Understand My Load'}</span>
          <ArrowRight size={15} strokeWidth={2.4} color={isPending ? '#FFFFFF' : theme.btnColor} />
        </button>

        {/* Recovery Recommendation (ONLY IF OVERLOADED) */}
        {isOver && (
          <div style={{
            backgroundColor: '#FFF7ED',
            borderRadius: '16px',
            padding: '12px 14px',
            border: '1.2px solid #FED7AA',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#C2410C', fontWeight: 800, fontSize: '12px' }}>
              <Coffee size={14} color="#EA580C" />
              <span>Recovery Recommendation</span>
            </div>
            <p style={{ margin: 0, fontSize: '11.5px', color: '#9A3412', lineHeight: 1.45 }}>
              Your cognitive load and deadline density are in an overloaded state. We strongly recommend taking 15–20 minutes for recovery!
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={onTreeHole ? onTreeHole : () => setIsTreeHoleOpen(true)}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.2px solid #86EFAC',
                  color: '#166534',
                  borderRadius: '10px',
                  padding: '5px 10px',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 1px 4px rgba(34, 197, 94, 0.1)'
                }}
              >
                <Feather size={12} /> Tree Hole Vent
              </button>
              <button
                type="button"
                onClick={onColourReflection ? onColourReflection : () => setIsColourReflectionOpen(true)}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.2px solid #DDD6FE',
                  color: '#6B21A8',
                  borderRadius: '10px',
                  padding: '5px 10px',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 1px 4px rgba(124, 58, 237, 0.1)'
                }}
              >
                <Palette size={12} /> Colour Reflection
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

// ─── Nicole Canonical Demo Extraction Card ──────────────────────────────────
const getAreaColor = (area?: string) => {
  switch (area?.toLowerCase()) {
    case 'academic':
      return '#2563EB'; // Royal blue matching pie chart
    case 'social':
    case 'extracurricular':
      return '#EA580C'; // Warm orange matching pie chart
    case 'self-care':
    case 'selfcare':
      return '#166534'; // Emerald green matching pie chart
    case 'personal':
      return '#7C3AED'; // Purple
    default:
      return '#475569';
  }
};

const NicoleDemoExtractionCard: React.FC<{
  msg: any;
  onClarify: () => void;
  onConfirm: () => void;
  onGoToWorkloads: () => void;
}> = ({ msg, onClarify, onConfirm, onGoToWorkloads }) => {
  const {
    setSelectedWorkload,
    setIsWorkloadDetailOpen,
    workloads,
    setIsTreeHoleOpen,
    setIsColourReflectionOpen,
    setActiveTab,
    clarifiedWorkloadIds,
    setNewAppleWorkloadId
  } = useApp();
  const isClarified = !!msg.nicoleClarified;
  const isConfirmed = !!msg.nicoleConfirmed;

  const webProg = workloads.find(w => w.id === 'web-programming-group');
  const osQuiz = workloads.find(w => w.id === 'os-quiz-1');
  const fcgTest = workloads.find(w => w.id === 'fcg-test-1');
  const sponsorship = workloads.find(w => w.id === 'tech-carnival-sponsorship');

  // Edit button ONLY turns clarified if they press "Save Changes" in the edit modal
  const isItemClarified = (workloadId: string) => {
    return (clarifiedWorkloadIds || []).includes(workloadId);
  };

  const handleEditWorkload = (workloadId: string) => {
    const existing = workloads.find(w => w.id === workloadId);
    if (existing) {
      setSelectedWorkload(existing);
    } else if (workloadId === 'tech-carnival-sponsorship') {
      setSelectedWorkload(TECH_CARNIVAL_SPONSORSHIP_ITEM);
    }
    setIsWorkloadDetailOpen(true);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* 4 EXTRACTED WORKLOAD ITEMS - Only the workloads themselves as cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* 1. Tech Carnival Sponsorship (New Workload) */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '12px 14px',
          border: isItemClarified('tech-carnival-sponsorship') ? '1.5px solid #86EFAC' : '1.5px solid #FED7AA',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ fontSize: '13.5px', fontWeight: 800, color: Colors.textDark, lineHeight: 1.35 }}>
              {sponsorship?.title || 'Tech Carnival Sponsorship'}
            </span>
            <span style={{
              fontSize: '9.5px',
              fontWeight: 800,
              letterSpacing: '0.5px',
              backgroundColor: '#FFF7ED',
              color: '#C2410C',
              padding: '2px 7px',
              borderRadius: '6px',
              border: '1px solid #FED7AA',
              flexShrink: 0,
              marginTop: '1px'
            }}>
              NEW
            </span>
          </div>

          <div style={{ fontSize: '11.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, color: getAreaColor(sponsorship?.area || 'Social') }}>
              {sponsorship?.area || 'Social'}
            </span>
            <span>· Due 10 Sep, 18:00</span>
            <span>· ⏱️ 6 hrs</span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#166534', backgroundColor: '#DCFCE7', padding: '1px 5px', borderRadius: '6px' }}>
              Pre-filled
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid #F8FAFC' }}>

            <button
              type="button"
              onClick={() => handleEditWorkload('tech-carnival-sponsorship')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: isItemClarified('tech-carnival-sponsorship') ? '#F0FDF4' : '#FFF7ED',
                border: isItemClarified('tech-carnival-sponsorship') ? '1.2px solid #86EFAC' : '1.2px solid #FED7AA',
                color: isItemClarified('tech-carnival-sponsorship') ? '#166534' : '#C2410C',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease'
              }}
              title="Check or update Tech Carnival Sponsorship"
            >
              {isItemClarified('tech-carnival-sponsorship') ? (
                <>
                  <Check size={14} strokeWidth={2.5} color="#166534" />
                  <span>Checked & Updated</span>
                </>
              ) : (
                <>
                  <Edit3 size={13} />
                  <span>Check / Update</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Existing Workloads Consolidated in One Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '12px 14px',
          border: '1.5px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Existing Recorded Workloads (3)
            </span>
            <span style={{
              fontSize: '9.5px',
              fontWeight: 800,
              letterSpacing: '0.5px',
              backgroundColor: '#F1F5F9',
              color: '#475569',
              padding: '2px 7px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              flexShrink: 0
            }}>
              EXISTING
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            {/* 1. Web Programming Group Assignment */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingBottom: '9px', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: Colors.textDark, lineHeight: 1.35 }}>
                {webProg?.title || 'Web Programming Group Assignment'}
              </span>
              <div style={{ fontSize: '11.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, color: getAreaColor(webProg?.area || 'Academic') }}>
                  {webProg?.area || 'Academic'}
                </span>
                <span>· Due 11 Sep, 23:59</span>
                <span>· ⏱️ 12 hrs</span>
              </div>
            </div>

            {/* 2. OS Quiz */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingBottom: '9px', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: Colors.textDark, lineHeight: 1.35 }}>
                {osQuiz?.title || 'Operating System Quiz 1'}
              </span>
              <div style={{ fontSize: '11.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, color: getAreaColor(osQuiz?.area || 'Academic') }}>
                  {osQuiz?.area || 'Academic'}
                </span>
                <span>· Due 10 Sep, 08:00</span>
                <span>· ⏱️ 5 hrs</span>
              </div>
            </div>

            {/* 3. FCG Test */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: Colors.textDark, lineHeight: 1.35 }}>
                {fcgTest?.title || 'FCG Test'}
              </span>
              <div style={{ fontSize: '11.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, color: getAreaColor(fcgTest?.area || 'Academic') }}>
                  {fcgTest?.area || 'Academic'}
                </span>
                <span>· Due 14 Sep, 14:00</span>
                <span>· ⏱️ 8 hrs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION CONTROLS */}
      {!isConfirmed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
          <button
            type="button"
            id="btn-add-workload-tree"
            onClick={() => {
              onConfirm();
              setNewAppleWorkloadId('tech-carnival-sponsorship');
            }}
            style={{
              backgroundColor: '#166534',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '16px',
              padding: '13px 20px',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(22, 101, 52, 0.28)',
              transition: 'all 0.15s ease'
            }}
          >
            <Plus size={17} strokeWidth={2.8} />
            <span>Add Workload 🌳</span>
          </button>
        </div>
      )}

      {isConfirmed && (
        <div style={{
          backgroundColor: '#F0FDF4',
          border: '1.2px solid #86EFAC',
          color: '#166534',
          borderRadius: '14px',
          padding: '10px 16px',
          fontWeight: 800,
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          marginTop: '2px'
        }}>
          <CheckCircle2 size={16} color="#166534" />
          <span>Done</span>
        </div>
      )}
    </div>
  );
};

export const AiDumpChatView: React.FC = () => {
  const {
    chatMessages,
    sendChatMessage,
    addAiChatMessage,
    confirmAllExtractedDrafts,
    clarifyNicoleMessage,
    confirmNicoleStressDump,
    setIsTreeHoleOpen,
    setIsColourReflectionOpen,
    setActiveTab,
    capacityProfile,
    todayCheckIn,
    isCheckInOpen,
    setIsCheckInOpen,
    setCheckInSource,
    setIsAddWorkloadOpen,
    setAddWorkloadInitialData,
    markChatWorkloadAdded,
    workloads,
    chatSource,
    setChatSource
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [hasTappedTyping, setHasTappedTyping] = useState(false);

  // Voice Recording & Tree Hole Shout Connection State (Requirement 3)
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceStopped, setIsVoiceStopped] = useState(false);
  const [confirmedMsgIds, setConfirmedMsgIds] = useState<string[]>([]);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [liveDecibels, setLiveDecibels] = useState(32);
  const [isShoutDetected, setIsShoutDetected] = useState(false);
  const [showTreeAnimation, setShowTreeAnimation] = useState(false);
  const [fallingLeaves, setFallingLeaves] = useState<LeafParticle[]>([]);
  const [audioPlayingId, setAudioPlayingId] = useState<string | null>(null);

  // Workload Record Edit Modal state (Specification: opens modal like the one at workload record)
  const [editingMessage, setEditingMessage] = useState<any | null>(null);
  const [editingWorkloadIndex, setEditingWorkloadIndex] = useState<number>(0);
  const [editingWorkloadDraft, setEditingWorkloadDraft] = useState<any | null>(null);

  // Category-level Stress Factors Modal state (Specification: edit all things under stress factors directly in one modal)
  const [isEditingStressCategory, setIsEditingStressCategory] = useState(false);
  const [draftDrivers, setDraftDrivers] = useState<string[]>([]);
  const [draftEffects, setDraftEffects] = useState<string[]>([]);
  const [draftRecovery, setDraftRecovery] = useState<string[]>([]);
  const [newDriverText, setNewDriverText] = useState('');
  const [newEffectText, setNewEffectText] = useState('');
  const [newRecoveryText, setNewRecoveryText] = useState('');

  // Audio Context refs for real mic analysis
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<any>(null);

  // Auto-scroll to bottom refs for Chat View
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
    if (messagesEndRef.current) {
      try {
        messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
      } catch (e) {
        messagesEndRef.current.scrollIntoView(false);
      }
    }
  };

  // Immediate layout effect on mount
  useLayoutEffect(() => {
    scrollToBottom('auto');
  }, []);

  // Multi-pass timeouts on mount to handle deferred layout, images, and card renders
  useEffect(() => {
    scrollToBottom('auto');
    const t1 = setTimeout(() => scrollToBottom('auto'), 40);
    const t2 = setTimeout(() => scrollToBottom('auto'), 150);
    const t3 = setTimeout(() => scrollToBottom('smooth'), 350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Smooth scroll to bottom whenever messages are added or updated
  useEffect(() => {
    scrollToBottom('smooth');
    const t = setTimeout(() => scrollToBottom('smooth'), 80);
    return () => clearTimeout(t);
  }, [chatMessages.length]);

  // Fast predict keywords & sentences
  const quickChips = [
    { label: '📝 I have test tomorrow', text: "I have test tomorrow: Midterm Test at 10am, taking 3 hours, not recorded before." },
    { label: '⚡ CS 401 Algorithm proofs', text: "I'm overwhelmed by my CS 401 dynamic programming proofs due this Sunday. It takes heavy cognitive thinking." },
    { label: '📚 Reschedule Psychology prep', text: "Need to reschedule my psychology group presentation prep to later this week to save energy." },
    { label: '🛌 Exhausted & low energy', text: "I feel completely drained of energy today and cannot focus on deep work." },
    { label: '🌿 Need 20-min recovery', text: "I need a 20-minute recovery break right now to release stress." }
  ];

  // Helper to trigger tree leaves falling animation when shout detected
  const triggerShoutTreeAnimation = (db: number) => {
    setIsShoutDetected(true);
    setShowTreeAnimation(true);

    const newLeaves: LeafParticle[] = Array.from({ length: 16 }).map((_, i) => ({
      id: Date.now() + i,
      startX: Math.random() * 50 + 25,
      startY: Math.random() * 40 + 35,
      driftX: (Math.random() - 0.5) * 80,
      delay: Math.random() * 0.4,
      color: ['#86EFAC', '#4ADE80', '#FDE047', '#FDBA74', '#F472B6', '#C084FC', '#A78BFA'][Math.floor(Math.random() * 7)],
      size: Math.floor(Math.random() * 8) + 14,
      rotate: Math.floor(Math.random() * 360)
    }));

    setFallingLeaves(newLeaves);
  };

  // Start Voice Recording & Audio Analysis
  const startRecording = async () => {
    setIsRecording(true);
    setIsVoiceStopped(false);
    setRecordSeconds(0);
    setIsShoutDetected(false);
    setShowTreeAnimation(false);
    setFallingLeaves([]);

    timerIntervalRef.current = setInterval(() => {
      setRecordSeconds(prev => prev + 1);
    }, 1000);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const checkAudio = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          const db = Math.min(100, Math.floor(average * 0.7 + 30));
          setLiveDecibels(db);

          if (db > 70) {
            triggerShoutTreeAnimation(db);
          }
          if (analyserRef.current) {
            requestAnimationFrame(checkAudio);
          }
        };
        requestAnimationFrame(checkAudio);
      }
    } catch {
      const interval = setInterval(() => {
        const simDb = Math.floor(Math.random() * 25 + 38);
        setLiveDecibels(simDb);
      }, 300);
      return () => clearInterval(interval);
    }
  };

  const handleStopMicrophone = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsVoiceStopped(true);
  };

  const cancelRecording = () => {
    handleStopMicrophone();
    setIsRecording(false);
    setIsVoiceStopped(false);
    setRecordSeconds(0);
    setShowTreeAnimation(false);
  };

  const handleSendVoiceMessage = () => {
    const duration = `0:${recordSeconds < 10 ? '0' + recordSeconds : recordSeconds}`;
    handleStopMicrophone();
    setIsRecording(false);
    setIsVoiceStopped(false);

    const wave = [30, 45, 60, 85, 70, 95, 80, 60, 40, 50, 75, 90, 65, 40, 30];

    const transcript = isShoutDetected
      ? "AAAARGH! I am so overwhelmed by these project deadlines and exam proofs! I need to scream into the tree hole!"
      : "I had a really bad day, assignment deadline stressing me out, but I also have a test coming in a few days. I can't sleep well and lost motivation...";

    sendChatMessage(transcript, {
      isVoice: true,
      audioDuration: duration === '0:00' ? '0:06' : duration,
      audioWave: wave,
      isShoutVent: isShoutDetected,
      decibelLevel: liveDecibels,
    });

    setTimeout(() => {
      setShowTreeAnimation(false);
      setIsShoutDetected(false);
    }, 2500);
  };

  const lastOverloadNotifiedRef = useRef<number>(0);

  // Note: Automatic overload notice on initial entry has been removed per Section 1 requirements

  // Handle opening AddWorkloadModal prefilled from AI extracted unrecorded workload
  const handleOpenAddUnrecordedWorkload = (msg: any) => {
    const unrecorded = msg.unrecordedWorkload;
    if (!unrecorded) return;

    setAddWorkloadInitialData({
      title: unrecorded.title,
      dueDate: unrecorded.dueDate || '2026-09-09',
      dueTime: unrecorded.dueTime || '20:00',
      area: unrecorded.area || 'Academic',
      estimatedHours: unrecorded.estimatedHours || 3,
      urgency: unrecorded.urgency || 'High',
      activityType: unrecorded.activityType || 'Deep focus',
      notes: unrecorded.notes || 'Added from AI Stress Dump chat unrecorded workload.',
      onAddedSuccess: () => {
        markChatWorkloadAdded(msg.id);

        // Requirement 4: If adding task makes load become overloaded, trigger overload notice & recovery pathway suggestion
        const addedHours = unrecorded.estimatedHours || 3;
        const currentActive = workloads.filter(w => w.status !== 'Completed').reduce((acc, w) => acc + (w.estimatedHours || 0), 0);
        const totalAfterAdd = Number((currentActive + addedHours).toFixed(1));
        const isOverAfterAdd = totalAfterAdd > 20 || capacityProfile.analysisResult.demandResourceStatus === 'Overloaded' || (todayCheckIn && todayCheckIn.category === 'Very High');

        if (isOverAfterAdd) {
          const availHoursU = capacityProfile.candidateTimeHours;
          const deficit = availHoursU !== null ? Number(Math.max(0, totalAfterAdd - availHoursU).toFixed(1)) : null;
          setTimeout(() => {
            addAiChatMessage({
              isOverloadNotice: true,
              text: `⚠️ Workload Overload Notice: Adding "${unrecorded.title}" (${addedHours}h) has increased your active workload to ${totalAfterAdd}h (vs ${availHoursU}h capacity). Your current load is now Overloaded. Here is your suggested recovery pathway and next step plan:`,
              overloadSummary: {
                totalHours: totalAfterAdd,
                availableHours: availHoursU || 0,
                deficit: deficit || 0,
                taskTitle: unrecorded.title
              },
              suggestedAction: 'recover'
            });
          }, 350);
        }
      }
    });

    setIsAddWorkloadOpen(true);
  };

  // Open AddWorkloadModal prefilled from an extracted draft item
  const handleOpenAddTaskFromDraft = (msg: any, draft: any, index: number) => {
    setAddWorkloadInitialData({
      title: draft.title || '',
      dueDate: draft.dueDate || (draft.deadline ? draft.deadline.split('T')[0] : '2026-09-09'),
      dueTime: draft.dueTime || (draft.deadline && draft.deadline.includes('T') ? draft.deadline.split('T')[1].slice(0, 5) : '20:00'),
      area: draft.area || 'Academic',
      estimatedHours: draft.estimatedHours || 3,
      urgency: draft.urgency || 'High',
      flexibility: draft.flexibility || 'Moderate',
      activityType: draft.activityType || 'Deep focus',
      notes: draft.notes || 'Added from AI Stress Dump chat.',
      cognitive: draft.demandProfile?.cognitive || draft.cognitive || 4,
      emotional: draft.demandProfile?.emotional || draft.emotional || 3,
      physical: draft.demandProfile?.physical || draft.physical || 1,
      onAddedSuccess: () => {
        markChatWorkloadAdded(msg.id);
        setConfirmedMsgIds(prev => [...prev, `${msg.id}-${index}`, msg.id]);

        // Requirement 4: If adding draft task makes load become overloaded, trigger overload notice & recovery pathway suggestion
        const addedHours = draft.estimatedHours || 3;
        const currentActive = workloads.filter(w => w.status !== 'Completed').reduce((acc, w) => acc + (w.estimatedHours || 0), 0);
        const totalAfterAdd = Number((currentActive + addedHours).toFixed(1));
        const isOverAfterAdd = totalAfterAdd > 20 || capacityProfile.analysisResult.demandResourceStatus === 'Overloaded' || (todayCheckIn && todayCheckIn.category === 'Very High');

        if (isOverAfterAdd) {
          const availHoursD = capacityProfile.candidateTimeHours;
          const deficit = Number(Math.max(0, totalAfterAdd - availHoursD).toFixed(1));
          setTimeout(() => {
            addAiChatMessage({
              isOverloadNotice: true,
              text: `⚠️ Workload Overload Notice: Adding "${draft.title || 'Extracted Task'}" (${addedHours}h) has increased your active workload to ${totalAfterAdd}h (vs ${availHoursD}h 7-day candidate time). Your current load is now Overloaded. Here is your suggested recovery pathway and next step plan:`,
              overloadSummary: {
                totalHours: totalAfterAdd,
                availableHours: availHoursD,
                deficit,
                taskTitle: draft.title
              },
              suggestedAction: 'recover'
            });
          }, 350);
        }
      }
    });

    setIsAddWorkloadOpen(true);
  };

  const handleConfirmMessageDrafts = (msg: any) => {
    if (msg.extractedWorkloadDrafts) {
      confirmAllExtractedDrafts(msg.extractedWorkloadDrafts);
      setConfirmedMsgIds(prev => [...prev, msg.id]);
    }
  };

  // Open Full Workload Edit Modal (matches AddWorkloadModal at Workload Record)
  const handleOpenEditWorkload = (msg: any, index: number) => {
    setEditingMessage(msg);
    setEditingWorkloadIndex(index);
    const draft = msg.extractedWorkloadDrafts?.[index] || {};
    setEditingWorkloadDraft({
      title: draft.title || '',
      area: draft.area || 'Academic',
      activityType: draft.activityType || 'Deep focus',
      dueDate: draft.deadline ? draft.deadline.split('T')[0] : '2026-09-08',
      dueTime: draft.deadline && draft.deadline.includes('T') ? draft.deadline.split('T')[1].slice(0, 5) : '20:00',
      urgency: draft.urgency || 'High',
      flexibility: draft.flexibility || 'Moderate',
      estimatedHours: draft.estimatedHours || 3,
      cognitive: draft.demandProfile?.cognitive || draft.cognitive || 4,
      emotional: draft.demandProfile?.emotional || draft.emotional || 3,
      physical: draft.demandProfile?.physical || draft.physical || 1,
      perceivedStressImpact: draft.perceivedStressImpact || 4,
      notes: draft.notes || 'Added from AI dump'
    });
  };

  const handleSaveWorkloadDraft = () => {
    if (!editingMessage || !editingWorkloadDraft) return;
    const updatedDraft = {
      ...editingMessage.extractedWorkloadDrafts[editingWorkloadIndex],
      title: editingWorkloadDraft.title,
      area: editingWorkloadDraft.area,
      activityType: editingWorkloadDraft.activityType,
      deadline: `${editingWorkloadDraft.dueDate}T${editingWorkloadDraft.dueTime}:00`,
      urgency: editingWorkloadDraft.urgency,
      flexibility: editingWorkloadDraft.flexibility,
      estimatedHours: Number(editingWorkloadDraft.estimatedHours) || 1,
      demandProfile: {
        cognitive: editingWorkloadDraft.cognitive,
        emotional: editingWorkloadDraft.emotional,
        physical: editingWorkloadDraft.physical,
      },
      perceivedStressImpact: editingWorkloadDraft.perceivedStressImpact,
      notes: editingWorkloadDraft.notes,
    };
    editingMessage.extractedWorkloadDrafts[editingWorkloadIndex] = updatedDraft;
    setEditingWorkloadDraft(null);
    setEditingMessage(null);
  };

  // Open Category-level Stress Factors Modal (edit all things under stress factors directly in one modal)
  const handleOpenEditStressCategory = (msg: any) => {
    setEditingMessage(msg);
    setIsEditingStressCategory(true);
    setDraftDrivers(JSON.parse(JSON.stringify(msg.stressDrivers || ['Assignment & Project Deadlines', 'Sleep Disturbances'])));
    setDraftEffects(JSON.parse(JSON.stringify(msg.stressEffects || ['Cognitive Exhaustion', 'Tension in Shoulders', 'Lack of Motivation'])));
    setDraftRecovery(JSON.parse(JSON.stringify(msg.recoveryNeeds || ['15-min Decompression Break', 'Tree Hole Vent Session'])));
  };

  const handleSaveStressCategory = () => {
    if (!editingMessage) return;
    editingMessage.stressDrivers = draftDrivers;
    editingMessage.stressEffects = draftEffects;
    editingMessage.recoveryNeeds = draftRecovery;
    setIsEditingStressCategory(false);
    setEditingMessage(null);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      sendChatMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleChipClick = (text: string) => {
    sendChatMessage(text);
  };

  const togglePlayAudio = (id: string) => {
    if (audioPlayingId === id) {
      setAudioPlayingId(null);
    } else {
      setAudioPlayingId(id);
      setTimeout(() => {
        setAudioPlayingId(null);
      }, 3500);
    }
  };

  const isStrainedOrHighStress = capacityProfile.analysisResult.demandResourceStatus === 'Strained' ||
    capacityProfile.analysisResult.demandResourceStatus === 'Overloaded' ||
    (todayCheckIn && (todayCheckIn.category === 'High' || todayCheckIn.category === 'Very High'));

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      maxHeight: '100%',
      position: 'relative',
      padding: '12px 14px 86px 14px',
      boxSizing: 'border-box',
      gap: '8px',
      overflow: 'hidden',
      backgroundImage: `url('/assets/tree_hole_bg.jpg')`,
      backgroundSize: '100% 100%',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
      color: '#FFFFFF'
    }}>

      {/* HEADER */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 12px',
        backgroundColor: 'rgba(35, 18, 10, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: '16px',
        border: '1px solid rgba(205, 137, 84, 0.35)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            id="back-to-tree-btn"
            onClick={() => setActiveTab('tree')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              borderRadius: '10px',
              backgroundColor: 'rgba(254, 243, 199, 0.95)',
              border: '1px solid #CD8954',
              color: '#78350F',
              fontSize: '11.5px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
              transition: 'all 0.15s ease'
            }}
            title="Return to Tree Home"
          >
            <ArrowLeft size={13} />
            <span>Tree 🌳</span>
          </button>
          <div>
            <h2 className="serif-title" style={{ fontSize: '17px', fontWeight: 800, color: '#FEF3C7', letterSpacing: '-0.2px', margin: 0 }}>
              Tree Hole
            </h2>
          </div>
        </div>
      </div>

      {/* TREE HOLE SHOUT ANIMATION VIEW */}
      {showTreeAnimation && (
        <TreeHoleAnimationView
          isShaking={isShoutDetected}
          fallingLeaves={fallingLeaves}
          statusBadge="🌳 Tree Hole Decompression: Tension Absorbed"
        />
      )}

      {/* CHAT MESSAGES SCROLL AREA */}
      <div
        ref={messagesContainerRef}
        className="hide-scrollbar"
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          overflowY: 'auto',
          padding: '6px 4px',
        }}
      >
        {chatMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isPlaying = audioPlayingId === msg.id;

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                gap: '4px',
                animation: 'fadeIn 0.25s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#FEF3C7' }}>
                {msg.sender === 'gardener' ? (
                  <span style={{ color: '#86EFAC', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <img src="/assets/gardener.png" alt="Gardener" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                    Gardener Nicole
                  </span>
                ) : isUser ? (
                  <span style={{ color: '#FDE68A', fontWeight: 700 }}>Nicole</span>
                ) : (
                  <span style={{ color: '#FED7AA', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <img src="/assets/squirrel.png" alt="Squirrel" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                    Squirrel AI
                  </span>
                )}
                <span style={{ color: 'rgba(254, 243, 199, 0.75)' }}>• {msg.timestamp}</span>
              </div>

              {/* VOICE MESSAGE BUBBLE */}
              {msg.isVoice ? (
                <div style={{
                  maxWidth: '85%',
                  background: isUser
                    ? 'linear-gradient(135deg, rgba(240, 253, 244, 0.95) 0%, rgba(254, 249, 195, 0.85) 100%)'
                    : 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(12px)',
                  color: isUser ? '#166534' : Colors.textDark,
                  padding: '12px 16px',
                  borderRadius: isUser ? '22px 22px 4px 22px' : '22px 22px 22px 4px',
                  border: isUser ? '1.2px solid rgba(187, 247, 208, 0.9)' : '1.5px solid rgba(255, 255, 255, 0.95)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: Colors.shadowGlass,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => togglePlayAudio(msg.id)}
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: isUser ? '#166534' : '#8B5CF6',
                        color: '#FFFFFF',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                        flexShrink: 0
                      }}
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flex: 1, height: '24px' }}>
                      {(msg.audioWave || [30, 45, 60, 85, 70, 95, 80, 60, 40, 50, 75, 90, 65, 40, 30]).map((h, i) => (
                        <span
                          key={i}
                          style={{
                            width: '3px',
                            height: isPlaying ? `${Math.floor(Math.random() * 18) + 6}px` : `${Math.floor(h * 0.22) + 4}px`,
                            backgroundColor: isUser ? '#166534' : '#8B5CF6',
                            borderRadius: '2px',
                            opacity: isPlaying ? 1 : 0.85,
                            transition: 'height 0.15s ease'
                          }}
                        />
                      ))}
                    </div>

                    <span style={{ fontSize: '11px', fontWeight: 700, opacity: 0.9, whiteSpace: 'nowrap' }}>
                      {msg.audioDuration || '0:05'}
                    </span>
                  </div>

                  <div style={{
                    fontSize: '12.5px',
                    lineHeight: '1.4',
                    borderTop: isUser ? '1px solid rgba(187, 247, 208, 0.6)' : '1px solid rgba(226, 232, 240, 0.8)',
                    paddingTop: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontSize: '9.5px',
                        fontWeight: 800,
                        backgroundColor: isUser ? 'rgba(22, 101, 52, 0.12)' : '#EDE9FE',
                        color: isUser ? '#166534' : '#7C3AED',
                        padding: '1px 6px',
                        borderRadius: '8px'
                      }}>
                        {msg.isShoutVent ? '🌳 Tree Hole Shout' : '🎤 Voice Dump'}
                      </span>
                    </div>
                    <span>"{msg.text}"</span>
                  </div>
                </div>
              ) : msg.sender === 'gardener' ? (
                /* GARDENER QUESTION BUBBLE */
                <div style={{
                  maxWidth: '88%',
                  background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.98) 0%, rgba(240, 253, 244, 0.95) 100%)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderRadius: '22px 22px 22px 4px',
                  border: '1.5px solid #F59E0B',
                  boxShadow: '0 4px 16px rgba(245, 158, 11, 0.15)',
                  padding: '14px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '10.5px',
                      fontWeight: 800,
                      color: '#92400E',
                      backgroundColor: '#FEF3C7',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      border: '1px solid #FDE68A'
                    }}>
                      👨‍🌾 Question for AI &amp; Nicole
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#1F2937', fontWeight: 700, lineHeight: 1.45 }}>
                    "{msg.text}"
                  </div>
                </div>
              ) : (
                /* TEXT BUBBLE */
                <div style={{
                  maxWidth: '88%',
                  background: isUser
                    ? 'linear-gradient(135deg, rgba(240, 253, 244, 0.95) 0%, rgba(254, 249, 195, 0.88) 100%)'
                    : 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  color: isUser ? '#166534' : Colors.textDark,
                  padding: isUser ? '12px 18px' : '16px 18px',
                  borderRadius: isUser ? '20px 20px 4px 20px' : '22px 22px 22px 4px',
                  border: isUser ? '1.2px solid rgba(187, 247, 208, 0.9)' : '1.5px solid rgba(255, 255, 255, 0.85)',
                  fontSize: '13.5px',
                  lineHeight: '1.45',
                  boxShadow: isUser ? '0 4px 14px rgba(34, 197, 94, 0.08)' : Colors.shadowGlass,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {/* Message Text with Squirrel AI intro message */}
                  {!isUser && msg.id === 'm1' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#B45309', fontWeight: 800, fontSize: '13px' }}>
                        <img src="/assets/squirrel.png" alt="Squirrel AI" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                        <span>Squirrel AI</span>
                      </div>
                      <div style={{ color: '#451A03', lineHeight: 1.5, fontSize: '13.5px' }}>
                        {msg.text || "Hi Nicole! *Squeak!* Feel free to dump your stress, thoughts, or unrecorded tasks into this tree hole. I'll help you organize your workload and find balance for your tree."}
                      </div>
                    </div>
                  ) : msg.isNicoleDemoExtraction ? (
                    <div style={{ color: '#1E293B', fontSize: '13.5px', lineHeight: 1.45 }}>
                      {msg.text || "Nicole, I've identified your workload items from your stress dump. Please review and add them to your tree:"}
                    </div>
                  ) : msg.text ? (
                    <div style={{ whiteSpace: 'pre-line' }}>
                      {msg.isGardenerExplanation && todayCheckIn
                        ? "Nicole, your tree condition and weather directly mirror your current mental capacity and daily stress level:"
                        : msg.text}
                    </div>
                  ) : null}

                  {/* NICOLE PRE-DUMP DAILY CHECK-IN PROMPT */}
                  {!isUser && msg.isNicoleCheckInPrompt && (
                    <div style={{
                      marginTop: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      {!todayCheckIn ? (
                        <button
                          type="button"
                          id="chat-nicole-checkin-btn"
                          onClick={() => {
                            setCheckInSource('chat');
                            setIsCheckInOpen(true);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            background: 'linear-gradient(135deg, #6761d3ff 0%, #7C3AED 100%)',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '16px',
                            padding: '12px 20px',
                            fontSize: '13.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 4px 16px rgba(124, 58, 237, 0.28)',
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            letterSpacing: '0.2px',
                            alignSelf: 'flex-start',
                            width: '100%',
                            maxWidth: '320px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.38)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0px)';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(124, 58, 237, 0.28)';
                          }}
                        >
                          <ClipboardList size={17} color="#FFFFFF" strokeWidth={2.4} />
                          <span>Fill in Daily Check-in</span>
                          <ArrowRight size={15} color="#FFFFFF" strokeWidth={2.4} />
                        </button>
                      ) : (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                          backgroundColor: '#F0FDF4',
                          border: '1.5px solid #86EFAC',
                          borderRadius: '16px',
                          padding: '10px 14px',
                          color: '#166534',
                          fontWeight: 700,
                          fontSize: '13px',
                          boxShadow: '0 2px 8px rgba(34, 197, 94, 0.08)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle2 size={18} color="#166534" />
                            <span>Daily Check-in Completed</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI EXTRACTED UNRECORDED WORKLOAD CARD */}
                  {!isUser && msg.unrecordedWorkload && (
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(255, 248, 241, 0.96) 0%, rgba(255, 241, 242, 0.75) 50%, rgba(245, 243, 255, 0.88) 100%)',
                      borderRadius: '20px',
                      border: '1.5px solid rgba(251, 146, 60, 0.65)',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      width: '100%',
                      boxSizing: 'border-box',
                      boxShadow: '0 4px 16px rgba(251, 146, 60, 0.08)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: Colors.peachText, fontWeight: 800, fontSize: '13px' }}>
                          <Sparkles size={15} color={Colors.peachText} />
                          <span>Extracted Workload Info:</span>
                        </div>
                        <span style={{
                          fontSize: '11px',
                          color: msg.isAddedToCalendar ? '#15803D' : '#C2410C',
                          fontWeight: 700,
                          backgroundColor: msg.isAddedToCalendar ? '#DCFCE7' : '#FFF7ED',
                          padding: '2px 8px',
                          borderRadius: '8px',
                          border: msg.isAddedToCalendar ? '1px solid #86EFAC' : '1px solid #FED7AA'
                        }}>
                          {msg.isAddedToCalendar ? '✓ Added to Calendar' : 'Pending Confirmation'}
                        </span>
                      </div>

                      {/* Workload Info Details Box */}
                      <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        padding: '14px',
                        border: '1px solid rgba(254, 215, 170, 0.8)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '16px' }}>📌</span>
                            <span style={{ fontSize: '14.5px', fontWeight: 800, color: Colors.textDark }}>
                              {msg.unrecordedWorkload.title}
                            </span>
                          </div>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: '#EFF6FF',
                            color: '#1D4ED8',
                            padding: '2px 8px',
                            borderRadius: '8px',
                            flexShrink: 0
                          }}>
                            {msg.unrecordedWorkload.area}
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '6px', borderTop: '1px solid #F1F5F9' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                              Deadline
                            </span>
                            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#DC2626' }}>
                              {msg.unrecordedWorkload.dueDate} at {msg.unrecordedWorkload.dueTime}
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                              Estimated Time
                            </span>
                            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#059669' }}>
                              {msg.unrecordedWorkload.estimatedHours} hours
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Add Task Button (when not yet added) - Matches Edit button color */}
                      {!msg.isAddedToCalendar ? (
                        <button
                          type="button"
                          onClick={() => handleOpenAddUnrecordedWorkload(msg)}
                          style={{
                            width: '100%',
                            backgroundColor: '#FFF7ED',
                            color: '#C2410C',
                            border: '1.2px solid #FED7AA',
                            borderRadius: '16px',
                            padding: '11px 18px',
                            fontWeight: 800,
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '7px',
                            boxShadow: '0 2px 8px rgba(234, 88, 12, 0.08)',
                            transition: 'all 0.15s ease',
                            marginTop: '2px'
                          }}
                        >
                          <Plus size={15} color="#C2410C" strokeWidth={2.8} />
                          <span style={{ color: '#C2410C' }}>Add Task</span>
                        </button>
                      ) : (
                        <div style={{
                          backgroundColor: '#DCFCE7',
                          border: '1.5px solid #86EFAC',
                          color: '#166534',
                          borderRadius: '16px',
                          padding: '11px 16px',
                          fontWeight: 800,
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}>
                          <CheckCircle2 size={16} color="#166534" />
                          <span>Task Added to Calendar Successfully</span>
                        </div>
                      )}
                    </div>
                  )}


                  {/* AI PROACTIVE OVERLOAD NOTICE CARD (Requirements 3 & 4) */}
                  {!isUser && msg.isOverloadNotice && (
                    <AiAnalysisNextPlanCard
                      taskTitle={msg.overloadSummary?.taskTitle}
                      totalWorkloadHours={msg.overloadSummary?.totalHours || workloads.filter(w => w.status !== 'Completed').reduce((acc, w) => acc + (w.estimatedHours || 0), 0)}
                      availableHours={msg.overloadSummary?.availableHours}
                      deficit={msg.overloadSummary?.deficit}
                      isOverloaded={true}
                      isNicoleAnalysisPlan={msg.isNicoleAnalysisPlan}
                      onTreeHole={() => setIsTreeHoleOpen(true)}
                      onColourReflection={() => setIsColourReflectionOpen(true)}
                      onGoToAnalysis={() => setActiveTab('map')}
                      onGoToBalance={() => setActiveTab('balance')}
                    />
                  )}

                  {/* WORKLOAD AREA ANALYSIS RESULT CARD */}
                  {!isUser && msg.isWorkloadAreaResult && msg.workloadAreaDetails && (
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '18px',
                      padding: '14px 16px',
                      border: '1.5px solid #BFDBFE',
                      boxShadow: '0 4px 16px rgba(37, 99, 235, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '15px' }}>📚</span>
                          <span style={{ fontSize: '12.5px', fontWeight: 900, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                            HEAVIEST WORKLOAD AREA
                          </span>
                        </div>
                        <span style={{
                          backgroundColor: '#EFF6FF',
                          color: '#1D4ED8',
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '8px',
                          border: '1px solid #DBEAFE'
                        }}>
                          {msg.workloadAreaDetails.dominantArea} ({msg.workloadAreaDetails.dominantPercent}%)
                        </span>
                      </div>

                      {/* Distribution Bar */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{
                          width: '100%',
                          height: '10px',
                          backgroundColor: '#F1F5F9',
                          borderRadius: '999px',
                          display: 'flex',
                          overflow: 'hidden'
                        }}>
                          <div
                            style={{
                              width: `${msg.workloadAreaDetails.dominantPercent}%`,
                              backgroundColor: '#2563EB'
                            }}
                          />
                          <div
                            style={{
                              width: `${100 - msg.workloadAreaDetails.dominantPercent}%`,
                              backgroundColor: '#EA580C'
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748B', fontWeight: 700 }}>
                          <span style={{ color: '#2563EB' }}>● Academic: {msg.workloadAreaDetails.dominantHours}h</span>
                          <span style={{ color: '#EA580C' }}>● Extracurricular: {msg.workloadAreaDetails.otherAreas[0]?.hours ?? 14}h</span>
                        </div>
                      </div>

                      {/* Tasks in Dominant Area */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #F1F5F9', paddingTop: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>
                          Active Academic Commitments ({msg.workloadAreaDetails.dominantHours}h):
                        </span>
                        {msg.workloadAreaDetails.tasksInDominantArea.map((task, tIdx) => (
                          <div
                            key={tIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              backgroundColor: '#F8FAFC',
                              padding: '6px 10px',
                              borderRadius: '10px',
                              fontSize: '11.5px',
                              border: '1px solid #E2E8F0'
                            }}
                          >
                            <span style={{ fontWeight: 600, color: '#1E293B' }}>{task.title}</span>
                            <span style={{ fontWeight: 800, color: '#2563EB' }}>{task.hours}h</span>
                          </div>
                        ))}
                      </div>

                      {/* Action shortcut to balance */}
                      <button
                        type="button"
                        onClick={() => setActiveTab('balance')}
                        style={{
                          backgroundColor: '#ECFDF5',
                          border: '1.2px solid #6EE7B7',
                          color: '#065F46',
                          borderRadius: '12px',
                          padding: '8px 12px',
                          fontSize: '11.5px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 1px 4px rgba(16, 185, 129, 0.1)',
                          marginTop: '2px'
                        }}
                      >
                        <span>🌳 Go to Balance to Fix Tree</span>
                        <ArrowRight size={13} strokeWidth={2.4} />
                      </button>
                    </div>
                  )}

                  {/* NICOLE CANONICAL DEMO EXTRACTION CARD */}
                  {!isUser && msg.isNicoleDemoExtraction && (
                    <NicoleDemoExtractionCard
                      msg={msg}
                      onClarify={() => clarifyNicoleMessage(msg.id)}
                      onConfirm={() => confirmNicoleStressDump(msg.id)}
                      onGoToWorkloads={() => setActiveTab('workloads')}
                    />
                  )}

                  {/* AI EXTRACTED WORKLOAD & STRESS FACTORS CONFIRMATION CARD */}
                  {!isUser && !msg.isNicoleDemoExtraction && msg.extractedWorkloadDrafts && msg.extractedWorkloadDrafts.length > 0 && (
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(255, 248, 241, 0.95) 0%, rgba(255, 241, 242, 0.7) 50%, rgba(245, 243, 255, 0.85) 100%)',
                      borderRadius: '20px',
                      border: '1.5px dashed rgba(251, 146, 60, 0.6)',
                      padding: '16px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      width: '100%',
                      boxSizing: 'border-box',
                      boxShadow: '0 2px 12px rgba(251, 146, 60, 0.06)'
                    }}>
                      {/* Section 1: Workloads with Individual Workload Record Edit Modal */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: Colors.peachText, fontWeight: 800, fontSize: '13px' }}>
                            <Sparkles size={15} color={Colors.peachText} />
                            <span>AI Extracted Workload Items:</span>
                          </div>
                          <span style={{ fontSize: '11px', color: '#9A3412', fontWeight: 600 }}>
                            {msg.extractedWorkloadDrafts.length} item{msg.extractedWorkloadDrafts.length > 1 ? 's' : ''}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {msg.extractedWorkloadDrafts.map((draft: any, dIdx: number) => {
                            const isDraftAdded = confirmedMsgIds.includes(`${msg.id}-${dIdx}`) || confirmedMsgIds.includes(msg.id) || msg.isAddedToCalendar;

                            return (
                              <div
                                key={dIdx}
                                style={{
                                  backgroundColor: '#FFFFFF',
                                  borderRadius: '14px',
                                  padding: '10px 14px',
                                  border: '1px solid rgba(254, 215, 170, 0.8)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '10px',
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                                }}
                              >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '14px' }}>📌</span>
                                    <span style={{ fontSize: '13.5px', fontWeight: 800, color: Colors.textDark }}>
                                      {draft.title}
                                    </span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: '#64748B', paddingLeft: '22px' }}>
                                    <Clock size={12} color="#059669" />
                                    <span style={{ fontWeight: 700, color: '#059669' }}>{draft.estimatedHours} hrs</span>
                                  </div>
                                </div>

                                {isDraftAdded ? (
                                  <div style={{
                                    backgroundColor: '#DCFCE7',
                                    border: '1.2px solid #86EFAC',
                                    borderRadius: '10px',
                                    padding: '6px 12px',
                                    fontSize: '11.5px',
                                    fontWeight: 800,
                                    color: '#166534',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    flexShrink: 0
                                  }}>
                                    <Check size={13} strokeWidth={3} />
                                    <span>Added</span>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAddTaskFromDraft(msg, draft, dIdx)}
                                    style={{
                                      backgroundColor: '#FFF7ED',
                                      border: '1.2px solid #FED7AA',
                                      borderRadius: '12px',
                                      padding: '7px 14px',
                                      fontSize: '12px',
                                      fontWeight: 800,
                                      color: '#C2410C',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      flexShrink: 0,
                                      boxShadow: '0 2px 8px rgba(234, 88, 12, 0.08)',
                                      transition: 'all 0.15s ease'
                                    }}
                                    title="Add task to calendar"
                                  >
                                    <Plus size={13} color="#C2410C" strokeWidth={2.8} />
                                    <span style={{ color: '#C2410C' }}>Add Task</span>
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Status indicator when added */}
                      {(confirmedMsgIds.includes(msg.id) || msg.isAddedToCalendar) && (
                        <div style={{
                          backgroundColor: '#DCFCE7',
                          border: '1.2px solid #86EFAC',
                          color: '#166534',
                          borderRadius: '14px',
                          padding: '10px 14px',
                          fontWeight: 800,
                          fontSize: '12.5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          marginTop: '2px'
                        }}>
                          <CheckCircle2 size={16} color="#166534" />
                          <span>Task Added to Calendar Successfully</span>
                        </div>
                      )}
                    </div>
                  )}


                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} style={{ height: '1px', flexShrink: 0, marginTop: '2px' }} />
      </div>

      {/* QUICK PROMPT / SHORTCUT BUTTONS ROW (Above Type Section) */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '6px 2px',
        alignItems: 'center',
        flexShrink: 0
      }}>
        {/* QUICK SHORTCUT BUTTON: "I want to fix my tree (balance)" */}
        {chatMessages.some(m => m.isGardenerExplanation || (m.isOverloadNotice && m.isNicoleAnalysisPlan)) && (
          <button
            type="button"
            id="fix-my-tree-quick-prompt-btn"
            onClick={() => setActiveTab('balance')}
            style={{
              backgroundColor: '#ECFDF5',
              backdropFilter: 'blur(10px)',
              border: '1.5px solid #10B981',
              borderRadius: '20px',
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: 800,
              color: '#065F46',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 3px 12px rgba(16, 185, 129, 0.22)',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              transition: 'all 0.15s ease',
              animation: 'fadeIn 0.25s ease'
            }}
            title="Navigate to Balance view to fix tree"
          >
            <span style={{ fontSize: '15px' }}>🌳</span>
            <span>I want to fix my tree (balance)</span>
          </button>
        )}

        {/* DEMO QUESTION QUICK CHIP: "What is my most workload area?" (Shown once user taps typing section) */}
        {chatMessages.some(m => m.isGardenerExplanation || (m.isOverloadNotice && m.isNicoleAnalysisPlan)) && hasTappedTyping && (
          <button
            type="button"
            id="quick-prompt-workload-area-btn"
            onClick={() => {
              sendChatMessage("What is my most workload area?");
              setInputText('');
            }}
            style={{
              backgroundColor: '#EFF6FF',
              backdropFilter: 'blur(10px)',
              border: '1.5px solid #93C5FD',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '12.5px',
              fontWeight: 800,
              color: '#1D4ED8',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 3px 12px rgba(59, 130, 246, 0.18)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
              animation: 'fadeIn 0.25s ease'
            }}
            title="Ask AI what your heaviest workload area is"
          >
            <span style={{ fontSize: '14px' }}>📊</span>
            <span>What is my most workload area?</span>
          </button>
        )}

        {/* DEMO HELPER BUTTON (Hidden if demo already completed to keep focus on quick prompt) */}
        {!chatMessages.some(m => m.nicoleConfirmed) && (
          <button
            type="button"
            onClick={() => setInputText(NICOLE_NARRATIVE)}
            style={{
              backgroundColor: '#FFF7ED',
              backdropFilter: 'blur(10px)',
              border: '1.5px solid #FDBA74',
              borderRadius: '18px',
              padding: '7px 16px',
              fontSize: '12.5px',
              fontWeight: 800,
              color: '#9A3412',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 10px rgba(234, 88, 12, 0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
            title="Populate input with Nicole's canonical narrative"
          >
            <Sparkles size={14} color="#EA580C" />
            <span>Try Nicole's Demo</span>
          </button>
        )}
      </div>

      {/* ACTIVE VOICE RECORDING PANEL */}
      {isRecording ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '14px 18px',
          boxShadow: '0 12px 36px rgba(139, 92, 246, 0.18)',
          border: '1.5px solid rgba(196, 181, 253, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: isVoiceStopped ? '#10B981' : '#EF4444',
                animation: isVoiceStopped ? 'none' : 'pulse 1s infinite'
              }} />
              <span style={{ fontSize: '13px', fontWeight: 800, color: Colors.textDark }}>
                {isVoiceStopped ? 'Recording Stopped' : 'Listening... (Speak or Shout)'}
              </span>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#7C3AED' }}>
              0:{recordSeconds < 10 ? '0' + recordSeconds : recordSeconds}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            height: '32px',
            backgroundColor: 'rgba(248, 250, 252, 0.8)',
            borderRadius: '16px',
            padding: '4px 12px'
          }}>
            {Array.from({ length: 24 }).map((_, i) => {
              const barHeight = isVoiceStopped
                ? 12
                : Math.min(28, Math.max(4, Math.floor((liveDecibels / 100) * (Math.random() * 24 + 6))));
              return (
                <span
                  key={i}
                  style={{
                    width: '3.5px',
                    height: `${barHeight}px`,
                    backgroundColor: isVoiceStopped ? '#166534' : (liveDecibels > 70 ? '#DC2626' : '#8B5CF6'),
                    borderRadius: '2px',
                    transition: 'height 0.1s ease'
                  }}
                />
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              onClick={cancelRecording}
              style={{
                backgroundColor: '#F1F5F9',
                color: Colors.textMuted,
                border: 'none',
                borderRadius: '16px',
                padding: '7px 14px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={isVoiceStopped ? startRecording : handleStopMicrophone}
              title={isVoiceStopped ? "Recording stopped (click to record again)" : "Stop recording"}
              style={{
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                border: '1.2px solid #FCA5A5',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.18)',
                transition: 'all 0.15s ease'
              }}
            >
              <Square size={13} fill="#DC2626" />
            </button>

            <button
              type="button"
              onClick={handleSendVoiceMessage}
              title="Send Voice Dump"
              style={{
                background: 'linear-gradient(135deg, #DCFCE7 0%, #FEF9C3 100%)',
                color: '#166534',
                border: '1.2px solid rgba(187, 247, 208, 0.9)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(187, 247, 208, 0.35)'
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      ) : (
        /* STANDARD BOTTOM TYPING BAR */
        <form
          onSubmit={handleSend}
          onClick={() => {
            const hasSeenDailyStatus = chatMessages.some(m => m.isGardenerExplanation || (m.isOverloadNotice && m.isNicoleAnalysisPlan));
            if (hasSeenDailyStatus) {
              setHasTappedTyping(true);
              if (!inputText.trim()) {
                setInputText("What is my most workload area?");
              }
            }
          }}
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: inputText.includes('\n') ? '20px' : '32px',
            padding: '5px 8px 5px 16px',
            border: '3px solid #FED7AA',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
            transition: 'border-radius 0.2s ease',
            zIndex: 10,
            flexShrink: 0
          }}
        >
          <textarea
            placeholder="type..."
            value={inputText}
            onFocus={() => {
              const hasSeenDailyStatus = chatMessages.some(m => m.isGardenerExplanation || (m.isOverloadNotice && m.isNicoleAnalysisPlan));
              if (hasSeenDailyStatus) {
                setHasTappedTyping(true);
                if (!inputText.trim()) {
                  setInputText("What is my most workload area?");
                }
              }
            }}
            onClick={() => {
              const hasSeenDailyStatus = chatMessages.some(m => m.isGardenerExplanation || (m.isOverloadNotice && m.isNicoleAnalysisPlan));
              if (hasSeenDailyStatus) {
                setHasTappedTyping(true);
                if (!inputText.trim()) {
                  setInputText("What is my most workload area?");
                }
              }
            }}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            rows={inputText.includes('\n') ? 3 : 1}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontSize: '14px',
              color: '#1E293B',
              padding: '8px 0',
              resize: 'none',
              fontFamily: 'inherit',
              lineHeight: '1.4',
              maxHeight: '80px',
              overflowY: 'auto'
            }}
          />

          {/* Warm Orange Mic Button (Image 2 style) */}
          <button
            type="button"
            onClick={startRecording}
            style={{
              background: 'radial-gradient(circle, #FED7AA 0%, #FFEDD5 80%)',
              color: '#EA580C',
              border: '1.2px solid rgba(251, 146, 60, 0.4)',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)',
              transition: 'all 0.15s ease'
            }}
            title="Record Voice Message (Shout triggers falling leaves animation)"
          >
            <Mic size={18} />
          </button>

          {/* Cyan/Blue Send Button (Image 2 style) */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            style={{
              background: inputText.trim()
                ? 'radial-gradient(circle, #BAE6FD 0%, #E0F2FE 80%)'
                : 'rgba(226, 232, 240, 0.8)',
              color: inputText.trim() ? '#0284C7' : '#94A3B8',
              border: inputText.trim() ? '1.2px solid rgba(56, 189, 248, 0.5)' : 'none',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputText.trim() ? 'pointer' : 'default',
              flexShrink: 0,
              boxShadow: inputText.trim() ? '0 2px 8px rgba(2, 132, 199, 0.3)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Send size={16} />
          </button>
        </form>
      )}

      {/* 1. WORKLOAD RECORD EDIT MODAL (Specification: edit will open modal like the one at workload record) */}
      {editingWorkloadDraft && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(8px)',
          zIndex: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '26px',
            width: '100%',
            maxWidth: '420px',
            maxHeight: '88vh',
            overflowY: 'auto',
            padding: '22px 20px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            border: '1.5px solid rgba(226, 232, 240, 0.9)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
              <div>
                <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Workload Task Details
                </span>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: Colors.textDark, margin: '2px 0 0 0' }}>
                  Edit Workload Record
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingWorkloadDraft(null)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={16} color="#64748B" />
              </button>
            </div>

            {/* Area Selector Tabs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748B' }}>WORKLOAD AREA</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {(['Academic', 'Personal', 'Social', 'Self-Care'] as const).map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setEditingWorkloadDraft({ ...editingWorkloadDraft, area: a })}
                    style={{
                      padding: '7px 4px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      border: editingWorkloadDraft.area === a ? '1.5px solid #0D9488' : '1px solid #E2E8F0',
                      backgroundColor: editingWorkloadDraft.area === a ? '#F0FDFA' : '#F8FAFC',
                      color: editingWorkloadDraft.area === a ? '#0F766E' : '#64748B',
                      textAlign: 'center'
                    }}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Task Title */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748B' }}>TASK TITLE</label>
              <input
                type="text"
                value={editingWorkloadDraft.title}
                onChange={(e) => setEditingWorkloadDraft({ ...editingWorkloadDraft, title: e.target.value })}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 12px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13.5px',
                  marginTop: '4px',
                  fontWeight: 600
                }}
              />
            </div>

            {/* Activity Type & Due Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748B' }}>ACTIVITY TYPE</label>
                <select
                  value={editingWorkloadDraft.activityType}
                  onChange={(e) => setEditingWorkloadDraft({ ...editingWorkloadDraft, activityType: e.target.value })}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    marginTop: '4px',
                    backgroundColor: '#FFFFFF',
                    fontWeight: 700
                  }}
                >
                  <option value="Deep focus">Deep focus</option>
                  <option value="Communication">Communication</option>
                  <option value="Creative">Creative</option>
                  <option value="Physical">Physical</option>
                  <option value="Administrative">Administrative</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748B' }}>DUE DATE</label>
                <input
                  type="date"
                  value={editingWorkloadDraft.dueDate}
                  onChange={(e) => setEditingWorkloadDraft({ ...editingWorkloadDraft, dueDate: e.target.value })}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    marginTop: '4px'
                  }}
                />
              </div>
            </div>

            {/* Estimated Hours & Urgency */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748B' }}>ESTIMATED HOURS</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="20"
                  value={editingWorkloadDraft.estimatedHours}
                  onChange={(e) => setEditingWorkloadDraft({ ...editingWorkloadDraft, estimatedHours: parseFloat(e.target.value) || 1 })}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    marginTop: '4px',
                    fontWeight: 700
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748B' }}>URGENCY LEVEL</label>
                <select
                  value={editingWorkloadDraft.urgency}
                  onChange={(e) => setEditingWorkloadDraft({ ...editingWorkloadDraft, urgency: e.target.value })}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    marginTop: '4px',
                    backgroundColor: '#FFFFFF',
                    fontWeight: 700
                  }}
                >
                  <option value="Urgent">🚨 Urgent</option>
                  <option value="High">⚡ High</option>
                  <option value="Medium">⏳ Medium</option>
                  <option value="Low">🌱 Low</option>
                </select>
              </div>
            </div>

            {/* Demand Profile Sliders (Cognitive, Emotional, Physical) */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '16px',
              padding: '12px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569' }}>
                DEMAND PROFILE (RATING 1-5)
              </span>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                  <span style={{ color: '#7C3AED' }}>🧠 Cognitive Demand</span>
                  <span>{editingWorkloadDraft.cognitive}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={editingWorkloadDraft.cognitive}
                  onChange={(e) => setEditingWorkloadDraft({ ...editingWorkloadDraft, cognitive: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: '#7C3AED' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                  <span style={{ color: '#E11D48' }}>❤️ Emotional Demand</span>
                  <span>{editingWorkloadDraft.emotional}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={editingWorkloadDraft.emotional}
                  onChange={(e) => setEditingWorkloadDraft({ ...editingWorkloadDraft, emotional: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: '#E11D48' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                  <span style={{ color: '#059669' }}>🏃 Physical Demand</span>
                  <span>{editingWorkloadDraft.physical}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={editingWorkloadDraft.physical}
                  onChange={(e) => setEditingWorkloadDraft({ ...editingWorkloadDraft, physical: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: '#059669' }}
                />
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setEditingWorkloadDraft(null)}
                style={{
                  padding: '11px',
                  borderRadius: '14px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveWorkloadDraft}
                style={{
                  padding: '11px',
                  borderRadius: '14px',
                  border: 'none',
                  backgroundColor: '#0D9488',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)'
                }}
              >
                Save Workload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. STRESS FACTORS CATEGORY MODAL (Specification: edit all things under stress factors directly in one modal) */}
      {isEditingStressCategory && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(8px)',
          zIndex: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '26px',
            width: '100%',
            maxWidth: '400px',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '22px 20px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            border: '1.5px solid rgba(196, 181, 253, 0.8)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
              <div>
                <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Category-Level Editor
                </span>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: Colors.textDark, margin: '2px 0 0 0' }}>
                  Edit Stress Factors Category
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingStressCategory(false)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={16} color="#64748B" />
              </button>
            </div>

            <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
              Edit all drivers, effects, and recovery needs directly together in this category modal without opening one by one.
            </p>

            {/* Category Subsection 1: Stress Drivers & Triggers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#6D28D9' }}>
                1. STRESS DRIVERS & TRIGGERS
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {draftDrivers.map((driver, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#F3E8FF', padding: '4px 8px', borderRadius: '8px', border: '1px solid #DDD6FE' }}>
                    <span style={{ fontSize: '11.5px', color: '#6D28D9', fontWeight: 600 }}>{driver}</span>
                    <button
                      type="button"
                      onClick={() => setDraftDrivers(prev => prev.filter((_, i) => i !== idx))}
                      style={{ background: 'none', border: 'none', color: '#BE123C', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '3px' }}>
                <input
                  type="text"
                  placeholder="Add stress trigger..."
                  value={newDriverText}
                  onChange={(e) => setNewDriverText(e.target.value)}
                  style={{ flex: 1, padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newDriverText.trim()) {
                      setDraftDrivers(prev => [...prev, newDriverText.trim()]);
                      setNewDriverText('');
                    }
                  }}
                  style={{ backgroundColor: '#7C3AED', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '0 12px', fontWeight: 700, fontSize: '11.5px', cursor: 'pointer' }}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Category Subsection 2: Stress Effects & Symptoms */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #F1F5F9', paddingTop: '8px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#BE123C' }}>
                2. STRESS EFFECTS & SYMPTOMS
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {draftEffects.map((effect, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#FFE4E6', padding: '4px 8px', borderRadius: '8px', border: '1px solid #FECDD3' }}>
                    <span style={{ fontSize: '11.5px', color: '#9F1239', fontWeight: 600 }}>{effect}</span>
                    <button
                      type="button"
                      onClick={() => setDraftEffects(prev => prev.filter((_, i) => i !== idx))}
                      style={{ background: 'none', border: 'none', color: '#BE123C', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '3px' }}>
                <input
                  type="text"
                  placeholder="Add symptom/effect..."
                  value={newEffectText}
                  onChange={(e) => setNewEffectText(e.target.value)}
                  style={{ flex: 1, padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newEffectText.trim()) {
                      setDraftEffects(prev => [...prev, newEffectText.trim()]);
                      setNewEffectText('');
                    }
                  }}
                  style={{ backgroundColor: '#E11D48', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '0 12px', fontWeight: 700, fontSize: '11.5px', cursor: 'pointer' }}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Category Subsection 3: Recovery Needs & Preferences */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #F1F5F9', paddingTop: '8px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#059669' }}>
                3. RECOVERY PREFERENCES
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {draftRecovery.map((rec, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#DCFCE7', padding: '4px 8px', borderRadius: '8px', border: '1px solid #86EFAC' }}>
                    <span style={{ fontSize: '11.5px', color: '#166534', fontWeight: 600 }}>{rec}</span>
                    <button
                      type="button"
                      onClick={() => setDraftRecovery(prev => prev.filter((_, i) => i !== idx))}
                      style={{ background: 'none', border: 'none', color: '#166534', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '3px' }}>
                <input
                  type="text"
                  placeholder="Add recovery suggestion..."
                  value={newRecoveryText}
                  onChange={(e) => setNewRecoveryText(e.target.value)}
                  style={{ flex: 1, padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newRecoveryText.trim()) {
                      setDraftRecovery(prev => [...prev, newRecoveryText.trim()]);
                      setNewRecoveryText('');
                    }
                  }}
                  style={{ backgroundColor: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '0 12px', fontWeight: 700, fontSize: '11.5px', cursor: 'pointer' }}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setIsEditingStressCategory(false)}
                style={{
                  padding: '11px',
                  borderRadius: '14px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveStressCategory}
                style={{
                  padding: '11px',
                  borderRadius: '14px',
                  border: 'none',
                  backgroundColor: '#7C3AED',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)'
                }}
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.2); }
        }
        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
};
