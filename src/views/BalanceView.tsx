import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';
import { WorkloadItem } from '../types/workload';
import { FixedBusyEvent, FocusBlock, ProtectedTime } from '../types/calendar';
import {
  Check, Calendar, Clock, Sparkles, Edit3, X, ArrowRight,
  Heart, Feather, Palette, Coffee, ShieldAlert, CheckCircle2,
  AlertTriangle, RotateCcw, Users, CheckSquare, Square, Share2,
  ChevronDown, ChevronUp
} from 'lucide-react';

interface BalanceItemDecision {
  action: 'Keep' | 'Reduce' | 'Reconsider' | 'Move / Delay';
  subtitle: string;
  rationale: string;
}

export interface ProposedBlockPlan {
  id?: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  label?: string;
}

export interface WorkloadEffortPlan {
  remainingTimeHours: number;
  plannedHours: number;
  unscheduledHours: number;
  blocks: ProposedBlockPlan[];
}

export const calculateDurationHours = (start: string, end: string): number => {
  if (!start || !end) return 1;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  if (isNaN(sh) || isNaN(eh)) return 1;
  const diff = (eh * 60 + (isNaN(em) ? 0 : em)) - (sh * 60 + (isNaN(sm) ? 0 : sm));
  return Math.max(0.5, Math.round((diff / 60) * 10) / 10);
};

interface SnapshotData {
  workloads: Array<{
    id: string;
    remainingTimeHours: number;
    scheduledDate?: string;
    scheduledStartTime?: string;
    scheduledEndTime?: string;
    scheduledBlocks?: WorkloadItem['scheduledBlocks'];
    balanceDecision?: 'Keep' | 'Reduce' | 'Reconsider' | 'Move / Delay';
    balanceRationale?: string;
  }>;
  busyEvents: FixedBusyEvent[];
  protectedTimes: ProtectedTime[];
  focusBlocks: FocusBlock[];
  selectedPlanIds: string[];
}

