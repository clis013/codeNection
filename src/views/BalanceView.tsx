import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';
import { WorkloadItem } from '../types/workload';
import { 
  Check, Calendar, Clock, Sparkles, Edit3, X, ArrowRight, 
  Heart, Feather, Palette, Coffee, ShieldAlert, CheckCircle2,
  AlertTriangle, RotateCcw
} from 'lucide-react';

export const BalanceView: React.FC = () => {
  const {
    workloads,
    updateWorkload,
    setIsTreeHoleOpen,
    setIsColourReflectionOpen,
    setActiveTab,
    todayCheckIn,
    capacityProfile
  } = useApp();

  const activeWorkloads = workloads.filter(w => w.status === 'Active');

  // Modal state for editing a task's schedule
  const [editingTask, setEditingTask] = useState<null | {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    action: string;
  }>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Undo snapshot state for applied schedules
  const [previousSnapshot, setPreviousSnapshot] = useState<Array<{
    id: string;
    scheduledDate?: string;
    scheduledStartTime?: string;
    scheduledEndTime?: string;
    balanceDecision?: any;
    balanceRationale?: string;
  }> | null>(null);

  // Decision classification for workloads
  const getDecision = (item: WorkloadItem): {
    action: 'Keep' | 'Reduce' | 'Reconsider' | 'Move / Delay';
    rationale: string;
  } => {
    if (item.balanceDecision && item.balanceRationale) {
      return { action: item.balanceDecision, rationale: item.balanceRationale };
    }
    if (item.demandProfile.cognitive >= 4 && (item.urgency === 'High' || item.urgency === 'Urgent')) {
      return {
        action: 'Keep',
        rationale: 'High priority with strict deadline — keep slot protected and minimize interruptions.'
      };
    }
    if (item.demandProfile.cognitive + item.demandProfile.emotional > 6) {
      return {
        action: 'Reduce',
        rationale: 'Heavy combined cognitive & emotional load — shorten scope by 30% or break into subtasks.'
      };
    }
    if (item.area === 'Social' || item.timeFlexibility === 'Flexible') {
      return {
        action: 'Move / Delay',
        rationale: 'Flexible timeframe — defer by 2–3 days to preserve energy buffers for core academic proofs.'
      };
    }
    return {
      action: 'Reconsider',
      rationale: 'Moderate complexity — schedule dedicated prep block later this week rather than cramming.'
    };
  };

  // Default suggested timeblocks
  const getInitialSchedule = (item: WorkloadItem, action: string) => {
    if (item.scheduledDate && item.scheduledStartTime && item.scheduledEndTime) {
      return {
        date: item.scheduledDate,
        startTime: item.scheduledStartTime,
        endTime: item.scheduledEndTime
      };
    }
    switch (action) {
      case 'Keep':
        return { date: '2026-09-05', startTime: '09:30', endTime: '12:30' };
      case 'Reduce':
        return { date: '2026-09-05', startTime: '14:00', endTime: '15:30' };
      case 'Reconsider':
        return { date: '2026-09-07', startTime: '10:00', endTime: '12:00' };
      case 'Move / Delay':
      default:
        return { date: '2026-09-08', startTime: '16:00', endTime: '17:30' };
    }
  };

  // Group workloads by decision
  const groupedTasks: Record<'Keep' | 'Reduce' | 'Reconsider' | 'Move / Delay', Array<{ item: WorkloadItem; rationale: string }>> = {
    'Keep': [],
    'Reduce': [],
    'Reconsider': [],
    'Move / Delay': []
  };

  activeWorkloads.forEach(item => {
    const dec = getDecision(item);
    groupedTasks[dec.action].push({ item, rationale: dec.rationale });
  });

  // Check if recovery is actively needed
  const needsRecovery = capacityProfile.analysisResult.demandResourceStatus === 'Strained' || 
    capacityProfile.analysisResult.demandResourceStatus === 'Overloaded' || 
    (todayCheckIn && (todayCheckIn.category === 'High' || todayCheckIn.category === 'Very High'));

  const handleSaveScheduleEdit = () => {
    if (!editingTask) return;
    const target = workloads.find(w => w.id === editingTask.id);
    if (target) {
      updateWorkload({
        ...target,
        scheduledDate: editingTask.date,
        scheduledStartTime: editingTask.startTime,
        scheduledEndTime: editingTask.endTime
      });
    }
    setEditingTask(null);
    setToastMessage(`✓ Updated schedule for ${editingTask.title}`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApplyPlan = () => {
    // Snapshot current schedules before applying
    const snapshot = activeWorkloads.map(w => ({
      id: w.id,
      scheduledDate: w.scheduledDate,
      scheduledStartTime: w.scheduledStartTime,
      scheduledEndTime: w.scheduledEndTime,
      balanceDecision: w.balanceDecision,
      balanceRationale: w.balanceRationale
    }));
    setPreviousSnapshot(snapshot);

    activeWorkloads.forEach(item => {
      const dec = getDecision(item);
      const sched = getInitialSchedule(item, dec.action);
      updateWorkload({
        ...item,
        scheduledDate: sched.date,
        scheduledStartTime: sched.startTime,
        scheduledEndTime: sched.endTime,
        balanceDecision: dec.action,
        balanceRationale: dec.rationale
      });
    });

    setToastMessage('✓ All tasks applied to calendar! Tap "Undo" if you wish to revert.');

    // Automatically scroll view to top to see notification and View Calendar option
    setTimeout(() => {
      const scrollContainer = document.querySelector('.hide-scrollbar');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      }
      const topEl = document.getElementById('balance-page-top');
      if (topEl) {
        topEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);

    setTimeout(() => setToastMessage(null), 8000);
  };

  const handleUndoApply = () => {
    if (!previousSnapshot) return;
    previousSnapshot.forEach(snap => {
      const target = workloads.find(w => w.id === snap.id);
      if (target) {
        updateWorkload({
          ...target,
          scheduledDate: snap.scheduledDate,
          scheduledStartTime: snap.scheduledStartTime,
          scheduledEndTime: snap.scheduledEndTime,
          balanceDecision: snap.balanceDecision,
          balanceRationale: snap.balanceRationale
        });
      }
    });
    setPreviousSnapshot(null);
    setToastMessage('✓ Schedule reverted to previous state.');
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
      {capacityProfile.analysisResult.demandResourceStatus === 'Overloaded' && (
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
            Strict Priority Focus
          </span>
        </div>

        {groupedTasks['Keep'].length > 0 ? (
          groupedTasks['Keep'].map(({ item, rationale }) => {
            const sched = getInitialSchedule(item, 'Keep');
            return (
              <div key={item.id} style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '14px',
                boxShadow: '0 2px 8px rgba(22, 101, 52, 0.06)',
                border: '1px solid #DCFCE7',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: Colors.textDark, margin: 0 }}>
                    {item.title}
                  </h4>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534' }}>
                    {item.estimatedHours}h
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: '1.35' }}>
                  {rationale}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', paddingTop: '6px', borderTop: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: '#166534', fontWeight: 700 }}>
                    <Clock size={13} />
                    <span>{sched.date} • {sched.startTime} - {sched.endTime}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditingTask({
                      id: item.id,
                      title: item.title,
                      date: sched.date,
                      startTime: sched.startTime,
                      endTime: sched.endTime,
                      action: 'Keep'
                    })}
                    style={{
                      border: '1px solid #86EFAC',
                      backgroundColor: '#F0FDF4',
                      color: '#166534',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Edit3 size={12} />
                    <span>Edit Block</span>
                  </button>
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
            Reduce Scope / Subdivide
          </span>
        </div>

        {groupedTasks['Reduce'].length > 0 ? (
          groupedTasks['Reduce'].map(({ item, rationale }) => {
            const sched = getInitialSchedule(item, 'Reduce');
            return (
              <div key={item.id} style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '14px',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.06)',
                border: '1px solid #DBEAFE',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: Colors.textDark, margin: 0 }}>
                    {item.title}
                  </h4>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#1E40AF' }}>
                    {item.estimatedHours}h
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: '1.35' }}>
                  {rationale}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', paddingTop: '6px', borderTop: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: '#1E40AF', fontWeight: 700 }}>
                    <Clock size={13} />
                    <span>{sched.date} • {sched.startTime} - {sched.endTime}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditingTask({
                      id: item.id,
                      title: item.title,
                      date: sched.date,
                      startTime: sched.startTime,
                      endTime: sched.endTime,
                      action: 'Reduce'
                    })}
                    style={{
                      border: '1px solid #BFDBFE',
                      backgroundColor: '#EFF6FF',
                      color: '#1E40AF',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Edit3 size={12} />
                    <span>Edit Block</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <span style={{ fontSize: '12px', color: Colors.textMuted }}>No tasks currently in Reduce.</span>
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
            Re-plan Preparation
          </span>
        </div>

        {groupedTasks['Reconsider'].length > 0 ? (
          groupedTasks['Reconsider'].map(({ item, rationale }) => {
            const sched = getInitialSchedule(item, 'Reconsider');
            return (
              <div key={item.id} style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '14px',
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.06)',
                border: '1px solid #EDE9FE',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: Colors.textDark, margin: 0 }}>
                    {item.title}
                  </h4>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#6B21A8' }}>
                    {item.estimatedHours}h
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: '1.35' }}>
                  {rationale}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', paddingTop: '6px', borderTop: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: '#6B21A8', fontWeight: 700 }}>
                    <Clock size={13} />
                    <span>{sched.date} • {sched.startTime} - {sched.endTime}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditingTask({
                      id: item.id,
                      title: item.title,
                      date: sched.date,
                      startTime: sched.startTime,
                      endTime: sched.endTime,
                      action: 'Reconsider'
                    })}
                    style={{
                      border: '1px solid #DDD6FE',
                      backgroundColor: '#FAF5FF',
                      color: '#6B21A8',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Edit3 size={12} />
                    <span>Edit Block</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <span style={{ fontSize: '12px', color: Colors.textMuted }}>No tasks currently in Reconsider.</span>
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
            Flexible Schedule
          </span>
        </div>

        {groupedTasks['Move / Delay'].length > 0 ? (
          groupedTasks['Move / Delay'].map(({ item, rationale }) => {
            const sched = getInitialSchedule(item, 'Move / Delay');
            return (
              <div key={item.id} style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '14px',
                boxShadow: '0 2px 8px rgba(217, 119, 6, 0.06)',
                border: '1px solid #FEF3C7',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: Colors.textDark, margin: 0 }}>
                    {item.title}
                  </h4>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#92400E' }}>
                    {item.estimatedHours}h
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: '1.35' }}>
                  {rationale}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', paddingTop: '6px', borderTop: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: '#92400E', fontWeight: 700 }}>
                    <Clock size={13} />
                    <span>{sched.date} • {sched.startTime} - {sched.endTime}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditingTask({
                      id: item.id,
                      title: item.title,
                      date: sched.date,
                      startTime: sched.startTime,
                      endTime: sched.endTime,
                      action: 'Move / Delay'
                    })}
                    style={{
                      border: '1px solid #FDE68A',
                      backgroundColor: '#FFFBEB',
                      color: '#92400E',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Edit3 size={12} />
                    <span>Edit Block</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <span style={{ fontSize: '12px', color: Colors.textMuted }}>No tasks currently in Move / Delay.</span>
        )}
      </div>

      {/* 3. APPLY ALL TO CALENDAR BUTTON */}
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
          <span>Apply All to Calendar</span>
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
