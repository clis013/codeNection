import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';
import {
  Send, Mic, Sparkles, Check, ArrowRight, Zap, Coffee, Clock,
  Play, Pause, Volume2, X, RotateCcw, Feather, TreePine, AlertCircle,
  Square, CheckCircle2, Edit3, Heart, Palette, Scale, BarChart2, Plus, AlertTriangle
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

// Reusable AI Analysis & Next Step Plan Card (suggests recovery pathway + next step plan)
const AiAnalysisNextPlanCard: React.FC<{
  taskTitle?: string;
  taskHours?: number;
  totalWorkloadHours?: number;
  availableHours?: number;
  deficit?: number;
  isOverloaded?: boolean;
  isNicoleAnalysisPlan?: boolean;
  onTreeHole: () => void;
  onColourReflection: () => void;
  onGoToAnalysis: () => void;
  onGoToBalance: () => void;
}> = ({
  taskTitle,
  taskHours,
  totalWorkloadHours = 20,
  availableHours,
  deficit,
  isOverloaded = false,
  isNicoleAnalysisPlan = false,
  onTreeHole,
  onColourReflection,
  onGoToAnalysis,
  onGoToBalance,
}) => {
    return (
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderRadius: '20px',
        padding: '16px',
        border: isOverloaded ? '1.5px solid rgba(252, 165, 165, 0.95)' : '1.5px solid rgba(226, 232, 240, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: isOverloaded ? '0 6px 22px rgba(220, 38, 38, 0.08)' : '0 6px 20px rgba(0, 0, 0, 0.05)',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', fontWeight: 800, color: Colors.textDark }}>
            <Sparkles size={16} color={isOverloaded ? "#DC2626" : "#F97316"} />
            <span>AI Analysis & Next Step Plan</span>
          </div>
          <span style={{
            fontSize: '10.5px',
            fontWeight: 800,
            color: isOverloaded ? '#DC2626' : '#C2410C',
            backgroundColor: isOverloaded ? '#FEE2E2' : '#FFF7ED',
            padding: '3px 8px',
            borderRadius: '10px',
            border: isOverloaded ? '1px solid #FCA5A5' : '1px solid #FED7AA'
          }}>
            {isOverloaded ? 'Overloaded' : 'Strained'}
          </span>
        </div>

        {/* Capacity & Workload Impact */}
        <div style={{
          backgroundColor: isOverloaded ? '#FEF2F2' : '#F8FAFC',
          borderRadius: '16px',
          padding: '12px 14px',
          border: isOverloaded ? '1px solid #FEE2E2' : '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: isOverloaded ? '#991B1B' : '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Workload &amp; Capacity Analysis
          </span>
          <p style={{ margin: 0, fontSize: '12.5px', color: isOverloaded ? '#7F1D1D' : '#334155', lineHeight: 1.5 }}>
            {isNicoleAnalysisPlan ? (
              <>Your total active commitments now is <strong>5 workloads (39h total)</strong>. In the next 3 days, you will have <strong>29h of urgent demands</strong> but only <strong>15.5h of available open time</strong>.</>
            ) : taskTitle ? (
              <>The task <strong>"{taskTitle}"</strong> {taskHours ? `(${taskHours}h)` : ''} is now active in your calendar. Your total required workload is approximately <strong>{totalWorkloadHours.toFixed(1)}h</strong> against <strong>{availableHours || 4.5}h</strong> available focus capacity.</>
            ) : (
              <>Your total active workload is approximately <strong>{totalWorkloadHours.toFixed(1)}h</strong> against <strong>{availableHours || 4.5}h</strong> available focus capacity.</>
            )}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap', fontSize: '11.5px' }}>
            <span style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '3px 8px', borderRadius: '8px', fontWeight: 700, border: '1px solid #FECDD3' }}>
              Time Deficit: -{isNicoleAnalysisPlan ? '13.5' : (deficit ?? Math.max(0, totalWorkloadHours - (availableHours || 4.5)).toFixed(1))}h {isNicoleAnalysisPlan ? '(Next 3 Days)' : ''}
            </span>
            <span style={{
              backgroundColor: isOverloaded ? '#FEE2E2' : '#FEF3C7',
              color: isOverloaded ? '#991B1B' : '#92400E',
              padding: '3px 8px',
              borderRadius: '8px',
              fontWeight: 700,
              border: isOverloaded ? '1px solid #FECDD3' : '1px solid #FED7AA'
            }}>
              Cognitive Strain: {isOverloaded ? 'Critical' : 'Elevated'}
            </span>
          </div>
        </div>

        {/* Recovery Recommendation */}
        <div style={{
          backgroundColor: '#FFF7ED',
          borderRadius: '16px',
          padding: '12px 14px',
          border: '1.2px solid #FED7AA',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#C2410C', fontWeight: 800, fontSize: '12.5px' }}>
            <Coffee size={15} color="#EA580C" />
            <span>Recovery Recommendation</span>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#9A3412', lineHeight: 1.45 }}>
            {isOverloaded ? 'Your cognitive load and deadline density are in an overloaded state. We strongly recommend taking 15–20 minutes for recovery!' : 'Cognitive load and deadline density are elevated. We recommend taking 15–20 minutes to recover before commencing deep work.'}
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onTreeHole}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1.2px solid #86EFAC',
                color: '#166534',
                borderRadius: '12px',
                padding: '6px 12px',
                fontSize: '11.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 2px 6px rgba(34, 197, 94, 0.1)'
              }}
            >
              <Feather size={13} /> Tree Hole Vent
            </button>
            <button
              type="button"
              onClick={onColourReflection}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1.2px solid #DDD6FE',
                color: '#6B21A8',
                borderRadius: '12px',
                padding: '6px 12px',
                fontSize: '11.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 2px 6px rgba(124, 58, 237, 0.1)'
              }}
            >
              <Palette size={13} /> Colour Reflection
            </button>
          </div>
        </div>

        {/* Next Action Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B' }}>
            Select Next Action:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={onGoToAnalysis}
              style={{
                background: '#F8FAFC',
                border: '1.5px solid #E2E8F0',
                borderRadius: '14px',
                padding: '11px 12px',
                color: Colors.textDark,
                fontWeight: 800,
                fontSize: '12.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}
              title="Analysis"
            >
              <BarChart2 size={16} color="#475569" strokeWidth={2.2} />
              <span>Analysis</span>
            </button>

            <button
              type="button"
              onClick={onGoToBalance}
              style={{
                background: 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)',
                border: '1.5px solid #FDBA74',
                borderRadius: '14px',
                padding: '11px 12px',
                color: '#9A3412',
                fontWeight: 800,
                fontSize: '12.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 3px 10px rgba(234, 88, 12, 0.18)',
                transition: 'all 0.15s ease'
              }}
              title="Balance"
            >
              <Scale size={15} color="#9A3412" />
              <span>Balance</span>
            </button>
          </div>
        </div>
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
    clarifiedWorkloadIds
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
      background: 'linear-gradient(135deg, rgba(255, 248, 241, 0.98) 0%, rgba(255, 241, 242, 0.8) 50%, rgba(245, 243, 255, 0.92) 100%)',
      borderRadius: '20px',
      border: '1.5px solid rgba(251, 146, 60, 0.7)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      width: '100%',
      boxSizing: 'border-box',
      boxShadow: '0 4px 18px rgba(251, 146, 60, 0.08)'
    }}>
      {/* CARD HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EA580C', fontWeight: 800, fontSize: '13.5px' }}>
          <Sparkles size={16} color="#EA580C" />
          <span>Extracted Info:</span>
        </div>
      </div>

      {/* QUALITATIVE STRESS CONTEXT (Vertically stacked, no horizontal flex) */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        padding: '12px 14px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
          Identified Stress Context
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
          <div>
            <div style={{ fontWeight: 700, color: '#DC2626', fontSize: '11.5px' }}>Primary Concern:</div>
            <div style={{ color: '#334155', lineHeight: 1.45, marginTop: '2px' }}>
              Competing academic deadlines (OS Quiz vs Web Programming)
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#EA580C', fontSize: '11.5px' }}>Secondary Concern:</div>
            <div style={{ color: '#334155', lineHeight: 1.45, marginTop: '2px' }}>
              Taking on additional responsibility in group assignment
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#7C3AED', fontSize: '11.5px' }}>Additional Demand:</div>
            <div style={{ color: '#334155', lineHeight: 1.45, marginTop: '2px' }}>
              Tech Carnival sponsorship responsibility
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#0284C7', fontSize: '11.5px' }}>Current Feeling:</div>
            <div style={{ color: '#334155', lineHeight: 1.45, marginTop: '2px' }}>
              Unsure what to prioritize first
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#475569', fontSize: '11.5px' }}>Recent Context:</div>
            <div style={{ color: '#334155', lineHeight: 1.45, marginTop: '2px' }}>
              Just finished difficult previous week and still feels depleted
            </div>
          </div>
        </div>
      </div>

      {/* 4 EXTRACTED WORKLOAD ITEMS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
            Identified Workload (4)
          </span>
        </div>

        {/* 1. Tech Carnival Sponsorship (New Workload) */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '12px 14px',
          border: isItemClarified('tech-carnival-sponsorship') ? '1.5px solid #86EFAC' : '1.5px solid #FED7AA',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Row 1: Workload name [NEW] - NEW always right aligned at right top side */}
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

          {/* Row 2: Area (coloured as pie chart) · Due date (NO est hour) */}
          <div style={{ fontSize: '11.5px', color: '#64748B' }}>
            <span style={{ fontWeight: 800, color: getAreaColor(sponsorship?.area || 'Social') }}>
              {sponsorship?.area || 'Social'}
            </span>
            <span> · Due 10 Sep, 18:00</span>
          </div>

          {/* Row 3: Bigger edit button below workload area and due (turns to [tick] Clarified after clarification; NO separate tag) */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '6px', borderTop: '1px solid #F8FAFC' }}>
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
              title="Edit Tech Carnival Sponsorship"
            >
              {isItemClarified('tech-carnival-sponsorship') ? (
                <>
                  <Check size={14} strokeWidth={2.5} color="#166534" />
                  <span>Clarified</span>
                </>
              ) : (
                <>
                  <Edit3 size={13} />
                  <span>Edit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. Web Programming Group Assignment (Existing Workload) */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '12px 14px',
          border: isItemClarified('web-programming-group') ? '1.5px solid #86EFAC' : '1.5px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Row 1: Workload name [EXISTING] - EXISTING always right aligned at right top side */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ fontSize: '13.5px', fontWeight: 800, color: Colors.textDark, lineHeight: 1.35 }}>
              {webProg?.title || 'Web Programming Group Assignment'}
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
              flexShrink: 0,
              marginTop: '1px'
            }}>
              EXISTING
            </span>
          </div>

          {/* Row 2: Area (coloured as pie chart) · Due date (NO est hour) */}
          <div style={{ fontSize: '11.5px', color: '#64748B' }}>
            <span style={{ fontWeight: 800, color: getAreaColor(webProg?.area || 'Academic') }}>
              {webProg?.area || 'Academic'}
            </span>
            <span> · Due 11 Sep, 23:59</span>
          </div>

          {/* Row 3: Bigger edit button below workload area and due (turns to [tick] Clarified after clarification; NO separate tag) */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '6px', borderTop: '1px solid #F8FAFC' }}>
            <button
              type="button"
              onClick={() => handleEditWorkload('web-programming-group')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: isItemClarified('web-programming-group') ? '#F0FDF4' : '#F8FAFC',
                border: isItemClarified('web-programming-group') ? '1.2px solid #86EFAC' : '1.2px solid #CBD5E1',
                color: isItemClarified('web-programming-group') ? '#166534' : '#334155',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease'
              }}
              title="Edit Web Programming"
            >
              {isItemClarified('web-programming-group') ? (
                <>
                  <Check size={14} strokeWidth={2.5} color="#166534" />
                  <span>Clarified</span>
                </>
              ) : (
                <>
                  <Edit3 size={13} />
                  <span>Edit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. OS Quiz (Existing Workload) */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '12px 14px',
          border: isItemClarified('os-quiz-1') ? '1.5px solid #86EFAC' : '1.5px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Row 1: Workload name [EXISTING] - EXISTING always right aligned at right top side */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ fontSize: '13.5px', fontWeight: 800, color: Colors.textDark, lineHeight: 1.35 }}>
              {osQuiz?.title || 'Operating System Quiz 1'}
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
              flexShrink: 0,
              marginTop: '1px'
            }}>
              EXISTING
            </span>
          </div>

          {/* Row 2: Area (coloured as pie chart) · Due date (NO est hour) */}
          <div style={{ fontSize: '11.5px', color: '#64748B' }}>
            <span style={{ fontWeight: 800, color: getAreaColor(osQuiz?.area || 'Academic') }}>
              {osQuiz?.area || 'Academic'}
            </span>
            <span> · Due 10 Sep, 08:00</span>
          </div>

          {/* Row 3: Bigger edit button below workload area and due */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '6px', borderTop: '1px solid #F8FAFC' }}>
            <button
              type="button"
              onClick={() => handleEditWorkload('os-quiz-1')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: isItemClarified('os-quiz-1') ? '#F0FDF4' : '#F8FAFC',
                border: isItemClarified('os-quiz-1') ? '1.2px solid #86EFAC' : '1.2px solid #CBD5E1',
                color: isItemClarified('os-quiz-1') ? '#166534' : '#334155',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease'
              }}
              title="Edit Operating System Quiz 1"
            >
              {isItemClarified('os-quiz-1') ? (
                <>
                  <Check size={14} strokeWidth={2.5} color="#166534" />
                  <span>Clarified</span>
                </>
              ) : (
                <>
                  <Edit3 size={13} />
                  <span>Edit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4. FCG Test (Existing Workload) */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '12px 14px',
          border: isItemClarified('fcg-test-1') ? '1.5px solid #86EFAC' : '1.5px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Row 1: Workload name [EXISTING] - EXISTING always right aligned at right top side */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ fontSize: '13.5px', fontWeight: 800, color: Colors.textDark, lineHeight: 1.35 }}>
              {fcgTest?.title || 'FCG Test'}
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
              flexShrink: 0,
              marginTop: '1px'
            }}>
              EXISTING
            </span>
          </div>

          {/* Row 2: Area (coloured as pie chart) · Due date (NO est hour) */}
          <div style={{ fontSize: '11.5px', color: '#64748B' }}>
            <span style={{ fontWeight: 800, color: getAreaColor(fcgTest?.area || 'Academic') }}>
              {fcgTest?.area || 'Academic'}
            </span>
            <span> · Due 14 Sep, 14:00</span>
          </div>

          {/* Row 3: Bigger edit button below workload area and due */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '6px', borderTop: '1px solid #F8FAFC' }}>
            <button
              type="button"
              onClick={() => handleEditWorkload('fcg-test-1')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: isItemClarified('fcg-test-1') ? '#F0FDF4' : '#F8FAFC',
                border: isItemClarified('fcg-test-1') ? '1.2px solid #86EFAC' : '1.2px solid #CBD5E1',
                color: isItemClarified('fcg-test-1') ? '#166534' : '#334155',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease'
              }}
              title="Edit FCG Test"
            >
              {isItemClarified('fcg-test-1') ? (
                <>
                  <Check size={14} strokeWidth={2.5} color="#166534" />
                  <span>Clarified</span>
                </>
              ) : (
                <>
                  <Edit3 size={13} />
                  <span>Edit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ACTION CONTROLS */}
      {!isConfirmed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '2px' }}>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              backgroundColor: '#FFF7ED',
              color: '#C2410C',
              border: '1.2px solid #FED7AA',
              borderRadius: '14px',
              padding: '12px 18px',
              fontWeight: 800,
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.08)',
              transition: 'all 0.15s ease'
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span style={{ color: '#C2410C' }}>Add Workload</span>
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
          fontSize: '12.5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          marginTop: '2px'
        }}>
          <CheckCircle2 size={16} color="#166534" />
          <span>Workloads Added</span>
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
    setIsAddWorkloadOpen,
    setAddWorkloadInitialData,
    markChatWorkloadAdded,
    workloads
  } = useApp();

  const [inputText, setInputText] = useState('');

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
      minHeight: '700px',
      position: 'relative',
      padding: '10px 18px 16px 18px',
      gap: '10px',
    }}>

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 className="serif-title" style={{ fontSize: '24px', fontWeight: 600, color: Colors.textDark, letterSpacing: '-0.4px' }}>
            AI Stress Dump
          </h2>
          <p className="aesthetic-caption" style={{ marginTop: '2px' }}>
            Dump thoughts via text or voice. AI extracts load and guides next steps.
          </p>
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
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        overflowY: 'auto',
        padding: '6px 4px',
        maxHeight: '480px',
      }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: Colors.textMuted }}>
                {isUser ? <span>Nicole</span> : <span>MindFlow AI</span>}
                <span>• {msg.timestamp}</span>
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
                  <div>{msg.text}</div>

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
      </div>

      {/* DEMO HELPER CHIP ROW */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '6px 2px',
      }}>
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
          gap: '10px'
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
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: inputText.includes('\n') ? '20px' : '30px',
            padding: '6px 8px 6px 16px',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            boxShadow: Colors.shadowGlass,
            transition: 'border-radius 0.2s ease',
          }}
        >
          <textarea
            placeholder="Dump thoughts, or tap mic for voice message..."
            value={inputText}
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
              fontSize: '13.5px',
              color: Colors.textDark,
              padding: '8px 0',
              resize: 'none',
              fontFamily: 'inherit',
              lineHeight: '1.45',
              maxHeight: '100px',
              overflowY: 'auto'
            }}
          />

          <button
            type="button"
            onClick={startRecording}
            style={{
              backgroundColor: 'rgba(243, 238, 253, 0.95)',
              color: '#7C3AED',
              border: '1.5px solid rgba(196, 181, 253, 0.8)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.15)',
              transition: 'all 0.15s ease'
            }}
            title="Record Voice Message (Shout triggers falling leaves animation)"
          >
            <Mic size={19} />
          </button>

          <button
            type="submit"
            disabled={!inputText.trim()}
            style={{
              background: inputText.trim()
                ? 'linear-gradient(135deg, #DCFCE7 0%, #FEF9C3 100%)'
                : 'rgba(203, 213, 225, 0.6)',
              color: inputText.trim() ? '#166534' : '#FFFFFF',
              border: inputText.trim() ? '1.2px solid rgba(187, 247, 208, 0.9)' : 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputText.trim() ? 'pointer' : 'default',
              flexShrink: 0,
              boxShadow: inputText.trim() ? '0 2px 8px rgba(187, 247, 208, 0.35)' : 'none',
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
      `}</style>
    </div>
  );
};
