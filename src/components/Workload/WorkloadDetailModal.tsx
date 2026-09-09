import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkloadItem, WorkloadArea, ActivityType, UrgencyLevel, FlexibilityLevel, SubTask, NasaTlxScore } from '../../types/workload';
import { Colors, AreaColors } from '../../theme/colors';
import { X, Check, Trash2, Calendar as CalendarIcon, Clock, Sliders, Brain, Heart, Activity, CheckSquare, Calculator } from 'lucide-react';

export const WorkloadDetailModal: React.FC = () => {
  const {
    selectedWorkload,
    isWorkloadDetailOpen,
    setIsWorkloadDetailOpen,
    updateWorkload,
    deleteWorkload,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    saveNasaTlxScore
  } = useApp();

  const [formData, setFormData] = useState<WorkloadItem | null>(selectedWorkload);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showNasaTlx, setShowNasaTlx] = useState(false);
  const [nasaScores, setNasaScores] = useState<NasaTlxScore>({
    mentalDemand: 50,
    physicalDemand: 20,
    temporalDemand: 50,
    performance: 50,
    effort: 50,
    frustration: 40
  });

  useEffect(() => {
    setFormData(selectedWorkload);
    if (selectedWorkload?.nasaTlx) {
      setNasaScores(selectedWorkload.nasaTlx);
    }
  }, [selectedWorkload]);

  if (!isWorkloadDetailOpen || !formData) return null;

  const handleSave = () => {
    updateWorkload(formData);
    setIsWorkloadDetailOpen(false);
  };

  const handleDelete = () => {
    if (formData) {
      deleteWorkload(formData.id);
    }
  };

  const handleToggleSubtask = (stId: string) => {
    if (!formData) return;
    const updated = formData.subtasks.map(st => st.id === stId ? { ...st, completed: !st.completed } : st);
    setFormData({ ...formData, subtasks: updated });
    toggleSubtask(formData.id, stId);
  };

  const handleRemoveSubtask = (stId: string) => {
    if (!formData) return;
    const updated = formData.subtasks.filter(st => st.id !== stId);
    setFormData({ ...formData, subtasks: updated });
    deleteSubtask(formData.id, stId);
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !newSubtaskTitle.trim()) return;
    const newSt: SubTask = { id: `st-${Date.now()}`, title: newSubtaskTitle.trim(), completed: false };
    setFormData({ ...formData, subtasks: [...formData.subtasks, newSt] });
    addSubtask(formData.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  const handleCalculateNasaTlx = () => {
    if (!formData) return;
    const total = nasaScores.mentalDemand + nasaScores.physicalDemand + nasaScores.temporalDemand +
      nasaScores.performance + nasaScores.effort + nasaScores.frustration;
    const avg = parseFloat((total / 6).toFixed(1));
    const updatedTlx: NasaTlxScore = { ...nasaScores, overallScore: avg };
    setFormData({ ...formData, nasaTlx: updatedTlx });
    saveNasaTlxScore(formData.id, updatedTlx);
    setShowNasaTlx(false);
  };

  const areas: WorkloadArea[] = ['Academic', 'Personal', 'Social', 'Self-Care'];
  const urgencies: UrgencyLevel[] = ['Low', 'Medium', 'High', 'Urgent'];
  const flexibilities: FlexibilityLevel[] = ['Strict', 'Moderate', 'Flexible'];
  const activities: ActivityType[] = ['Deep focus', 'Communication', 'Creative', 'Physical', 'Administrative'];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(44, 62, 80, 0.45)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '430px',
        maxHeight: '88vh',
        overflowY: 'auto',
        padding: '20px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.22)',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        border: `1px solid ${Colors.skyBlue}`
      }}>
        {/* Modal Header matching Reference */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${Colors.borderSoft}`,
          paddingBottom: '12px'
        }}>
          <div>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#059669',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Workload Task Fill-In Details
            </span>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: Colors.textDark, marginTop: '2px' }}>
              Edit & Rating Details
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsWorkloadDetailOpen(false)}
            style={{
              border: 'none',
              backgroundColor: Colors.background,
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: Colors.textMuted
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Task Title */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: Colors.textMedium }}>Task Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '14px',
                border: `1px solid ${Colors.borderSoft}`,
                fontSize: '14px',
                fontWeight: 600,
                color: Colors.textDark,
                marginTop: '4px',
                outline: 'none',
                backgroundColor: Colors.background
              }}
            />
          </div>

          {/* Due Date & Due Time Side by Side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: Colors.textMedium, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CalendarIcon size={13} color="#059669" /> Due Date
              </label>
              <input
                type="date"
                value={(() => {
                  try {
                    const d = new Date(formData.deadline);
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${y}-${m}-${day}`;
                  } catch {
                    return '2026-09-09';
                  }
                })()}
                onChange={(e) => {
                  const newDateStr = e.target.value;
                  try {
                    const curr = new Date(formData.deadline);
                    const [y, m, day] = newDateStr.split('-').map(Number);
                    curr.setFullYear(y);
                    curr.setMonth(m - 1);
                    curr.setDate(day);
                    setFormData({ ...formData, deadline: curr.toISOString() });
                  } catch {
                    // ignore
                  }
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '12px',
                  border: `1px solid ${Colors.borderSoft}`,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: Colors.textDark,
                  backgroundColor: Colors.background,
                  marginTop: '4px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: Colors.textMedium, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} color="#C2410C" /> Due Time
              </label>
              <input
                type="time"
                value={(() => {
                  try {
                    const d = new Date(formData.deadline);
                    const h = String(d.getHours()).padStart(2, '0');
                    const m = String(d.getMinutes()).padStart(2, '0');
                    return `${h}:${m}`;
                  } catch {
                    return '20:00';
                  }
                })()}
                onChange={(e) => {
                  const newTimeStr = e.target.value;
                  try {
                    const curr = new Date(formData.deadline);
                    const [h, m] = newTimeStr.split(':').map(Number);
                    curr.setHours(h);
                    curr.setMinutes(m);
                    setFormData({ ...formData, deadline: curr.toISOString() });
                  } catch {
                    // ignore
                  }
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '12px',
                  border: `1px solid ${Colors.borderSoft}`,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: Colors.textDark,
                  backgroundColor: Colors.background,
                  marginTop: '4px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Workload Area Selector (2x2 grid matching Reference) */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: Colors.textMedium }}>Workload Area</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
              {areas.map((a) => {
                const selected = formData.area === a;
                const style = AreaColors[a];
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setFormData({ ...formData, area: a })}
                    style={{
                      padding: '8px',
                      borderRadius: '12px',
                      border: selected ? `1.5px solid ${style.border}` : `1px solid ${Colors.borderSoft}`,
                      backgroundColor: selected ? style.bg : '#FFFFFF',
                      color: selected ? style.text : Colors.textMedium,
                      fontWeight: selected ? 700 : 500,
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Urgency Level & Flexibility Side by Side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: Colors.textMedium }}>Urgency Level</label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value as UrgencyLevel })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  border: `1px solid ${Colors.borderSoft}`,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: Colors.textDark,
                  backgroundColor: Colors.background,
                  marginTop: '4px'
                }}
              >
                {urgencies.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: Colors.textMedium }}>Flexibility</label>
              <select
                value={formData.flexibility || formData.timeFlexibility || 'Moderate'}
                onChange={(e) => {
                  const flex = e.target.value as FlexibilityLevel;
                  setFormData({
                    ...formData,
                    flexibility: flex,
                    timeFlexibility: flex,
                    effortFlexibility: flex
                  });
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  border: `1px solid ${Colors.borderSoft}`,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: Colors.textDark,
                  backgroundColor: Colors.background,
                  marginTop: '4px'
                }}
              >
                {flexibilities.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {/* Activity Type & Estimated Hours Side by Side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: Colors.textMedium }}>Activity Type</label>
              <select
                value={formData.activityType}
                onChange={(e) => setFormData({ ...formData, activityType: e.target.value as ActivityType })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  border: `1px solid ${Colors.borderSoft}`,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: Colors.textDark,
                  backgroundColor: Colors.background,
                  marginTop: '4px'
                }}
              >
                {activities.map(act => <option key={act} value={act}>{act}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: Colors.textMedium }}>Estimated Hours</label>
              <input
                type="number"
                min={0.5}
                max={50}
                step={0.5}
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) || 1 })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  border: `1px solid ${Colors.borderSoft}`,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: Colors.textDark,
                  backgroundColor: Colors.background,
                  marginTop: '4px'
                }}
              />
            </div>
          </div>

          {/* Notes & Description Textarea */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: Colors.textMedium }}>Notes & Description</label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add assignment details, submission links, or focus goals..."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '12px',
                border: `1px solid ${Colors.borderSoft}`,
                fontSize: '13px',
                color: Colors.textDark,
                backgroundColor: Colors.background,
                marginTop: '4px',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* DEMAND INTENSITY RATING (1-5) matching Reference */}
          <div style={{
            backgroundColor: Colors.background,
            padding: '14px',
            borderRadius: '18px',
            border: `1px solid ${Colors.borderSoft}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#047857', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sliders size={16} color="#059669" /> Demand Intensity Rating (1-5)
              </span>
            </div>

            {/* Cognitive */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563EB', fontWeight: 600 }}>
                  <Brain size={13} /> Cognitive Load (Thinking)
                </span>
                <span style={{ fontWeight: 700, color: Colors.textDark }}>Level {formData.demandProfile.cognitive}/5</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={formData.demandProfile.cognitive}
                onChange={(e) => setFormData({
                  ...formData,
                  demandProfile: { ...formData.demandProfile, cognitive: parseInt(e.target.value) }
                })}
                style={{ width: '100%', accentColor: '#2563EB' }}
              />
            </div>

            {/* Emotional */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#E11D48', fontWeight: 600 }}>
                  <Heart size={13} /> Emotional Load (Feeling effort)
                </span>
                <span style={{ fontWeight: 700, color: Colors.textDark }}>Level {formData.demandProfile.emotional}/5</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={formData.demandProfile.emotional}
                onChange={(e) => setFormData({
                  ...formData,
                  demandProfile: { ...formData.demandProfile, emotional: parseInt(e.target.value) }
                })}
                style={{ width: '100%', accentColor: '#E11D48' }}
              />
            </div>

            {/* Physical */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600 }}>
                  <Activity size={13} /> Physical / Time Crunch
                </span>
                <span style={{ fontWeight: 700, color: Colors.textDark }}>Level {formData.demandProfile.physical}/5</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={formData.demandProfile.physical}
                onChange={(e) => setFormData({
                  ...formData,
                  demandProfile: { ...formData.demandProfile, physical: parseInt(e.target.value) }
                })}
                style={{ width: '100%', accentColor: '#059669' }}
              />
            </div>
          </div>

          {/* SUBTASKS BREAKDOWN SECTION (Matching Reference) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: Colors.textDark, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckSquare size={14} color="#059669" /> Subtasks Breakdown ({formData.subtasks.filter(s => s.completed).length}/{formData.subtasks.length})
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
              {formData.subtasks.map((st) => (
                <div
                  key={st.id}
                  onClick={() => handleToggleSubtask(st.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: st.completed ? '#F1F5F9' : Colors.background,
                    padding: '8px 12px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    border: `1px solid ${st.completed ? 'rgba(203, 213, 225, 0.7)' : Colors.borderSoft}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: st.completed ? 'none' : '1.5px solid #94A3B8',
                      backgroundColor: st.completed ? '#15803D' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      flexShrink: 0
                    }}>
                      {st.completed && <Check size={12} strokeWidth={3} />}
                    </div>
                    <span style={{
                      color: st.completed ? '#94A3B8' : Colors.textDark,
                      textDecoration: st.completed ? 'line-through' : 'none',
                      fontWeight: st.completed ? 500 : 600
                    }}>
                      {st.title}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSubtask(st.id);
                    }}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: '#94A3B8',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Subtask Input Row */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                placeholder="Add new subtask..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask(e);
                  }
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: `1px solid ${Colors.borderSoft}`,
                  fontSize: '12px',
                  outline: 'none',
                  backgroundColor: Colors.background
                }}
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                style={{
                  backgroundColor: '#F0FDF4',
                  color: '#15803D',
                  border: '1px solid rgba(187, 247, 208, 0.9)',
                  borderRadius: '10px',
                  padding: '0 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
            </div>
          </div>

          {/* NASA-TLX ASSESSMENT EXPANDABLE SECTION (Matching Reference) */}
          <div style={{ borderTop: `1px solid ${Colors.borderSoft}`, paddingTop: '12px' }}>
            <button
              type="button"
              onClick={() => setShowNasaTlx(!showNasaTlx)}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#F7EDFF',
                color: '#7B1FA2',
                border: '1.5px dashed #E7C6FF',
                borderRadius: '14px',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Calculator size={15} />
              {showNasaTlx ? 'Hide NASA-TLX Assessment' : 'Detailed NASA-TLX Workload Assessment'}
            </button>

            {showNasaTlx && (
              <div style={{
                marginTop: '12px',
                padding: '12px',
                backgroundColor: '#FAF5FF',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <span style={{ fontSize: '11px', color: '#7B1FA2', fontWeight: 600 }}>
                  Rate 6 TLX Dimensions (0-100% scale):
                </span>

                {(['mentalDemand', 'physicalDemand', 'temporalDemand', 'performance', 'effort', 'frustration'] as const).map(dim => (
                  <div key={dim}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', textTransform: 'capitalize' }}>
                      <span style={{ fontWeight: 600, color: Colors.textMedium }}>{dim.replace(/([A-Z])/g, ' $1')}</span>
                      <span style={{ fontWeight: 700, color: '#7B1FA2' }}>{nasaScores[dim]}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={nasaScores[dim]}
                      onChange={(e) => setNasaScores({ ...nasaScores, [dim]: parseInt(e.target.value) })}
                      style={{ width: '100%', accentColor: '#7B1FA2' }}
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleCalculateNasaTlx}
                  style={{
                    backgroundColor: '#7B1FA2',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '4px'
                  }}
                >
                  Save NASA-TLX Score
                </button>
              </div>
            )}

            {formData.nasaTlx && !showNasaTlx && (
              <div style={{
                marginTop: '8px',
                fontSize: '11px',
                color: '#7B1FA2',
                backgroundColor: '#F7EDFF',
                padding: '8px 12px',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 600
              }}>
                <span>Calculated NASA-TLX Score:</span>
                <span style={{ fontWeight: 800 }}>{formData.nasaTlx.overallScore} / 100</span>
              </div>
            )}
          </div>

          {/* Action Buttons: Delete (pink) & Save Changes (dark green) */}
          <div style={{ display: 'flex', gap: '10px', borderTop: `1px solid ${Colors.borderSoft}`, paddingTop: '14px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={handleDelete}
              style={{
                padding: '12px 18px',
                backgroundColor: '#FFEAEA',
                color: '#C62828',
                border: 'none',
                borderRadius: '16px',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Trash2 size={16} /> Delete
            </button>

            <button
              type="submit"
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#15803D',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '16px',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(21, 128, 61, 0.3)'
              }}
            >
              <Check size={16} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
