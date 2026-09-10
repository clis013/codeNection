import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkloadItem } from '../../types/workload';
import { Colors } from '../../theme/colors';
import { X, Sparkles, Calendar, Check, Clock, Edit3, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AiRebalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiRebalanceModal: React.FC<AiRebalanceModalProps> = ({ isOpen, onClose }) => {
  const { workloads, applyRebalancedTasks, setSelectedWorkload, setIsWorkloadDetailOpen } = useApp();

  // Create editable rebalanced task drafts
  const [rebalancedItems, setRebalancedItems] = useState<Array<WorkloadItem & { recommendedDate: string; reason: string }>>(() => {
    return workloads.map(w => {
      let recDate = w.deadline;
      let reason = 'Balanced for optimal energy';
      if (w.title.includes('Psychology')) {
        recDate = '2026-09-08T16:00:00';
        reason = 'Moved +2 days to eliminate cognitive overlap with CS 401';
      } else if (w.title.includes('Algorithm')) {
        recDate = '2026-09-05T20:00:00';
        reason = 'Maintained for morning high cognitive focus';
      } else if (w.title.includes('Family')) {
        recDate = '2026-09-09T19:00:00';
        reason = 'Social recharge scheduled after midterm week';
      }
      return {
        ...w,
        recommendedDate: recDate,
        reason
      };
    });
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDateChange = (id: string, newDateStr: string) => {
    setRebalancedItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      return {
        ...item,
        recommendedDate: newDateStr,
        deadline: newDateStr
      };
    }));
  };

  const handleHoursChange = (id: string, hours: number) => {
    setRebalancedItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      return {
        ...item,
        estimatedHours: hours
      };
    }));
  };

  const handleApplyToCalendar = () => {
    const updated = rebalancedItems.map(item => ({
      ...item,
      deadline: item.recommendedDate
    }));
    applyRebalancedTasks(updated);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1600);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(30, 27, 24, 0.65)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      zIndex: 350,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '32px',
        width: '100%',
        maxWidth: '393px',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 25px 60px rgba(255, 138, 80, 0.25)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            border: 'none',
            backgroundColor: 'rgba(241, 245, 249, 0.8)',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div>
          <span style={{
            background: 'linear-gradient(135deg, rgba(255, 176, 136, 0.25) 0%, rgba(254, 215, 170, 0.4) 100%)',
            color: Colors.peachText,
            fontSize: '11px',
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Sparkles size={12} /> AI Dynamic Rebalancer
          </span>
          <h2 className="serif-title" style={{ fontSize: '22px', fontWeight: 600, color: Colors.textDark, marginTop: '6px' }}>
            Rebalance Your Schedule
          </h2>
          <p style={{ fontSize: '12px', color: Colors.textMuted, marginTop: '2px' }}>
            AI reorganized your tasks to dissolve peak cognitive strain. You can customize any task below.
          </p>
        </div>

        {/* Success Alert Banner */}
        {isSuccess && (
          <div style={{
            backgroundColor: '#DCFCE7',
            border: '1.5px solid #86EFAC',
            borderRadius: '16px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#15803D',
            fontSize: '13px',
            fontWeight: 800
          }}>
            <CheckCircle2 size={20} />
            <span>Synced directly to your Monthly Task Calendar!</span>
          </div>
        )}

        {/* Rebalanced Tasks List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {rebalancedItems.map(item => {
            const isEditing = editingId === item.id;
            const originalDate = new Date(item.deadline).getDate();
            const recommendedDate = new Date(item.recommendedDate).getDate();
            const dateChanged = originalDate !== recommendedDate;

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: 'rgba(255, 247, 242, 0.6)',
                  border: '1.5px solid rgba(254, 215, 170, 0.7)',
                  borderRadius: '20px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: 800,
                    color: Colors.peachText,
                    backgroundColor: 'rgba(255, 237, 226, 0.9)',
                    padding: '2px 8px',
                    borderRadius: '8px'
                  }}>
                    {item.area}
                  </span>

                  <button
                    onClick={() => setEditingId(isEditing ? null : item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: Colors.purpleText,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <Edit3 size={12} /> {isEditing ? 'Done Editing' : 'Custom Edit'}
                  </button>
                </div>

                <div style={{ fontSize: '13.5px', fontWeight: 700, color: Colors.textDark }}>
                  {item.title}
                </div>

                {/* Date & Shift Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: Colors.textMedium }}>
                  <Calendar size={13} color="#EA580C" />
                  <span>Scheduled: <b>Sep {recommendedDate}, 2026</b></span>
                  {dateChanged && (
                    <span style={{
                      color: '#16A34A',
                      fontWeight: 700,
                      backgroundColor: '#DCFCE7',
                      padding: '1px 6px',
                      borderRadius: '6px',
                      fontSize: '10px'
                    }}>
                      Shifted +{recommendedDate - originalDate}d
                    </span>
                  )}
                  <span>•</span>
                  <span>{item.estimatedHours}h</span>
                </div>

                {/* AI Rationale */}
                <div style={{
                  fontSize: '11px',
                  color: '#9A3412',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  padding: '6px 10px',
                  borderRadius: '10px',
                  lineHeight: '1.4'
                }}>
                  💡 {item.reason}
                </div>

                {/* Custom Edit Sub-Panel if expanded */}
                {isEditing && (
                  <div style={{
                    marginTop: '6px',
                    padding: '10px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    border: '1px solid rgba(226, 232, 240, 0.9)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
                      <span style={{ fontWeight: 700, color: Colors.textDark }}>Move to Day in Sep:</span>
                      <select
                        value={new Date(item.recommendedDate).getDate()}
                        onChange={(e) => {
                          const day = parseInt(e.target.value);
                          const dStr = `2026-09-${day < 10 ? '0' + day : day}T15:00:00`;
                          handleDateChange(item.id, dStr);
                        }}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '11.5px',
                          fontWeight: 700
                        }}
                      >
                        {Array.from({ length: 30 }).map((_, idx) => (
                          <option key={idx + 1} value={idx + 1}>
                            Sep {idx + 1}, 2026
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
                      <span style={{ fontWeight: 700, color: Colors.textDark }}>Estimated Hours:</span>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={item.estimatedHours}
                        onChange={(e) => handleHoursChange(item.id, parseInt(e.target.value) || 1)}
                        style={{
                          width: '60px',
                          padding: '4px 6px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          textAlign: 'center'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Button: Put Directly into Calendar */}
        <button
          onClick={handleApplyToCalendar}
          style={{
            background: 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)',
            color: '#9A3412',
            border: '1.2px solid rgba(251, 146, 60, 0.4)',
            borderRadius: '24px',
            padding: '14px 20px',
            fontSize: '13.5px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 6px 20px rgba(234, 88, 12, 0.2)',
            marginTop: '6px',
            transition: 'all 0.15s ease'
          }}
        >
          <Calendar size={17} />
          <span>Put Directly into Task Calendar</span>
        </button>
      </div>
    </div>
  );
};