export const BalanceView: React.FC = () => {
  const {
    workloads,
    updateWorkload,
    setIsTreeHoleOpen,
    setIsColourReflectionOpen,
    setActiveTab,
    todayCheckIn,
    capacityProfile,
    busyEvents,
    setBusyEvents,
    protectedTimes,
    setProtectedTimes,
    focusBlocks,
    setFocusBlocks,
    customSchedules,
    setCustomSchedules,
    chatMessages
  } = useApp();

  const activeWorkloads = workloads.filter(w => w.status === 'Active');

  // Check whether Nicole has completed and confirmed Stress Dump
  const isStressDumpConfirmed = workloads.some(w => w.id === 'tech-carnival-sponsorship') ||
    (chatMessages && chatMessages.some(m => m.nicoleConfirmed));

  // Selected workload plans that the user wants to apply
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>(() =>
    workloads.filter(w => w.status === 'Active').map(w => w.id)
  );

  const allPlanIds = activeWorkloads.map(w => w.id);
  const isAllSelected = allPlanIds.length > 0 && allPlanIds.every(id => selectedPlanIds.includes(id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedPlanIds([]);
    } else {
      setSelectedPlanIds([...allPlanIds]);
    }
  };

  const togglePlanSelected = (id: string) => {
    setSelectedPlanIds(prev =>
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };


  // Track open state for proposed schedule dropdowns by task ID
  const [openScheduleDropdowns, setOpenScheduleDropdowns] = useState<Record<string, boolean>>({});

  const toggleScheduleDropdown = (taskId: string) => {
    setOpenScheduleDropdowns(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Modal state for editing a task's schedule
  const [editingTask, setEditingTask] = useState<null | {
    id: string;
    title: string;
    blockKey?: string;
    date: string;
    startTime: string;
    endTime: string;
    action: string;
  }>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Full Undo snapshot state
  const [previousSnapshot, setPreviousSnapshot] = useState<SnapshotData | null>(null);

  // Canonical decision classification for Nicole's controlled demo
  const getNicoleDecision = (item: WorkloadItem, isPostStressDump: boolean): BalanceItemDecision => {
    if (item.id === 'os-quiz-1') {
      return {
        action: 'Keep',
        subtitle: 'Keep this priority',
        rationale: isPostStressDump
          ? 'Closest academic deadline! Keep the full 5h preparation before deadline.'
          : 'Closest academic deadline! Keep the full 5h preparation before deadline.'
      };
    }

    if (item.id === 'web-programming-group') {
      if (isPostStressDump) {
        return {
          action: 'Reduce',
          subtitle: 'Reduce your personal share',
          rationale: "Stress Dump showed that you're taking over unfinished group work. Keep the core work you need to own and hand 5h back to the group."
        };
      }
      return {
        action: 'Keep',
        subtitle: 'Start this early',
        rationale: 'This is a large and high priority assignment, start some work before OS Quiz'
      };
    }

    if (item.id === 'tech-carnival-sponsorship') {
      return {
        action: 'Reconsider',
        subtitle: 'Reconsider your responsibility',
        rationale: 'This responsibility was not in your original workload list and falls inside an already crowded deadline period. Do you need to handle all of it yourself?'
      };
    }

    if (item.id === 'fcg-test-1') {
      return {
        action: 'Move / Delay',
        subtitle: 'Delay intensive preparation',
        rationale: isPostStressDump
          ? 'Lower urgency than the OS Quiz, Web Programming and Sponsorship deadlines. Focus on those first, then shift FCG preparation later.'
          : 'Lower urgency than the OS Quiz, Web Programming and Sponsorship deadlines. Focus on those first, then shift FCG preparation later.'
      };
    }

    if (item.id === 'philosophy-reflection') {
      return {
        action: 'Move / Delay',
        subtitle: 'Move this later',
        rationale: isPostStressDump
          ? 'Latest deadline and lower urgency.'
          : 'This has the latest deadline, Sep 18, and lower urgency. Keep it outside the immediate high-pressure period.'
      };
    }

    // Default fallback if any unexpected workload item exists
    return {
      action: 'Keep',
      subtitle: 'Maintain priority',
      rationale: 'Monitor deadline and preserve target preparation.'
    };
  };

  /**
   * Deterministic effort and FocusBlock calculation for Nicole's controlled demo:
   * - remainingTimeHours = actual work remaining (never reduced by scheduling)
   * - plannedHours = total hours across proposed FocusBlocks
   * - unscheduledHours = remainingTimeHours - plannedHours
   * - OS Quiz: fully protects 5.0h before Sep 10 08:00 deadline (08:00–10:30 & 21:00–23:30)
   * - Web Programming: 2.0h early start (Before) or 3.0h core implementation (After)
   * - Sponsorship: 2.0h materials prep (Sep 9 17:00–19:00) before Sep 10 18:00 deadline
   * - FCG Test: 3.0h intensive prep shifted to Sep 12 14:30–17:30
   * - Philosophy: 2.0h scheduled Sep 15 14:00–16:00
   */
  const getEffortPlan = (item: WorkloadItem, isPostStressDump: boolean): WorkloadEffortPlan => {
    const override1 = customSchedules[`${item.id}-1`] || customSchedules[item.id] ||
      (item.scheduledBlocks?.[0] ? { date: item.scheduledBlocks[0].date, startTime: item.scheduledBlocks[0].startTime, endTime: item.scheduledBlocks[0].endTime } :
        (item.scheduledDate && item.scheduledStartTime ? { date: item.scheduledDate, startTime: item.scheduledStartTime, endTime: item.scheduledEndTime || '12:00' } : undefined));

    const override2 = customSchedules[`${item.id}-2`] ||
      (item.scheduledBlocks?.[1] ? { date: item.scheduledBlocks[1].date, startTime: item.scheduledBlocks[1].startTime, endTime: item.scheduledBlocks[1].endTime } : undefined);

    if (item.id === 'os-quiz-1') {
      const remaining = 5;
      const b1 = override1 || { date: '2026-09-09', startTime: '08:00', endTime: '10:30' };
      const b2 = override2 || { date: '2026-09-09', startTime: '21:00', endTime: '23:30' };
      const dur1 = calculateDurationHours(b1.startTime, b1.endTime);
      const dur2 = calculateDurationHours(b2.startTime, b2.endTime);
      const blocks: ProposedBlockPlan[] = [
        {
          id: `${item.id}-1`,
          date: b1.date,
          startTime: b1.startTime,
          endTime: b1.endTime,
          durationHours: dur1,
          label: 'Part 1: Core concepts & process scheduling'
        },
        {
          id: `${item.id}-2`,
          date: b2.date,
          startTime: b2.startTime,
          endTime: b2.endTime,
          durationHours: dur2,
          label: 'Part 2: Memory management & practice quiz'
        }
      ];
      const planned = dur1 + dur2;
      return {
        remainingTimeHours: remaining,
        plannedHours: planned,
        unscheduledHours: Math.max(0, remaining - planned),
        blocks
      };
    }

    if (item.id === 'web-programming-group') {
      if (!isPostStressDump) {
        const remaining = 12;
        const b = override1 || { date: '2026-09-09', startTime: '17:00', endTime: '19:00' };
        const dur = calculateDurationHours(b.startTime, b.endTime);
        const blocks: ProposedBlockPlan[] = [{
          id: `${item.id}-1`,
          date: b.date,
          startTime: b.startTime,
          endTime: b.endTime,
          durationHours: dur,
          label: 'Early start: Frontend component setup'
        }];
        const planned = dur;
        return {
          remainingTimeHours: remaining,
          plannedHours: planned,
          unscheduledHours: Math.max(0, remaining - planned),
          blocks
        };
      } else {
        const remaining = selectedPlanIds.includes(item.id) ? 13 : 18;
        const b = override1 || { date: '2026-09-10', startTime: '14:00', endTime: '17:00' };
        const dur = calculateDurationHours(b.startTime, b.endTime);
        const blocks: ProposedBlockPlan[] = [{
          id: `${item.id}-1`,
          date: b.date,
          startTime: b.startTime,
          endTime: b.endTime,
          durationHours: dur,
          label: 'Near-term plan: Core implementation & review'
        }];
        const planned = dur;
        return {
          remainingTimeHours: remaining,
          plannedHours: planned,
          unscheduledHours: Math.max(0, remaining - planned),
          blocks
        };
      }
    }

    if (item.id === 'tech-carnival-sponsorship') {
      const remaining = 6;
      const b = override1 || { date: '2026-09-09', startTime: '17:00', endTime: '19:00' };
      const dur = calculateDurationHours(b.startTime, b.endTime);
      const blocks: ProposedBlockPlan[] = [{
        id: `${item.id}-1`,
        date: b.date,
        startTime: b.startTime,
        endTime: b.endTime,
        durationHours: dur,
        label: 'Retained ownership: Prepare sponsorship materials'
      }];
      const planned = dur;
      return {
        remainingTimeHours: remaining,
        plannedHours: planned,
        unscheduledHours: Math.max(0, remaining - planned),
        blocks
      };
    }

    if (item.id === 'fcg-test-1') {
      const remaining = 8;
      const b = override1 || { date: '2026-09-12', startTime: '14:30', endTime: '17:30' };
      const dur = calculateDurationHours(b.startTime, b.endTime);
      const blocks: ProposedBlockPlan[] = [{
        id: `${item.id}-1`,
        date: b.date,
        startTime: b.startTime,
        endTime: b.endTime,
        durationHours: dur,
        label: 'Post-cluster prep: Transformations & 3D pipeline'
      }];
      const planned = dur;
      return {
        remainingTimeHours: remaining,
        plannedHours: planned,
        unscheduledHours: Math.max(0, remaining - planned),
        blocks
      };
    }

    if (item.id === 'philosophy-reflection') {
      const remaining = 2;
      const b = override1 || { date: '2026-09-15', startTime: '14:00', endTime: '16:00' };
      const dur = calculateDurationHours(b.startTime, b.endTime);
      const blocks: ProposedBlockPlan[] = [{
        id: `${item.id}-1`,
        date: b.date,
        startTime: b.startTime,
        endTime: b.endTime,
        durationHours: dur,
        label: 'Post-FCG reflection drafting & submission'
      }];
      const planned = dur;
      return {
        remainingTimeHours: remaining,
        plannedHours: planned,
        unscheduledHours: Math.max(0, remaining - planned),
        blocks
      };
    }

    // Default fallback
    return {
      remainingTimeHours: item.remainingTimeHours,
      plannedHours: 0,
      unscheduledHours: item.remainingTimeHours,
      blocks: []
    };
  };

  // Group workloads into the four canonical decision buckets
  const groupedTasks: Record<'Keep' | 'Reduce' | 'Reconsider' | 'Move / Delay', Array<{ item: WorkloadItem; decision: BalanceItemDecision }>> = {
    'Keep': [],
    'Reduce': [],
    'Reconsider': [],
    'Move / Delay': []
  };

  activeWorkloads.forEach(item => {
    const decision = getNicoleDecision(item, isStressDumpConfirmed);
    groupedTasks[decision.action].push({ item, decision });
  });

  const handleSaveScheduleEdit = () => {
    if (!editingTask) return;
    const key = editingTask.blockKey || editingTask.id;
    setCustomSchedules(prev => ({
      ...prev,
      [key]: {
        date: editingTask.date,
        startTime: editingTask.startTime,
        endTime: editingTask.endTime
      }
    }));
    const target = workloads.find(w => w.id === editingTask.id);
    if (target) {
      const dur = calculateDurationHours(editingTask.startTime, editingTask.endTime);
      const isPrimary = !editingTask.blockKey || editingTask.blockKey === `${editingTask.id}-1` || editingTask.blockKey === editingTask.id;
      const updatedBlocks = (target.scheduledBlocks || []).map(b => {
        if (b.id === key) {
          return { ...b, date: editingTask.date, startTime: editingTask.startTime, endTime: editingTask.endTime, durationHours: dur };
        }
        return b;
      });

      updateWorkload({
        ...target,
        ...(isPrimary ? {
          scheduledDate: editingTask.date,
          scheduledStartTime: editingTask.startTime,
          scheduledEndTime: editingTask.endTime
        } : {}),
        scheduledBlocks: updatedBlocks.length > 0 ? updatedBlocks : target.scheduledBlocks
      });
    }
    // Keep the schedule dropdown open for this task so the user sees the updated time
    setOpenScheduleDropdowns(prev => ({
      ...prev,
      [editingTask.id]: true
    }));
    setEditingTask(null);
    setToastMessage(`✓ Updated schedule for ${editingTask.title}`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApplyPlan = () => {
    // 1. Snapshot current state before applying (for full Undo)
    const snapshot: SnapshotData = {
      workloads: activeWorkloads.map(w => ({
        id: w.id,
        remainingTimeHours: w.remainingTimeHours,
        scheduledDate: w.scheduledDate,
        scheduledStartTime: w.scheduledStartTime,
        scheduledEndTime: w.scheduledEndTime,
        scheduledBlocks: w.scheduledBlocks,
        balanceDecision: w.balanceDecision,
        balanceRationale: w.balanceRationale
      })),
      busyEvents: [...busyEvents],
      protectedTimes: [...protectedTimes],
      focusBlocks: [...focusBlocks],
      selectedPlanIds: [...selectedPlanIds]
    };
    setPreviousSnapshot(snapshot);

    // 2. Generate canonical FocusBlocks only for SELECTED planned work
    const newFocusBlocks: FocusBlock[] = [];

    activeWorkloads.forEach(item => {
      // If workload plan is NOT selected, do not apply it
      if (!selectedPlanIds.includes(item.id)) {
        return;
      }

      const plan = getEffortPlan(item, isStressDumpConfirmed);
      const decision = getNicoleDecision(item, isStressDumpConfirmed);

      // Create FocusBlock instances for each planned block
      plan.blocks.forEach((b, idx) => {
        newFocusBlocks.push({
          id: `fb-${item.id}-${idx + 1}`,
          workloadId: item.id,
          startDateTime: `${b.date}T${b.startTime}:00+08:00`,
          endDateTime: `${b.date}T${b.endTime}:00+08:00`,
          status: 'planned',
          locked: false
        });
      });

      const primaryBlock = plan.blocks[0];
      const scheduledBlocks = plan.blocks.map(b => ({
        id: b.id,
        date: b.date,
        startTime: b.startTime,
        endTime: b.endTime,
        durationHours: b.durationHours,
        label: b.label
      }));

      // Update WorkloadItem fields
      // SCHEDULING NEVER REDUCES remainingTimeHours!
      // Only accepted scope reduction alters remainingTimeHours.
      if (decision.action === 'Reduce' && item.id === 'web-programming-group') {
        updateWorkload({
          ...item,
          remainingTimeHours: 13,
          scheduledDate: primaryBlock?.date,
          scheduledStartTime: primaryBlock?.startTime,
          scheduledEndTime: primaryBlock?.endTime,
          scheduledBlocks,
          balanceDecision: 'Reduce',
          balanceRationale: 'Delegated 5h of responsive styling, testing, and documentation to group members. Early core implementation planned.'
        });
        return;
      }

      if (decision.action === 'Reconsider' && item.id === 'tech-carnival-sponsorship') {
        updateWorkload({
          ...item,
          // remainingTimeHours strictly stays 6h (no arbitrary numerical reduction)
          scheduledDate: primaryBlock?.date,
          scheduledStartTime: primaryBlock?.startTime,
          scheduledEndTime: primaryBlock?.endTime,
          scheduledBlocks,
          balanceDecision: 'Reconsider',
          balanceRationale: 'Retained sponsorship materials preparation (2h planned Sep 9); proposed sharing follow-up responsibility.'
        });
        return;
      }

      // For Keep and Move / Delay workloads:
      updateWorkload({
        ...item,
        // remainingTimeHours stays unchanged
        scheduledDate: primaryBlock?.date,
        scheduledStartTime: primaryBlock?.startTime,
        scheduledEndTime: primaryBlock?.endTime,
        scheduledBlocks,
        balanceDecision: decision.action,
        balanceRationale: decision.rationale
      });
    });

    // Write generated FocusBlocks to AppContext
    setFocusBlocks(newFocusBlocks);

    setToastMessage(`✓ Applied balance plan! Tap "Undo" if you wish to revert.`);

    setTimeout(() => {
      const topEl = document.getElementById('balance-page-top');
      if (topEl) {
        topEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);

    setTimeout(() => setToastMessage(null), 8000);
  };

  const handleUndoApply = () => {
    if (!previousSnapshot) return;

    previousSnapshot.workloads.forEach(snap => {
      const target = workloads.find(w => w.id === snap.id);
      if (target) {
        updateWorkload({
          ...target,
          remainingTimeHours: snap.remainingTimeHours,
          scheduledDate: snap.scheduledDate,
          scheduledStartTime: snap.scheduledStartTime,
          scheduledEndTime: snap.scheduledEndTime,
          scheduledBlocks: snap.scheduledBlocks,
          balanceDecision: snap.balanceDecision,
          balanceRationale: snap.balanceRationale
        });
      }
    });

    setBusyEvents(previousSnapshot.busyEvents);
    setProtectedTimes(previousSnapshot.protectedTimes);
    setFocusBlocks(previousSnapshot.focusBlocks);
    if (previousSnapshot.selectedPlanIds) {
      setSelectedPlanIds([...previousSnapshot.selectedPlanIds]);
    }

    setPreviousSnapshot(null);
    setToastMessage('✓ Balance plan reverted to previous state.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div id="balance-page-top" style={{
      padding: '14px 18px 32px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
      fontFamily: "'Outfit', -apple-system, sans-serif"
    }}>

      {/* HEADER WITH TITLE, SUBTITLE & REFINED SELECT ALL PILL */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <h1 className="serif-title" style={{
            fontSize: '22px',
            fontWeight: 600,
            color: Colors.textDark,
            margin: 0,
            letterSpacing: '-0.3px'
          }}>
            Workload Balance Plan
          </h1>
          <span className="aesthetic-caption" style={{
            fontSize: '11.5px',
            color: '#94A3B8',
            fontWeight: 450
          }}>
            Protect priority focus, delegate & adjust schedule
          </span>
        </div>

        <button
          type="button"
          onClick={handleToggleSelectAll}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '999px',
            border: isAllSelected ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(203, 213, 225, 0.8)',
            backgroundColor: isAllSelected ? '#ECFDF5' : '#FFFFFF',
            color: isAllSelected ? '#059669' : '#64748B',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease',
            flexShrink: 0
          }}
        >
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            border: isAllSelected ? '1.5px solid #10B981' : '1.5px solid #CBD5E1',
            backgroundColor: isAllSelected ? '#10B981' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease'
          }}>
            {isAllSelected && <Check size={10} color="#FFFFFF" strokeWidth={3} />}
          </div>
          <span>{isAllSelected ? 'All Selected' : 'Select All'}</span>
        </button>
      </div>

      {/* TOAST MESSAGE WITH UNDO SHORTCUT */}
      {toastMessage && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(220, 252, 231, 0.95) 0%, rgba(187, 247, 208, 0.85) 100%)',
          border: '1px solid #86EFAC',
          borderRadius: '16px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          boxShadow: '0 4px 16px rgba(34, 197, 94, 0.12)'
        }}>
          <span style={{ fontSize: '12px', fontWeight: 550, color: '#166534' }}>
            {toastMessage}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {previousSnapshot && (
              <button
                type="button"
                onClick={handleUndoApply}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#991B1B',
                  border: '1px solid #FECACA',
                  borderRadius: '999px',
                  padding: '3px 9px',
                  fontSize: '11px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}
              >
                <RotateCcw size={10} />
                Undo
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('workloads')}
              style={{
                backgroundColor: '#166534',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '999px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
              }}
            >
              View Calendar
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. RECOVERY SECTION (MATCHING HOMEVIEW OVERLOADED CARD PATTERN)           */}
      {/* ========================================================================= */}
      {capacityProfile.dailyStatus === 'Overloaded' && (
        <div style={{
          background: 'linear-gradient(180deg, #ffced2ff 0%, #ffededff 60%, #F8FAFC 100%)',
          borderRadius: '26px',
          padding: '16px 18px',
          border: '1.5px solid #FECDD3',
          boxShadow: '0 8px 30px rgba(220, 38, 38, 0.05), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '10px',
                backgroundColor: '#FEE2E2',
                border: '1px solid #FECDD3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <AlertTriangle size={16} color="#DC2626" strokeWidth={2.2} />
              </div>
              <span style={{
                fontSize: '12.5px',
                fontWeight: 650,
                color: '#B91C1C',
                textTransform: 'uppercase',
                letterSpacing: '0.4px'
              }}>
                Recovery Action Needed
              </span>
            </div>

            <span style={{
              padding: '2px 10px',
              borderRadius: '999px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #FECDD3',
              color: '#B91C1C',
              fontSize: '11px',
              fontWeight: 600,
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              Priority Rest
            </span>
          </div>

          <p style={{
            fontSize: '12.5px',
            color: '#475569',
            lineHeight: '1.5',
            margin: 0,
            fontWeight: 400
          }}>
            Your cognitive demand is outstripping energy reserves today. Taking an intentional 20-minute recovery break before tackling analytical work will restore focus.
          </p>

          {/* Quicklinks to Recovery Features (HomeView Cover Page style) */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsTreeHoleOpen(true)}
              style={{
                flex: 1,
                height: '38px',
                borderRadius: '14px',
                border: '1px solid rgba(187, 247, 208, 0.9)',
                backgroundColor: '#FFFFFF',
                color: '#166534',
                fontWeight: 550,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                transition: 'all 0.15s ease'
              }}
            >
              <Feather size={14} color="#16A34A" />
              <span>Tree Hole Release</span>
            </button>

            <button
              type="button"
              onClick={() => setIsColourReflectionOpen(true)}
              style={{
                flex: 1,
                height: '38px',
                borderRadius: '14px',
                border: '1px solid rgba(221, 214, 254, 0.9)',
                backgroundColor: '#FFFFFF',
                color: '#6B21A8',
                fontWeight: 550,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                transition: 'all 0.15s ease'
              }}
            >
              <Palette size={14} color="#7C3AED" />
              <span>Colour Reflection</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FOUR DECISION SECTIONS (Keep, Reduce, Reconsider, Move/Delay)           */}
      {/* ========================================================================= */}

      {/* A) KEEP SECTION (Green Branding) */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(214, 247, 232, 0.92) 0%, rgba(240, 253, 244, 0.6) 60%, #F8FAFC 100%)',
        borderRadius: '26px',
        padding: '16px 18px',
        border: '1.5px solid rgba(134, 239, 172, 0.9)',
        boxShadow: '0 8px 30px rgba(16, 185, 129, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)'
            }} />
            <h3 style={{
              fontSize: '12.5px',
              fontWeight: 650,
              color: '#15803D',
              margin: 0,
              letterSpacing: '0.4px',
              textTransform: 'uppercase'
            }}>
              KEEP ({groupedTasks['Keep'].length})
            </h3>
          </div>
          <span style={{
            fontSize: '11px',
            color: '#15803D',
            fontWeight: 500,
            backgroundColor: '#FFFFFF',
            padding: '2px 10px',
            borderRadius: '999px',
            border: '1px solid rgba(187, 247, 208, 0.8)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            Protect Priority Focus
          </span>
        </div>

        {groupedTasks['Keep'].length > 0 ? (
          groupedTasks['Keep'].map(({ item, decision }) => {
            const plan = getEffortPlan(item, isStressDumpConfirmed);
            const isSelected = selectedPlanIds.includes(item.id);
            const isOS = item.id === 'os-quiz-1';

            return (
              <div key={item.id} style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                padding: '14px 16px',
                boxShadow: isSelected ? '0 4px 16px rgba(16, 185, 129, 0.07), 0 1px 3px rgba(0, 0, 0, 0.02)' : '0 1px 3px rgba(0,0,0,0.02)',
                border: isSelected ? '1.5px solid rgba(187, 247, 208, 0.95)' : '1px dashed #CBD5E1',
                opacity: isSelected ? 1 : 0.65,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <h4 style={{
                      fontSize: '14.5px',
                      fontWeight: 600,
                      color: '#0F172A',
                      margin: 0,
                      letterSpacing: '-0.2px'
                    }}>
                      {item.title}
                    </h4>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#166534',
                      letterSpacing: '-0.1px'
                    }}>
                      {decision.subtitle}
                    </span>
                  </div>

                  {/* Circular Select Box */}
                  <button
                    type="button"
                    onClick={() => togglePlanSelected(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '2px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                    title={isSelected ? 'Selected to apply in balance plan' : 'Click to select and apply'}
                  >
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      border: isSelected ? '2px solid #10B981' : '1.8px solid #CBD5E1',
                      backgroundColor: isSelected ? '#10B981' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 2px 8px rgba(16, 185, 129, 0.28)' : 'none'
                    }}>
                      {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                    </div>
                  </button>
                </div>

                <p style={{
                  fontSize: '12.5px',
                  color: '#475569',
                  margin: 0,
                  lineHeight: '1.45',
                  fontWeight: 400
                }}>
                  {decision.rationale}
                </p>

                {/* Solution Summary */}
                <div style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  border: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={12} color="#64748B" />
                    <span style={{ fontSize: '11.5px', fontWeight: 500, color: '#475569' }}>
                      {isOS ? 'Deadline: Sep 10 • 8:00 AM' : 'Deadline: Sep 11 • 23:59'}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    color: '#15803D',
                    fontWeight: 500,
                    backgroundColor: 'rgba(220, 252, 231, 0.7)',
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}>
                    {isOS ? '5.0h Target' : 'High Priority'}
                  </span>
                </div>

                {/* Proposed Schedule Dropdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
                  <button
                    type="button"
                    onClick={() => toggleScheduleDropdown(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: openScheduleDropdowns[item.id] ? '#F8FAFC' : '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <Calendar size={13} color="#166534" />
                      <span style={{ fontSize: '12px', fontWeight: 550, color: '#334155' }}>
                        Proposed schedule
                      </span>
                      <span style={{
                        fontSize: '10.5px',
                        fontWeight: 500,
                        backgroundColor: 'rgba(220, 252, 231, 0.7)',
                        color: '#166534',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        border: '1px solid rgba(187, 247, 208, 0.8)'
                      }}>
                        {plan.blocks.length} {plan.blocks.length === 1 ? 'block' : 'blocks'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#94A3B8' }}>
                      {openScheduleDropdowns[item.id] ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>
                  </button>

                  {openScheduleDropdowns[item.id] && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      padding: '4px 0 2px 0'
                    }}>
                      {plan.blocks.map((b, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          backgroundColor: '#F8FAFC',
                          borderRadius: '12px',
                          border: '1px solid #F1F5F9',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={12} color="#64748B" />
                            <span style={{ fontSize: '12px', color: '#1E293B', fontWeight: 500 }}>
                              {b.date} • {b.startTime} - {b.endTime}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 450 }}>
                              ({b.durationHours}h)
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setEditingTask({
                              id: item.id,
                              blockKey: b.id,
                              title: `${item.title} (${b.durationHours}h block)`,
                              date: b.date,
                              startTime: b.startTime,
                              endTime: b.endTime,
                              action: 'Keep'
                            })}
                            style={{
                              border: '1px solid #CBD5E1',
                              backgroundColor: '#FFFFFF',
                              color: '#475569',
                              padding: '4px 10px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Edit3 size={11} color="#64748B" />
                            <span>Edit</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <span style={{ fontSize: '12px', color: Colors.textMuted }}>No tasks currently in Keep.</span>
        )}
      </div>

      {/* B) REDUCE SECTION (Blue Branding) */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(219, 234, 254, 0.92) 0%, rgba(239, 246, 255, 0.6) 60%, #F8FAFC 100%)',
        borderRadius: '26px',
        padding: '16px 18px',
        border: '1.5px solid rgba(147, 197, 253, 0.9)',
        boxShadow: '0 8px 30px rgba(59, 130, 246, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#3B82F6',
              boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)'
            }} />
            <h3 style={{
              fontSize: '12.5px',
              fontWeight: 650,
              color: '#1D4ED8',
              margin: 0,
              letterSpacing: '0.4px',
              textTransform: 'uppercase'
            }}>
              REDUCE ({groupedTasks['Reduce'].length})
            </h3>
          </div>
          <span style={{
            fontSize: '11px',
            color: '#1D4ED8',
            fontWeight: 500,
            backgroundColor: '#FFFFFF',
            padding: '2px 10px',
            borderRadius: '999px',
            border: '1px solid rgba(191, 219, 254, 0.8)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            Reduce Scope / Delegation
          </span>
        </div>

        {groupedTasks['Reduce'].length > 0 ? (
          groupedTasks['Reduce'].map(({ item, decision }) => {
            const plan = getEffortPlan(item, isStressDumpConfirmed);
            const isSelected = selectedPlanIds.includes(item.id);

            return (
              <div key={item.id} style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                padding: '14px 16px',
                boxShadow: isSelected ? '0 4px 16px rgba(37, 99, 235, 0.07), 0 1px 3px rgba(0, 0, 0, 0.02)' : '0 1px 3px rgba(0,0,0,0.02)',
                border: isSelected ? '1.5px solid rgba(191, 219, 254, 0.95)' : '1px dashed #CBD5E1',
                opacity: isSelected ? 1 : 0.65,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <h4 style={{
                      fontSize: '14.5px',
                      fontWeight: 600,
                      color: '#0F172A',
                      margin: 0,
                      letterSpacing: '-0.2px'
                    }}>
                      {item.title}
                    </h4>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#1D4ED8',
                      letterSpacing: '-0.1px'
                    }}>
                      {decision.subtitle}
                    </span>
                  </div>

                  {/* Circular Select Box */}
                  <button
                    type="button"
                    onClick={() => togglePlanSelected(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '2px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                    title={isSelected ? 'Selected to apply in balance plan' : 'Click to select and apply'}
                  >
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      border: isSelected ? '2px solid #10B981' : '1.8px solid #CBD5E1',
                      backgroundColor: isSelected ? '#10B981' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 2px 8px rgba(16, 185, 129, 0.28)' : 'none'
                    }}>
                      {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                    </div>
                  </button>
                </div>

                <p style={{
                  fontSize: '12.5px',
                  color: '#475569',
                  margin: 0,
                  lineHeight: '1.45',
                  fontWeight: 400
                }}>
                  {decision.rationale}
                </p>

                {/* Suggested Delegation Breakdown */}
                <div style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  border: '1px solid #F1F5F9',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={13} color="#2563EB" />
                    <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#1E40AF' }}>
                      Work to hand back
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11.5px', color: '#475569' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 400 }}>• Responsive styling</span>
                      <span style={{ fontWeight: 550, color: '#2563EB' }}>~2h</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 400 }}>• Testing & bug fixes</span>
                      <span style={{ fontWeight: 550, color: '#2563EB' }}>~2h</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 400 }}>• Shared documentation / final checking</span>
                      <span style={{ fontWeight: 550, color: '#2563EB' }}>~1h</span>
                    </div>
                  </div>
                </div>

                {/* Proposed Schedule Dropdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
                  <button
                    type="button"
                    onClick={() => toggleScheduleDropdown(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: openScheduleDropdowns[item.id] ? '#F8FAFC' : '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <Calendar size={13} color="#2563EB" />
                      <span style={{ fontSize: '12px', fontWeight: 550, color: '#334155' }}>
                        Proposed schedule
                      </span>
                      <span style={{
                        fontSize: '10.5px',
                        fontWeight: 500,
                        backgroundColor: 'rgba(219, 234, 254, 0.7)',
                        color: '#1D4ED8',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        border: '1px solid rgba(191, 219, 254, 0.8)'
                      }}>
                        {plan.blocks.length} {plan.blocks.length === 1 ? 'block' : 'blocks'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#94A3B8' }}>
                      {openScheduleDropdowns[item.id] ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>
                  </button>

                  {openScheduleDropdowns[item.id] && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      padding: '4px 0 2px 0'
                    }}>
                      {plan.blocks.map((b, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          backgroundColor: '#F8FAFC',
                          borderRadius: '12px',
                          border: '1px solid #F1F5F9',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={12} color="#64748B" />
                            <span style={{ fontSize: '12px', color: '#1E293B', fontWeight: 500 }}>
                              {b.date} • {b.startTime} - {b.endTime}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 450 }}>
                              ({b.durationHours}h)
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setEditingTask({
                              id: item.id,
                              blockKey: b.id,
                              title: `${item.title} (${b.durationHours}h block)`,
                              date: b.date,
                              startTime: b.startTime,
                              endTime: b.endTime,
                              action: 'Reduce'
                            })}
                            style={{
                              border: '1px solid #CBD5E1',
                              backgroundColor: '#FFFFFF',
                              color: '#475569',
                              padding: '4px 10px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Edit3 size={11} color="#64748B" />
                            <span>Edit</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '12px 14px',
            border: '1px dashed #BFDBFE',
            color: '#64748B',
            fontSize: '12px',
            lineHeight: '1.45',
            fontWeight: 400
          }}>
            No workload has a clearly reducible scope based on what Restore currently knows.
          </div>
        )}
      </div>

      {/* C) RECONSIDER SECTION (Purple Branding) */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(237, 228, 255, 0.92) 0%, rgba(245, 238, 255, 0.6) 60%, #F8FAFC 100%)',
        borderRadius: '26px',
        padding: '16px 18px',
        border: '1.5px solid rgba(196, 181, 253, 0.9)',
        boxShadow: '0 8px 30px rgba(139, 92, 246, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#8B5CF6',
              boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.2)'
            }} />
            <h3 style={{
              fontSize: '12.5px',
              fontWeight: 650,
              color: '#6D28D9',
              margin: 0,
              letterSpacing: '0.4px',
              textTransform: 'uppercase'
            }}>
              RECONSIDER ({groupedTasks['Reconsider'].length})
            </h3>
          </div>
          <span style={{
            fontSize: '11px',
            color: '#6D28D9',
            fontWeight: 500,
            backgroundColor: '#FFFFFF',
            padding: '2px 10px',
            borderRadius: '999px',
            border: '1px solid rgba(221, 214, 254, 0.8)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            Ownership & Delegation
          </span>
        </div>

        {groupedTasks['Reconsider'].length > 0 ? (
          groupedTasks['Reconsider'].map(({ item, decision }) => {
            const plan = getEffortPlan(item, isStressDumpConfirmed);
            const isSelected = selectedPlanIds.includes(item.id);

            return (
              <div key={item.id} style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                padding: '14px 16px',
                boxShadow: isSelected ? '0 4px 16px rgba(124, 58, 237, 0.07), 0 1px 3px rgba(0, 0, 0, 0.02)' : '0 1px 3px rgba(0,0,0,0.02)',
                border: isSelected ? '1.5px solid rgba(221, 214, 254, 0.95)' : '1px dashed #CBD5E1',
                opacity: isSelected ? 1 : 0.65,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <h4 style={{
                      fontSize: '14.5px',
                      fontWeight: 600,
                      color: '#0F172A',
                      margin: 0,
                      letterSpacing: '-0.2px'
                    }}>
                      {item.title}
                    </h4>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#6D28D9',
                      letterSpacing: '-0.1px'
                    }}>
                      {decision.subtitle}
                    </span>
                  </div>

                  {/* Circular Select Box */}
                  <button
                    type="button"
                    onClick={() => togglePlanSelected(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '2px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                    title={isSelected ? 'Selected to apply in balance plan' : 'Click to select and apply'}
                  >
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      border: isSelected ? '2px solid #10B981' : '1.8px solid #CBD5E1',
                      backgroundColor: isSelected ? '#10B981' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 2px 8px rgba(16, 185, 129, 0.28)' : 'none'
                    }}>
                      {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                    </div>
                  </button>
                </div>

                <p style={{
                  fontSize: '12.5px',
                  color: '#475569',
                  margin: 0,
                  lineHeight: '1.45',
                  fontWeight: 400
                }}>
                  {decision.rationale}
                </p>

                {/* Subtask Ownership Analysis */}
                <div style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  border: '1px solid #F1F5F9',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px'
                }}>
                  <div style={{ fontSize: '11.5px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                      <span><span style={{ fontWeight: 600, color: '#15803D' }}>Keep:</span> Prepare sponsorship materials (2h planned)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#8B5CF6' }} />
                      <span><span style={{ fontWeight: 600, color: '#6D28D9' }}>Share / hand off:</span> Part of sponsorship follow-up (proposed to share)</span>
                    </div>
                  </div>
                </div>

                {/* Proposed Schedule Dropdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '2px' }}>
                  <button
                    type="button"
                    onClick={() => toggleScheduleDropdown(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: openScheduleDropdowns[item.id] ? '#F8FAFC' : '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <Calendar size={13} color="#7C3AED" />
                      <span style={{ fontSize: '12px', fontWeight: 550, color: '#334155' }}>
                        Proposed schedule
                      </span>
                      <span style={{
                        fontSize: '10.5px',
                        fontWeight: 500,
                        backgroundColor: 'rgba(237, 233, 254, 0.7)',
                        color: '#6D28D9',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        border: '1px solid rgba(221, 214, 254, 0.8)'
                      }}>
                        {plan.blocks.length} {plan.blocks.length === 1 ? 'block' : 'blocks'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#94A3B8' }}>
                      {openScheduleDropdowns[item.id] ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>
                  </button>

                  {openScheduleDropdowns[item.id] && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      padding: '4px 0 2px 0'
                    }}>
                      {plan.blocks.map((b, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          backgroundColor: '#F8FAFC',
                          borderRadius: '12px',
                          border: '1px solid #F1F5F9',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={12} color="#64748B" />
                            <span style={{ fontSize: '12px', color: '#1E293B', fontWeight: 500 }}>
                              {b.date} • {b.startTime} - {b.endTime}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 450 }}>
                              ({b.durationHours}h)
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setEditingTask({
                              id: item.id,
                              blockKey: b.id,
                              title: `${item.title} (${b.durationHours}h block)`,
                              date: b.date,
                              startTime: b.startTime,
                              endTime: b.endTime,
                              action: 'Reconsider'
                            })}
                            style={{
                              border: '1px solid #CBD5E1',
                              backgroundColor: '#FFFFFF',
                              color: '#475569',
                              padding: '4px 10px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Edit3 size={11} color="#64748B" />
                            <span>Edit</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '12px 14px',
            border: '1px dashed #DDD6FE',
            color: '#64748B',
            fontSize: '12px',
            lineHeight: '1.45',
            fontWeight: 400
          }}>
            No responsibility currently needs an ownership decision based on the information recorded so far.
          </div>
        )}
      </div>

      {/* D) MOVE / DELAY SECTION (Amber Branding) */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(254, 235, 180, 0.92) 0%, rgba(254, 243, 199, 0.6) 60%, #F8FAFC 100%)',
        borderRadius: '26px',
        padding: '16px 18px',
        border: '1.5px solid rgba(252, 211, 77, 0.9)',
        boxShadow: '0 8px 30px rgba(245, 158, 11, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#F59E0B',
              boxShadow: '0 0 0 2px rgba(245, 158, 11, 0.2)'
            }} />
            <h3 style={{
              fontSize: '12.5px',
              fontWeight: 650,
              color: '#B45309',
              margin: 0,
              letterSpacing: '0.4px',
              textTransform: 'uppercase'
            }}>
              MOVE / DELAY ({groupedTasks['Move / Delay'].length})
            </h3>
          </div>
          <span style={{
            fontSize: '11px',
            color: '#B45309',
            fontWeight: 500,
            backgroundColor: '#FFFFFF',
            padding: '2px 10px',
            borderRadius: '999px',
            border: '1px solid rgba(253, 230, 138, 0.8)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            Shift Timing / Preserve Buffer
          </span>
        </div>

        {groupedTasks['Move / Delay'].length > 0 ? (
          groupedTasks['Move / Delay'].map(({ item, decision }) => {
            const plan = getEffortPlan(item, isStressDumpConfirmed);
            const isFCG = item.id === 'fcg-test-1';
            const isSelected = selectedPlanIds.includes(item.id);

            return (
              <div key={item.id} style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                padding: '14px 16px',
                boxShadow: isSelected ? '0 4px 16px rgba(217, 119, 6, 0.07), 0 1px 3px rgba(0, 0, 0, 0.02)' : '0 1px 3px rgba(0,0,0,0.02)',
                border: isSelected ? '1.5px solid rgba(253, 230, 138, 0.95)' : '1px dashed #CBD5E1',
                opacity: isSelected ? 1 : 0.65,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <h4 style={{
                      fontSize: '14.5px',
                      fontWeight: 600,
                      color: '#0F172A',
                      margin: 0,
                      letterSpacing: '-0.2px'
                    }}>
                      {item.title}
                    </h4>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#B45309',
                      letterSpacing: '-0.1px'
                    }}>
                      {decision.subtitle}
                    </span>
                  </div>

                  {/* Circular Select Box */}
                  <button
                    type="button"
                    onClick={() => togglePlanSelected(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '2px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                    title={isSelected ? 'Selected to apply in balance plan' : 'Click to select and apply'}
                  >
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      border: isSelected ? '2px solid #10B981' : '1.8px solid #CBD5E1',
                      backgroundColor: isSelected ? '#10B981' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 2px 8px rgba(16, 185, 129, 0.28)' : 'none'
                    }}>
                      {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                    </div>
                  </button>
                </div>

                <p style={{
                  fontSize: '12.5px',
                  color: '#475569',
                  margin: 0,
                  lineHeight: '1.45',
                  fontWeight: 400
                }}>
                  {decision.rationale}
                </p>

                {/* Timing Shift Summary */}
                <div style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  border: '1px solid #F1F5F9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 500, color: '#B45309' }}>
                    {isFCG
                      ? (isStressDumpConfirmed ? 'Shifted after immediate Sep 9–11 cluster' : 'Shifted after immediate deadlines')
                      : 'Prioritized after Sep 14 FCG Test'}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 500, color: '#64748B' }}>
                    Deadline: {item.deadline ? item.deadline.slice(5, 10).replace('-', '/') : 'Upcoming'}
                  </span>
                </div>

                {/* Proposed Schedule Dropdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '2px' }}>
                  <button
                    type="button"
                    onClick={() => toggleScheduleDropdown(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: openScheduleDropdowns[item.id] ? '#F8FAFC' : '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <Calendar size={13} color="#D97706" />
                      <span style={{ fontSize: '12px', fontWeight: 550, color: '#334155' }}>
                        Proposed schedule
                      </span>
                      <span style={{
                        fontSize: '10.5px',
                        fontWeight: 500,
                        backgroundColor: 'rgba(254, 243, 199, 0.7)',
                        color: '#B45309',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        border: '1px solid rgba(253, 230, 138, 0.8)'
                      }}>
                        {plan.blocks.length} {plan.blocks.length === 1 ? 'block' : 'blocks'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#94A3B8' }}>
                      {openScheduleDropdowns[item.id] ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>
                  </button>

                  {openScheduleDropdowns[item.id] && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      padding: '4px 0 2px 0'
                    }}>
                      {plan.blocks.map((b, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          backgroundColor: '#F8FAFC',
                          borderRadius: '12px',
                          border: '1px solid #F1F5F9',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={12} color="#64748B" />
                            <span style={{ fontSize: '12px', color: '#1E293B', fontWeight: 500 }}>
                              {b.date} • {b.startTime} - {b.endTime}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 450 }}>
                              ({b.durationHours}h)
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setEditingTask({
                              id: item.id,
                              blockKey: b.id,
                              title: `${item.title} (${b.durationHours}h block)`,
                              date: b.date,
                              startTime: b.startTime,
                              endTime: b.endTime,
                              action: 'Move / Delay'
                            })}
                            style={{
                              border: '1px solid #CBD5E1',
                              backgroundColor: '#FFFFFF',
                              color: '#475569',
                              padding: '4px 10px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Edit3 size={11} color="#64748B" />
                            <span>Edit</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <span style={{ fontSize: '12px', color: Colors.textMuted }}>No tasks currently in Move / Delay.</span>
        )}
      </div>

      {/* 3. REFINED APPLY BALANCE PLAN CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
        <button
          type="button"
          onClick={handleApplyPlan}
          disabled={selectedPlanIds.length === 0}
          style={{
            width: '100%',
            height: '52px',
            borderRadius: '20px',
            border: selectedPlanIds.length > 0 ? 'none' : '1px solid #E2E8F0',
            background: selectedPlanIds.length > 0
              ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
              : '#F1F5F9',
            color: selectedPlanIds.length > 0 ? '#FFFFFF' : '#94A3B8',
            fontWeight: 600,
            fontSize: '14.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: selectedPlanIds.length > 0 ? 'pointer' : 'not-allowed',
            boxShadow: selectedPlanIds.length > 0
              ? '0 6px 20px rgba(5, 150, 105, 0.28), inset 0 1px 1px rgba(255, 255, 255, 0.25)'
              : 'none',
            transition: 'all 0.2s ease',
            letterSpacing: '-0.2px'
          }}
        >
          <CheckCircle2 size={18} strokeWidth={2.2} />
          <span>
            {selectedPlanIds.length > 0
              ? `Apply Balance Plan (${selectedPlanIds.length} task${selectedPlanIds.length > 1 ? 's' : ''} selected)`
              : 'Select at least 1 task to apply'}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* DIRECT SCHEDULE TIMEBLOCK EDIT MODAL                                      */}
      {/* ========================================================================= */}
      {editingTask && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '22px',
            width: '100%',
            maxWidth: '380px',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            border: '1px solid rgba(255, 255, 255, 0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="serif-title" style={{
                fontSize: '18px',
                fontWeight: 600,
                color: Colors.textDark,
                margin: 0
              }}>
                Edit Schedule Timeblock
              </h3>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
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
                <X size={15} />
              </button>
            </div>

            <div style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#475569',
              backgroundColor: '#F8FAFC',
              padding: '8px 12px',
              borderRadius: '12px',
              border: '1px solid #E2E8F0'
            }}>
              {editingTask.title}
            </div>

            <div>
              <label style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#64748B',
                letterSpacing: '0.4px',
                textTransform: 'uppercase'
              }}>
                SCHEDULE DAY
              </label>
              <input
                type="date"
                value={editingTask.date}
                onChange={(e) => setEditingTask({ ...editingTask, date: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#1E293B',
                  marginTop: '4px',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#64748B',
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase'
                }}>
                  START TIME
                </label>
                <input
                  type="time"
                  value={editingTask.startTime}
                  onChange={(e) => setEditingTask({ ...editingTask, startTime: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#1E293B',
                    marginTop: '4px',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#64748B',
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase'
                }}>
                  END TIME
                </label>
                <input
                  type="time"
                  value={editingTask.endTime}
                  onChange={(e) => setEditingTask({ ...editingTask, endTime: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#1E293B',
                    marginTop: '4px',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                style={{
                  padding: '11px',
                  borderRadius: '14px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#475569',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveScheduleEdit}
                style={{
                  padding: '11px',
                  borderRadius: '14px',
                  border: 'none',
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)'
                }}
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
