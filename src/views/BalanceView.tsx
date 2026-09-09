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

interface SnapshotData {
  workloads: Array<{
    id: string;
    remainingTimeHours: number;
    scheduledDate?: string;
    scheduledStartTime?: string;
    scheduledEndTime?: string;
    balanceDecision?: 'Keep' | 'Reduce' | 'Reconsider' | 'Move / Delay';
    balanceRationale?: string;
  }>;
  busyEvents: FixedBusyEvent[];
  protectedTimes: ProtectedTime[];
  focusBlocks: FocusBlock[];
  webReductionAccepted: boolean;
  sponsorshipShared: boolean;
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
    chatMessages
  } = useApp();

  const activeWorkloads = workloads.filter(w => w.status === 'Active');

  // Check whether Nicole has completed and confirmed Stress Dump
  const isStressDumpConfirmed = workloads.some(w => w.id === 'tech-carnival-sponsorship') ||
    (chatMessages && chatMessages.some(m => m.nicoleConfirmed));

  // Interactive decision states for action-specific cards
  const [webReductionAccepted, setWebReductionAccepted] = useState<boolean>(true);
  const [sponsorshipShared, setSponsorshipShared] = useState<boolean>(true);

  // Custom schedule overrides saved via the edit modal
  const [customSchedules, setCustomSchedules] = useState<Record<string, { date: string; startTime: string; endTime: string }>>({});

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
          : 'Your closest academic deadline is Sep 10 at 8:00 AM. Keep the full 5h preparation target and protect it from lower-priority work.'
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
        rationale: 'This is a large, high-priority assignment due Sep 11. Starting some work before the OS deadline can reduce the amount left immediately afterward.'
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
          : 'The test is on Sep 14, giving it more room than the OS Quiz and Web Programming deadlines. Keep the required preparation, but shift more intensive FCG work until after the immediate deadline cluster.'
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
    const override1 = customSchedules[`${item.id}-1`] || customSchedules[item.id];
    const override2 = customSchedules[`${item.id}-2`];

    if (item.id === 'os-quiz-1') {
      const remaining = 5;
      const b1 = override1 || { date: '2026-09-09', startTime: '08:00', endTime: '10:30' };
      const b2 = override2 || { date: '2026-09-09', startTime: '21:00', endTime: '23:30' };
      const blocks: ProposedBlockPlan[] = [
        {
          id: `${item.id}-1`,
          date: b1.date,
          startTime: b1.startTime,
          endTime: b1.endTime,
          durationHours: 2.5,
          label: 'Part 1: Core concepts & process scheduling'
        },
        {
          id: `${item.id}-2`,
          date: b2.date,
          startTime: b2.startTime,
          endTime: b2.endTime,
          durationHours: 2.5,
          label: 'Part 2: Memory management & practice quiz'
        }
      ];
      const planned = 5.0;
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
        const blocks: ProposedBlockPlan[] = [{
          id: `${item.id}-1`,
          date: b.date,
          startTime: b.startTime,
          endTime: b.endTime,
          durationHours: 2.0,
          label: 'Early start: Frontend component setup'
        }];
        const planned = 2.0;
        return {
          remainingTimeHours: remaining,
          plannedHours: planned,
          unscheduledHours: remaining - planned, // 10.0h unscheduled
          blocks
        };
      } else {
        const remaining = webReductionAccepted ? 13 : 18;
        const b = override1 || { date: '2026-09-10', startTime: '14:00', endTime: '17:00' };
        const blocks: ProposedBlockPlan[] = [{
          id: `${item.id}-1`,
          date: b.date,
          startTime: b.startTime,
          endTime: b.endTime,
          durationHours: 3.0,
          label: 'Near-term plan: Core implementation & review'
        }];
        const planned = 3.0;
        return {
          remainingTimeHours: remaining,
          plannedHours: planned,
          unscheduledHours: remaining - planned, // 10.0h or 15.0h unscheduled
          blocks
        };
      }
    }

    if (item.id === 'tech-carnival-sponsorship') {
      const remaining = 6;
      const b = override1 || { date: '2026-09-09', startTime: '17:00', endTime: '19:00' };
      const blocks: ProposedBlockPlan[] = [{
        id: `${item.id}-1`,
        date: b.date,
        startTime: b.startTime,
        endTime: b.endTime,
        durationHours: 2.0,
        label: 'Retained ownership: Prepare sponsorship materials'
      }];
      const planned = 2.0;
      return {
        remainingTimeHours: remaining,
        plannedHours: planned,
        unscheduledHours: 4.0, // 4h follow-up to share with committee
        blocks
      };
    }

    if (item.id === 'fcg-test-1') {
      const remaining = 8;
      const b = override1 || { date: '2026-09-12', startTime: '14:30', endTime: '17:30' };
      const blocks: ProposedBlockPlan[] = [{
        id: `${item.id}-1`,
        date: b.date,
        startTime: b.startTime,
        endTime: b.endTime,
        durationHours: 3.0,
        label: 'Post-cluster prep: Transformations & 3D pipeline'
      }];
      const planned = 3.0;
      return {
        remainingTimeHours: remaining,
        plannedHours: planned,
        unscheduledHours: remaining - planned, // 5.0h unscheduled
        blocks
      };
    }

    if (item.id === 'philosophy-reflection') {
      const remaining = 2;
      const b = override1 || { date: '2026-09-15', startTime: '14:00', endTime: '16:00' };
      const blocks: ProposedBlockPlan[] = [{
        id: `${item.id}-1`,
        date: b.date,
        startTime: b.startTime,
        endTime: b.endTime,
        durationHours: 2.0,
        label: 'Post-FCG reflection drafting & submission'
      }];
      const planned = 2.0;
      return {
        remainingTimeHours: remaining,
        plannedHours: planned,
        unscheduledHours: 0.0,
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
      updateWorkload({
        ...target,
        scheduledDate: editingTask.date,
        scheduledStartTime: editingTask.startTime,
        scheduledEndTime: editingTask.endTime
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
        balanceDecision: w.balanceDecision,
        balanceRationale: w.balanceRationale
      })),
      busyEvents: [...busyEvents],
      protectedTimes: [...protectedTimes],
      focusBlocks: [...focusBlocks],
      webReductionAccepted,
      sponsorshipShared
    };
    setPreviousSnapshot(snapshot);

    // 2. Generate canonical FocusBlocks for all planned work
    const newFocusBlocks: FocusBlock[] = [];

    activeWorkloads.forEach(item => {
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

      // Update WorkloadItem fields
      // SCHEDULING NEVER REDUCES remainingTimeHours!
      // Only accepted scope reduction alters remainingTimeHours.
      if (decision.action === 'Reduce' && item.id === 'web-programming-group') {
        const primaryBlock = plan.blocks[0];
        updateWorkload({
          ...item,
          remainingTimeHours: webReductionAccepted ? 13 : 18,
          scheduledDate: primaryBlock?.date,
          scheduledStartTime: primaryBlock?.startTime,
          scheduledEndTime: primaryBlock?.endTime,
          balanceDecision: 'Reduce',
          balanceRationale: webReductionAccepted
            ? 'Delegated 5h of responsive styling, testing, and documentation to group members. Early core implementation planned.'
            : 'Retained full 18h group responsibility without delegation.'
        });
        return;
      }

      if (decision.action === 'Reconsider' && item.id === 'tech-carnival-sponsorship') {
        const primaryBlock = plan.blocks[0];
        updateWorkload({
          ...item,
          // remainingTimeHours strictly stays 6h (no arbitrary numerical reduction)
          scheduledDate: primaryBlock?.date,
          scheduledStartTime: primaryBlock?.startTime,
          scheduledEndTime: primaryBlock?.endTime,
          balanceDecision: 'Reconsider',
          balanceRationale: sponsorshipShared
            ? 'Retained sponsorship materials preparation (2h planned Sep 9); proposed sharing follow-up responsibility.'
            : 'Retained full ownership of sponsorship materials and follow-up coordination.'
        });
        return;
      }

      // For Keep and Move / Delay workloads:
      const primaryBlock = plan.blocks[0];
      updateWorkload({
        ...item,
        // remainingTimeHours stays unchanged
        scheduledDate: primaryBlock?.date,
        scheduledStartTime: primaryBlock?.startTime,
        scheduledEndTime: primaryBlock?.endTime,
        balanceDecision: decision.action,
        balanceRationale: decision.rationale
      });
    });

    // Write generated FocusBlocks to AppContext
    setFocusBlocks(newFocusBlocks);

    setToastMessage('✓ Balance plan applied! Tap "Undo" if you wish to revert.');

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
          balanceDecision: snap.balanceDecision,
          balanceRationale: snap.balanceRationale
        });
      }
    });

    setBusyEvents(previousSnapshot.busyEvents);
    setProtectedTimes(previousSnapshot.protectedTimes);
    setFocusBlocks(previousSnapshot.focusBlocks);
    setWebReductionAccepted(previousSnapshot.webReductionAccepted);
    setSponsorshipShared(previousSnapshot.sponsorshipShared);

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

      {/* HEADER */}
      <div>
        <h1 className="serif-title" style={{
          fontSize: '24px',
          fontWeight: 600,
          color: Colors.textDark,
          margin: 0,
          letterSpacing: '-0.3px'
        }}>
          Workload Balance Plan
        </h1>
      </div>

      {/* TOAST MESSAGE WITH UNDO SHORTCUT */}
      {toastMessage && (
        <div style={{
          background: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',
          border: '1.2px solid #86EFAC',
          borderRadius: '16px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          boxShadow: '0 4px 16px rgba(34, 197, 94, 0.15)'
        }}>
          <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#166534' }}>
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
                  borderRadius: '10px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <RotateCcw size={11} />
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
                borderRadius: '10px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              View Calendar
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. RECOVERY SECTION (ONLY SHOWN IF USER IS IN OVERLOADED STATUS)           */}
      {/* ========================================================================= */}
      {capacityProfile.dailyStatus === 'Overloaded' && (
        <div style={{
          backgroundColor: '#FEF2F2',
          borderRadius: '24px',
          padding: '16px 18px',
          border: '1.5px solid #FCA5A5',
          boxShadow: '0 6px 20px rgba(220, 38, 38, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} color="#DC2626" />
              <span style={{
                fontSize: '13px',
                fontWeight: 900,
                color: '#991B1B',
                textTransform: 'uppercase',
                letterSpacing: '0.4px'
              }}>
                Recovery Action Needed
              </span>
            </div>

            <span style={{
              padding: '3px 8px',
              borderRadius: '10px',
              backgroundColor: '#FEE2E2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              fontSize: '11px',
              fontWeight: 800
            }}>
              Priority Rest
            </span>
          </div>

          <p style={{
            fontSize: '13px',
            color: '#991B1B',
            lineHeight: '1.45',
            margin: 0
          }}>
            Your cognitive demand is outstripping energy reserves today. Taking an intentional 20-minute recovery break before tackling analytical work will restore focus.
          </p>

          {/* Quicklinks to Recovery Features */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsTreeHoleOpen(true)}
              style={{
                flex: 1,
                height: '38px',
                borderRadius: '12px',
                border: '1px solid #FCA5A5',
                backgroundColor: '#FFFFFF',
                color: '#991B1B',
                fontWeight: 800,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
              }}
            >
              <Feather size={14} color="#DC2626" />
              <span>Tree Hole Release</span>
            </button>

            <button
              type="button"
              onClick={() => setIsColourReflectionOpen(true)}
              style={{
                flex: 1,
                height: '38px',
                borderRadius: '12px',
                border: '1px solid #FCA5A5',
                backgroundColor: '#FFFFFF',
                color: '#991B1B',
                fontWeight: 800,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
              }}
            >
              <Palette size={14} color="#DC2626" />
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
        backgroundColor: '#F0FDF4',
        borderRadius: '24px',
        padding: '16px 18px',
        border: '1.5px solid #86EFAC',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#166534', margin: 0 }}>
              KEEP ({groupedTasks['Keep'].length})
            </h3>
          </div>
          <span style={{ fontSize: '11.5px', color: '#166534', fontWeight: 700 }}>
            Protect Priority Focus
          </span>
        </div>

        {groupedTasks['Keep'].length > 0 ? (
          groupedTasks['Keep'].map(({ item, decision }) => {
            const plan = getEffortPlan(item, isStressDumpConfirmed);
            const isOS = item.id === 'os-quiz-1';
            const isWeb = item.id === 'web-programming-group';

            return (
              <div key={item.id} style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '14px',
                boxShadow: '0 2px 8px rgba(22, 101, 52, 0.06)',
                border: '1px solid #DCFCE7',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: Colors.textDark, margin: 0 }}>
                      {item.title}
                    </h4>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534', marginTop: '2px', display: 'inline-block' }}>
                      {decision.subtitle}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#166534', backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: '8px' }}>
                    {plan.remainingTimeHours}h target
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: '1.4' }}>
                  {decision.rationale}
                </p>

                {/* Solution Summary */}
                <div style={{
                  backgroundColor: '#F0FDF4',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  border: '1px solid #DCFCE7',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  {isOS ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: Colors.textDark }}>
                        Deadline: Sep 10 • 8:00 AM
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#166534' }}>
                        Early start before OS deadline (2h planned)
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: Colors.textDark }}>
                        Deadline: Sep 11 • 23:59
                      </span>
                    </div>
                  )}
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
                      backgroundColor: '#FFFFFF',
                      borderRadius: '10px',
                      border: '1px solid #BBF7D0',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#166534' }}>
                      <Calendar size={13} />
                      <span>Proposed schedule</span>
                      <span style={{
                        fontSize: '10.5px',
                        fontWeight: 800,
                        backgroundColor: '#DCFCE7',
                        color: '#166534',
                        padding: '1px 6px',
                        borderRadius: '8px'
                      }}>
                        {plan.blocks.length} {plan.blocks.length === 1 ? 'block' : 'blocks'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#166534' }}>
                      {openScheduleDropdowns[item.id] ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>
                  </button>

                  {openScheduleDropdowns[item.id] && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
                      {plan.blocks.map((b, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          backgroundColor: '#FFFFFF',
                          borderRadius: '8px',
                          border: '1px solid #DCFCE7'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: '#166534', fontWeight: 700 }}>
                            <Clock size={13} />
                            <span>{b.date} • {b.startTime} - {b.endTime} ({b.durationHours}h)</span>
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
                              border: '1px solid #86EFAC',
                              backgroundColor: '#F0FDF4',
                              color: '#166534',
                              padding: '3px 9px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                          >
                            <Edit3 size={11} />
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
        backgroundColor: '#EFF6FF',
        borderRadius: '24px',
        padding: '16px 18px',
        border: '1.5px solid #BFDBFE',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1E40AF', margin: 0 }}>
              REDUCE ({groupedTasks['Reduce'].length})
            </h3>
          </div>
          <span style={{ fontSize: '11.5px', color: '#2563EB', fontWeight: 700 }}>
            Reduce Scope / Delegation
          </span>
        </div>

        {groupedTasks['Reduce'].length > 0 ? (
          groupedTasks['Reduce'].map(({ item, decision }) => {
            const plan = getEffortPlan(item, isStressDumpConfirmed);
            return (
              <div key={item.id} style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '14px',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.06)',
                border: '1px solid #DBEAFE',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: Colors.textDark, margin: 0 }}>
                      {item.title}
                    </h4>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#1E40AF', marginTop: '2px', display: 'inline-block' }}>
                      {decision.subtitle}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#1E40AF', backgroundColor: '#DBEAFE', padding: '2px 8px', borderRadius: '8px' }}>
                    18h recorded
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: '1.4' }}>
                  {decision.rationale}
                </p>

                {/* Suggested Delegation Breakdown */}
                <div style={{
                  backgroundColor: '#EFF6FF',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  border: '1px solid #BFDBFE',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={13} color="#2563EB" />
                    <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#1E40AF' }}>
                      Work to hand back
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11.5px', color: '#334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>• Responsive styling</span>
                      <span style={{ fontWeight: 700, color: '#1E40AF' }}>~2h</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>• Testing & bug fixes</span>
                      <span style={{ fontWeight: 700, color: '#1E40AF' }}>~2h</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>• Shared documentation / final checking</span>
                      <span style={{ fontWeight: 700, color: '#1E40AF' }}>~1h</span>
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
                      backgroundColor: '#FFFFFF',
                      borderRadius: '10px',
                      border: '1px solid #BFDBFE',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#1E40AF' }}>
                      <Calendar size={13} />
                      <span>Proposed schedule</span>
                      <span style={{
                        fontSize: '10.5px',
                        fontWeight: 800,
                        backgroundColor: '#DBEAFE',
                        color: '#1E40AF',
                        padding: '1px 6px',
                        borderRadius: '8px'
                      }}>
                        {plan.blocks.length} {plan.blocks.length === 1 ? 'block' : 'blocks'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#1E40AF' }}>
                      {openScheduleDropdowns[item.id] ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>
                  </button>

                  {openScheduleDropdowns[item.id] && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
                      {plan.blocks.map((b, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          backgroundColor: '#EFF6FF',
                          borderRadius: '8px',
                          border: '1px solid #BFDBFE'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: '#1E40AF', fontWeight: 700 }}>
                            <Clock size={13} />
                            <span>{b.date} • {b.startTime} - {b.endTime} ({b.durationHours}h)</span>
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
                              border: '1px solid #BFDBFE',
                              backgroundColor: '#FFFFFF',
                              color: '#1E40AF',
                              padding: '3px 9px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                          >
                            <Edit3 size={11} />
                            <span>Edit</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Primary Action: Scope Decision Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setWebReductionAccepted(true)}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: webReductionAccepted ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                      backgroundColor: webReductionAccepted ? '#2563EB' : '#FFFFFF',
                      color: webReductionAccepted ? '#FFFFFF' : '#334155',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      boxShadow: webReductionAccepted ? '0 2px 6px rgba(37,99,235,0.2)' : 'none'
                    }}
                  >
                    {webReductionAccepted && <Check size={13} />}
                    <span>{webReductionAccepted ? 'Accept (13h)' : 'Accept Reduction'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWebReductionAccepted(false)}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: !webReductionAccepted ? '1.5px solid #64748B' : '1px solid #E2E8F0',
                      backgroundColor: !webReductionAccepted ? '#475569' : '#FFFFFF',
                      color: !webReductionAccepted ? '#FFFFFF' : '#64748B',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    {!webReductionAccepted && <Check size={13} />}
                    <span>Keep (18h)</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '12px 14px',
            border: '1px dashed #BFDBFE',
            color: '#64748B',
            fontSize: '12px',
            lineHeight: '1.4'
          }}>
            No workload has a clearly reducible scope based on what Restore currently knows.
          </div>
        )}
      </div>

      {/* C) RECONSIDER SECTION (Purple Branding) */}
      <div style={{
        backgroundColor: '#FAF5FF',
        borderRadius: '24px',
        padding: '16px 18px',
        border: '1.5px solid #DDD6FE',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#7C3AED' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#6B21A8', margin: 0 }}>
              RECONSIDER ({groupedTasks['Reconsider'].length})
            </h3>
          </div>
          <span style={{ fontSize: '11.5px', color: '#7C3AED', fontWeight: 700 }}>
            Ownership & Delegation
          </span>
        </div>

        {groupedTasks['Reconsider'].length > 0 ? (
          groupedTasks['Reconsider'].map(({ item, decision }) => {
            const plan = getEffortPlan(item, isStressDumpConfirmed);
            return (
              <div key={item.id} style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '14px',
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.06)',
                border: '1px solid #EDE9FE',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: Colors.textDark, margin: 0 }}>
                      {item.title}
                    </h4>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B21A8', marginTop: '2px', display: 'inline-block' }}>
                      {decision.subtitle}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#6B21A8', backgroundColor: '#EDE9FE', padding: '2px 8px', borderRadius: '8px' }}>
                    {item.remainingTimeHours}h recorded
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: '1.4' }}>
                  {decision.rationale}
                </p>

                {/* Subtask Ownership Analysis */}
                <div style={{
                  backgroundColor: '#FAF5FF',
                  borderRadius: '12px',
                  padding: '12px 12px',
                  border: '1px solid #E9D5FF',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#334155', marginTop: '3px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div><strong style={{ color: '#166534' }}>Keep:</strong> Prepare sponsorship materials (2h planned)</div>
                      <div><strong style={{ color: '#7C3AED' }}>Share / hand off:</strong> Part of sponsorship follow-up (proposed to share)</div>
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
                      backgroundColor: '#FFFFFF',
                      borderRadius: '10px',
                      border: '1px solid #DDD6FE',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#6B21A8' }}>
                      <Calendar size={13} />
                      <span>Proposed schedule</span>
                      <span style={{
                        fontSize: '10.5px',
                        fontWeight: 800,
                        backgroundColor: '#EDE9FE',
                        color: '#6B21A8',
                        padding: '1px 6px',
                        borderRadius: '8px'
                      }}>
                        {plan.blocks.length} {plan.blocks.length === 1 ? 'block' : 'blocks'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#6B21A8' }}>
                      {openScheduleDropdowns[item.id] ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>
                  </button>

                  {openScheduleDropdowns[item.id] && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
                      {plan.blocks.map((b, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          backgroundColor: '#FAF5FF',
                          borderRadius: '8px',
                          border: '1px solid #DDD6FE'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: '#6B21A8', fontWeight: 700 }}>
                            <Clock size={13} />
                            <span>{b.date} • {b.startTime} - {b.endTime} ({b.durationHours}h)</span>
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
                              border: '1px solid #DDD6FE',
                              backgroundColor: '#FFFFFF',
                              color: '#6B21A8',
                              padding: '3px 9px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                          >
                            <Edit3 size={11} />
                            <span>Edit</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Primary Action: Share vs Keep Ownership Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setSponsorshipShared(true)}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: sponsorshipShared ? '1.5px solid #7C3AED' : '1px solid #CBD5E1',
                      backgroundColor: sponsorshipShared ? '#7C3AED' : '#FFFFFF',
                      color: sponsorshipShared ? '#FFFFFF' : '#334155',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      boxShadow: sponsorshipShared ? '0 2px 6px rgba(124,58,237,0.2)' : 'none'
                    }}
                  >
                    {sponsorshipShared && <Check size={13} />}
                    <span>{sponsorshipShared ? "Accept" : "I'll Share This"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSponsorshipShared(false)}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: !sponsorshipShared ? '1.5px solid #64748B' : '1px solid #E2E8F0',
                      backgroundColor: !sponsorshipShared ? '#475569' : '#FFFFFF',
                      color: !sponsorshipShared ? '#FFFFFF' : '#64748B',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    {!sponsorshipShared && <Check size={13} />}
                    <span>Keep</span>
                  </button>
                </div>

                <div style={{ fontSize: '10.5px', color: '#8B5CF6', textAlign: 'center' }}>
                  Records ownership decision in plan. Remaining effort stays 6h (no arbitrary numerical reduction).
                </div>
              </div>
            );
          })
        ) : (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '12px 14px',
            border: '1px dashed #DDD6FE',
            color: '#64748B',
            fontSize: '12px',
            lineHeight: '1.4'
          }}>
            No responsibility currently needs an ownership decision based on the information recorded so far.
          </div>
        )}
      </div>

      {/* D) MOVE / DELAY SECTION (Yellow Branding) */}
      <div style={{
        backgroundColor: '#FFFBEB',
        borderRadius: '24px',
        padding: '16px 18px',
        border: '1.5px solid #FDE68A',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#D97706' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#92400E', margin: 0 }}>
              MOVE / DELAY ({groupedTasks['Move / Delay'].length})
            </h3>
          </div>
          <span style={{ fontSize: '11.5px', color: '#D97706', fontWeight: 700 }}>
            Shift Timing / Preserve Buffer
          </span>
        </div>

        {groupedTasks['Move / Delay'].length > 0 ? (
          groupedTasks['Move / Delay'].map(({ item, decision }) => {
            const plan = getEffortPlan(item, isStressDumpConfirmed);
            const isFCG = item.id === 'fcg-test-1';
            const isPhilosophy = item.id === 'philosophy-reflection';

            return (
              <div key={item.id} style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '14px',
                boxShadow: '0 2px 8px rgba(217, 119, 6, 0.06)',
                border: '1px solid #FEF3C7',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: Colors.textDark, margin: 0 }}>
                      {item.title}
                    </h4>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#92400E', marginTop: '2px', display: 'inline-block' }}>
                      {decision.subtitle}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#92400E', backgroundColor: '#FEF3C7', padding: '2px 8px', borderRadius: '8px' }}>
                    {plan.remainingTimeHours}h target
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: '1.4' }}>
                  {decision.rationale}
                </p>

                {/* Timing Shift Summary */}
                <div style={{
                  backgroundColor: '#FFFBEB',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  border: '1px solid #FEF3C7',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#92400E' }}>
                    {isFCG
                      ? (isStressDumpConfirmed ? 'Shifted after immediate Sep 9–11 cluster' : 'Shifted after immediate deadlines')
                      : 'Prioritized after Sep 14 FCG Test'}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: Colors.textDark }}>
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
                      backgroundColor: '#FFFFFF',
                      borderRadius: '10px',
                      border: '1px solid #FDE68A',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#92400E' }}>
                      <Calendar size={13} />
                      <span>Proposed schedule</span>
                      <span style={{
                        fontSize: '10.5px',
                        fontWeight: 800,
                        backgroundColor: '#FEF3C7',
                        color: '#92400E',
                        padding: '1px 6px',
                        borderRadius: '8px'
                      }}>
                        {plan.blocks.length} {plan.blocks.length === 1 ? 'block' : 'blocks'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#92400E' }}>
                      {openScheduleDropdowns[item.id] ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>
                  </button>

                  {openScheduleDropdowns[item.id] && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
                      {plan.blocks.map((b, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          backgroundColor: '#FFFFFF',
                          borderRadius: '8px',
                          border: '1px solid #FEF3C7'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: '#92400E', fontWeight: 700 }}>
                            <Clock size={13} />
                            <span>{b.date} • {b.startTime} - {b.endTime} ({b.durationHours}h)</span>
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
                              border: '1px solid #FDE68A',
                              backgroundColor: '#FFFBEB',
                              color: '#92400E',
                              padding: '3px 9px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                          >
                            <Edit3 size={11} />
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

      {/* 3. APPLY BALANCE PLAN CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          type="button"
          onClick={handleApplyPlan}
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
          <CheckCircle2 size={18} />
          <span>Apply Balance Plan</span>
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
          zIndex: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '20px',
            width: '100%',
            maxWidth: '380px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: Colors.textDark, margin: 0 }}>
                Edit Schedule Timeblock
              </h3>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                style={{ border: 'none', background: '#F1F5F9', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ fontSize: '13.5px', fontWeight: 800, color: Colors.textDark }}>
              {editingTask.title}
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 800, color: Colors.textMuted }}>SCHEDULE DAY</label>
              <input
                type="date"
                value={editingTask.date}
                onChange={(e) => setEditingTask({ ...editingTask, date: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  marginTop: '3px'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: Colors.textMuted }}>START TIME</label>
                <input
                  type="time"
                  value={editingTask.startTime}
                  onChange={(e) => setEditingTask({ ...editingTask, startTime: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    marginTop: '3px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: Colors.textMuted }}>END TIME</label>
                <input
                  type="time"
                  value={editingTask.endTime}
                  onChange={(e) => setEditingTask({ ...editingTask, endTime: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    marginTop: '3px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                style={{
                  padding: '10px',
                  borderRadius: '12px',
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
                onClick={handleSaveScheduleEdit}
                style={{
                  padding: '10px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer'
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
