import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkloadArea, ActivityType, UrgencyLevel, FlexibilityLevel, SubTask, NasaTlxScore } from '../../types/workload';
import { Colors, AreaColors } from '../../theme/colors';
import { X, Calendar as CalendarIcon, Clock, Sliders, Brain, Heart, Activity, Plus, Check, CheckSquare, Calculator, Trash2 } from 'lucide-react';

export const AddWorkloadModal: React.FC = () => {
  const {
    isAddWorkloadOpen,
    setIsAddWorkloadOpen,
    addWorkload,
    addWorkloadInitialArea,
    addWorkloadInitialData,
    setAddWorkloadInitialData
  } = useApp();

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('2026-09-09');
  const [dueTime, setDueTime] = useState('20:00');
  const [area, setArea] = useState<WorkloadArea>(addWorkloadInitialArea || 'Academic');

  useEffect(() => {
    if (isAddWorkloadOpen) {
      if (addWorkloadInitialData) {
        setTitle(addWorkloadInitialData.title || '');
        setDueDate(addWorkloadInitialData.dueDate || '2026-09-09');
        setDueTime(addWorkloadInitialData.dueTime || '20:00');
        setArea(addWorkloadInitialData.area || 'Academic');
        setUrgency(addWorkloadInitialData.urgency || 'High');

        setActivityType(addWorkloadInitialData.activityType || 'Deep focus');
        setEstimatedHours(addWorkloadInitialData.estimatedHours || 3);
        setNotes(addWorkloadInitialData.notes || '');
        if (addWorkloadInitialData.cognitive) setCognitive(addWorkloadInitialData.cognitive);
        if (addWorkloadInitialData.emotional) setEmotional(addWorkloadInitialData.emotional);
        if (addWorkloadInitialData.physical) setPhysical(addWorkloadInitialData.physical);
      } else if (addWorkloadInitialArea) {
        setArea(addWorkloadInitialArea);
      }
    }
  }, [isAddWorkloadOpen, addWorkloadInitialData, addWorkloadInitialArea]);
  const [urgency, setUrgency] = useState<UrgencyLevel>('Medium');
  const [activityType, setActivityType] = useState<ActivityType>('Physical');
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [notes, setNotes] = useState('');
  const [cognitive, setCognitive] = useState(1);
  const [emotional, setEmotional] = useState(1);
  const [physical, setPhysical] = useState(2);

  // Subtasks State (Requirement 1 & Picture 1)
  const [subtasks, setSubtasks] = useState<SubTask[]>([
    { id: 'st-new-1', title: 'Light Warm Bath & Lavender Tea', completed: false },
    { id: 'st-new-2', title: '30 min Digital Detox Before Bed', completed: false }
  ]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // NASA-TLX State (Requirement 1 & Picture 1)
  const [showNasaTlx, setShowNasaTlx] = useState(false);
  const [nasaScores, setNasaScores] = useState<NasaTlxScore>({
    mentalDemand: 50,
    physicalDemand: 30,
    temporalDemand: 40,
    performance: 70,
    effort: 50,
    frustration: 30
  });
  const [savedNasaScore, setSavedNasaScore] = useState<number | null>(null);

  if (!isAddWorkloadOpen) return null;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      setSubtasks(prev => [
        ...prev,
        { id: `st-${Date.now()}`, title: newSubtaskTitle.trim(), completed: false }
      ]);
      setNewSubtaskTitle('');
    }
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(prev => prev.map(st => st.id === id ? { ...st, completed: !st.completed } : st));
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(st => st.id !== id));
  };

  const handleCalculateNasaTlx = () => {
    const total = nasaScores.mentalDemand + nasaScores.physicalDemand + nasaScores.temporalDemand +
      nasaScores.performance + nasaScores.effort + nasaScores.frustration;
    const avg = parseFloat((total / 6).toFixed(1));
    setSavedNasaScore(avg);
    setShowNasaTlx(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let deadlineIso = '2026-09-05T22:00:00';
    try {
      deadlineIso = new Date(`${dueDate}T${dueTime}:00`).toISOString();
    } catch {
      deadlineIso = new Date().toISOString();
    }
    const allDone = subtasks.length > 0 && subtasks.every(s => s.completed);

    const newWorkloadPayload = {
      title: title.trim(),
      area,
      activityType,
      deadline: deadlineIso,
      urgency,
      timeFlexibility: 'Moderate' as const,
      effortFlexibility: 'Moderate' as const,
      workloadType: 'Assignment' as const,
      timingType: 'Deadline' as const,
      importance: 'Medium' as const,
      schedulingCharacteristics: {
        splittable: true,
        spacingPreferred: true,
        source: 'workload-default' as const
      },
      estimatedHours: Number(estimatedHours) || 1,
      notes: notes.trim(),
      demandProfile: { cognitive, emotional, physical },
      perceivedStressImpact: Math.max(cognitive, emotional),
      subtasks,
      status: allDone ? ('Completed' as const) : ('Active' as const),
      nasaTlx: savedNasaScore !== null ? { ...nasaScores, overallScore: savedNasaScore } : undefined
    };

    addWorkload(newWorkloadPayload);

    if (addWorkloadInitialData?.onAddedSuccess) {
      addWorkloadInitialData.onAddedSuccess(newWorkloadPayload);
    }
    setAddWorkloadInitialData(null);

    // Reset fields
    setTitle('');
    setNotes('');
    setSubtasks([]);
    setUrgency('Medium' as const);
    setActivityType('Physical' as const);
    setSavedNasaScore(null);
    setIsAddWorkloadOpen(false);
  };

  const areas: WorkloadArea[] = ['Academic', 'Personal', 'Social', 'Self-Care'];
  const urgencies: UrgencyLevel[] = ['Low', 'Medium', 'High', 'Urgent'];
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
        {/* Modal Header matching Picture 2 */}
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
              Add & Rating Details
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              setAddWorkloadInitialData(null);
              setIsAddWorkloadOpen(false);
            }}
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Task Title */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: Colors.textMedium }}>Task Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Self-Care Night & Sleep Schedule Reset"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
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
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
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

          {/* Workload Area Selector (2x2 grid matching Picture 2) */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: Colors.textMedium }}>Workload Area</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
              {areas.map((a) => {
                const selected = area === a;
                const style = AreaColors[a];
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setArea(a)}
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

          {/* Urgency Level & Activity Type Side by Side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: Colors.textMedium }}>Urgency Level</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
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

          </div>

          {/* Activity Type & Estimated Hours Side by Side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: Colors.textMedium }}>Activity Type</label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as ActivityType)}
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
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 1)}
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
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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

          {/* DEMAND INTENSITY RATING (1-5) matching Picture 1 */}
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
                <span style={{ fontWeight: 700, color: Colors.textDark }}>Level {cognitive}/5</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={cognitive}
                onChange={(e) => setCognitive(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#2563EB' }}
              />
            </div>

            {/* Emotional */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#E11D48', fontWeight: 600 }}>
                  <Heart size={13} /> Emotional Load (Feeling effort)
                </span>
                <span style={{ fontWeight: 700, color: Colors.textDark }}>Level {emotional}/5</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={emotional}
                onChange={(e) => setEmotional(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#E11D48' }}
              />
            </div>

            {/* Physical */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600 }}>
                  <Activity size={13} /> Physical / Time Crunch
                </span>
                <span style={{ fontWeight: 700, color: Colors.textDark }}>Level {physical}/5</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={physical}
                onChange={(e) => setPhysical(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#059669' }}
              />
            </div>
          </div>

          {/* SUBTASKS BREAKDOWN SECTION (Requirement 1 & Picture 1) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: Colors.textDark, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckSquare size={14} color="#059669" /> Subtasks Breakdown ({subtasks.filter(s => s.completed).length}/{subtasks.length})
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
              {subtasks.map((st) => (
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

          {/* NASA-TLX ASSESSMENT EXPANDABLE SECTION (Requirement 1 & Picture 1) */}
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

            {savedNasaScore !== null && !showNasaTlx && (
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
                <span style={{ fontWeight: 800 }}>{savedNasaScore} / 100</span>
              </div>
            )}
          </div>

          {/* Action Buttons matching Picture 1: Cancel / Delete (pink) & Save Changes (dark green) */}
          <div style={{ display: 'flex', gap: '10px', borderTop: `1px solid ${Colors.borderSoft}`, paddingTop: '14px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => {
                setAddWorkloadInitialData(null);
                setIsAddWorkloadOpen(false);
              }}
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
              <Trash2 size={16} /> Cancel
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
              <Check size={16} /> Save & Add to Calendar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
