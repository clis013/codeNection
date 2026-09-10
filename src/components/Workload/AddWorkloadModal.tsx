import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkloadArea, ActivityType, UrgencyLevel, FlexibilityLevel, SubTask, NasaTlxScore } from '../../types/workload';
import { Colors, AreaColors } from '../../theme/colors';
import { X, Calendar as CalendarIcon, Clock, Sliders, Brain, Heart, Activity, Check, CheckSquare, Calculator, Trash2, Sparkles, Bot, AlertCircle } from 'lucide-react';

export function estimateWorkloadDetails(
  title: string,
  dueDate: string,
  dueTime: string,
  flexibility: FlexibilityLevel
) {
  const lower = title.toLowerCase().trim();

  // 1. Area
  let area: WorkloadArea = 'Academic';
  if (
    lower.includes('exam') || lower.includes('quiz') || lower.includes('test') ||
    lower.includes('assignment') || lower.includes('study') || lower.includes('read') ||
    lower.includes('lecture') || lower.includes('project') || lower.includes('lab') ||
    lower.includes('report') || lower.includes('homework') || lower.includes('code') ||
    lower.includes('programming') || lower.includes('essay') || lower.includes('paper') ||
    lower.includes('math') || lower.includes('thesis') || lower.includes('os') || lower.includes('web')
  ) {
    area = 'Academic';
  } else if (
    lower.includes('sleep') || lower.includes('bath') || lower.includes('meditat') ||
    lower.includes('gym') || lower.includes('workout') || lower.includes('run') ||
    lower.includes('walk') || lower.includes('exercise') || lower.includes('health') ||
    lower.includes('relax') || lower.includes('rest') || lower.includes('therapy') ||
    lower.includes('skincare') || lower.includes('self-care') || lower.includes('yoga')
  ) {
    area = 'Self-Care';
  } else if (
    lower.includes('party') || lower.includes('dinner') || lower.includes('lunch') ||
    lower.includes('friend') || lower.includes('meetup') || lower.includes('hangout') ||
    lower.includes('club') || lower.includes('event') || lower.includes('social') ||
    lower.includes('birthday') || lower.includes('gathering') || lower.includes('call') ||
    lower.includes('chat') || lower.includes('date') || lower.includes('sponsorship')
  ) {
    area = 'Social';
  } else {
    area = 'Personal';
  }

  // 2. Urgency
  let urgency: UrgencyLevel = 'Medium';
  let hoursRemaining = 72;
  try {
    const targetMs = new Date(`${dueDate}T${dueTime}:00`).getTime();
    const nowMs = Date.now();
    hoursRemaining = Math.max(0, (targetMs - nowMs) / (1000 * 60 * 60));
  } catch {
    hoursRemaining = 72;
  }

  if (hoursRemaining <= 24 || flexibility === 'Strict') {
    urgency = hoursRemaining <= 12 ? 'Urgent' : 'High';
  } else if (hoursRemaining <= 72) {
    urgency = flexibility === 'Moderate' ? 'High' : 'Medium';
  } else if (hoursRemaining <= 168) {
    urgency = 'Medium';
  } else {
    urgency = 'Low';
  }

  // 3. Activity Type
  let activityType: ActivityType = 'Deep focus';
  if (
    lower.includes('meet') || lower.includes('call') || lower.includes('talk') ||
    lower.includes('discuss') || lower.includes('chat') || lower.includes('presentation') ||
    lower.includes('interview') || lower.includes('pitch') || lower.includes('sponsor')
  ) {
    activityType = 'Communication';
  } else if (
    lower.includes('design') || lower.includes('draw') || lower.includes('art') ||
    lower.includes('video') || lower.includes('creative') || lower.includes('music') ||
    lower.includes('write') || lower.includes('reflection') || lower.includes('brainstorm')
  ) {
    activityType = 'Creative';
  } else if (
    lower.includes('gym') || lower.includes('run') || lower.includes('walk') ||
    lower.includes('sport') || lower.includes('clean') || lower.includes('laundry') ||
    lower.includes('cook') || lower.includes('workout') || lower.includes('pack')
  ) {
    activityType = 'Physical';
  } else if (
    lower.includes('email') || lower.includes('form') || lower.includes('register') ||
    lower.includes('submit') || lower.includes('bill') || lower.includes('schedule') ||
    lower.includes('organize')
  ) {
    activityType = 'Administrative';
  } else {
    activityType = area === 'Academic' ? 'Deep focus' : (area === 'Self-Care' ? 'Physical' : 'Administrative');
  }

  // 4. Estimated Hours
  let estimatedHours = 2;
  if (lower.includes('quick') || lower.includes('reply') || lower.includes('check') || lower.includes('email')) {
    estimatedHours = 1;
  } else if (lower.includes('exam') || lower.includes('project') || lower.includes('assignment') || lower.includes('sponsorship')) {
    estimatedHours = flexibility === 'Strict' ? 4 : 3;
  } else if (area === 'Self-Care') {
    estimatedHours = 1.5;
  } else {
    estimatedHours = 2.5;
  }

  // 5. Demands (Cognitive, Emotional, Physical)
  let cognitive = 2;
  let emotional = 2;
  let physical = 1;
  if (area === 'Academic' || activityType === 'Deep focus') {
    cognitive = 4;
    emotional = flexibility === 'Strict' ? 3 : 2;
    physical = 1;
  } else if (area === 'Self-Care') {
    cognitive = 1;
    emotional = 1;
    physical = activityType === 'Physical' ? 3 : 1;
  } else if (area === 'Social') {
    cognitive = 2;
    emotional = 3;
    physical = 2;
  } else {
    cognitive = 3;
    emotional = 2;
    physical = 2;
  }
  if (urgency === 'Urgent') {
    cognitive = Math.min(5, cognitive + 1);
    emotional = Math.min(5, emotional + 1);
  }

  // 6. Subtasks
  const displayTitle = title.trim() || 'Task';
  const subtasks: SubTask[] = [];
  if (area === 'Academic') {
    subtasks.push({ id: `st-${Date.now()}-1`, title: `Review syllabus & materials for ${displayTitle}`, completed: false });
    subtasks.push({ id: `st-${Date.now()}-2`, title: `Draft core solutions & final check`, completed: false });
  } else if (area === 'Self-Care') {
    subtasks.push({ id: `st-${Date.now()}-1`, title: `Block quiet time & turn off notifications`, completed: false });
    subtasks.push({ id: `st-${Date.now()}-2`, title: `Complete restful routine without rushing`, completed: false });
  } else if (area === 'Social') {
    subtasks.push({ id: `st-${Date.now()}-1`, title: `Confirm schedule & prep for ${displayTitle}`, completed: false });
    subtasks.push({ id: `st-${Date.now()}-2`, title: `Attend and connect with people`, completed: false });
  } else {
    subtasks.push({ id: `st-${Date.now()}-1`, title: `Organize setup and start ${displayTitle}`, completed: false });
    subtasks.push({ id: `st-${Date.now()}-2`, title: `Review progress & wrap up`, completed: false });
  }

  // 7. Notes
  const notes = `🤖 Squirrel AI Note: Auto-structured for ${flexibility.toLowerCase()} flexibility. Target completion in ~${estimatedHours}h before ${dueDate}.`;

  return { area, urgency, activityType, estimatedHours, demandProfile: { cognitive, emotional, physical }, subtasks, notes };
}

export const AddWorkloadModal: React.FC = () => {
  const {
    isAddWorkloadOpen,
    setIsAddWorkloadOpen,
    addWorkload,
    addWorkloadInitialArea,
    addWorkloadInitialData,
    setAddWorkloadInitialData
  } = useApp();

  // Mandatory Form Fields
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('2026-09-12');
  const [dueTime, setDueTime] = useState('20:00');
  const [flexibility, setFlexibility] = useState<FlexibilityLevel>('Moderate');
  const [formError, setFormError] = useState<string | null>(null);

  // Optional Fields (can be estimated by AI if user doesn't fill them in)
  const [area, setArea] = useState<WorkloadArea>(addWorkloadInitialArea || 'Academic');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Medium');
  const [activityType, setActivityType] = useState<ActivityType>('Deep focus');
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [notes, setNotes] = useState('');
  const [cognitive, setCognitive] = useState(3);
  const [emotional, setEmotional] = useState(2);
  const [physical, setPhysical] = useState(1);

  // Track which optional fields the user has manually touched
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [aiAutoFilled, setAiAutoFilled] = useState(false);

  // Subtasks State
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // NASA-TLX State
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

  useEffect(() => {
    if (isAddWorkloadOpen) {
      if (addWorkloadInitialData) {
        setTitle(addWorkloadInitialData.title || '');
        setDueDate(addWorkloadInitialData.dueDate || '2026-09-12');
        setDueTime(addWorkloadInitialData.dueTime || '20:00');
        setFlexibility(addWorkloadInitialData.flexibility || 'Moderate');
        if (addWorkloadInitialData.area) {
          setArea(addWorkloadInitialData.area);
          setTouchedFields(prev => ({ ...prev, area: true }));
        }
        if (addWorkloadInitialData.urgency) {
          setUrgency(addWorkloadInitialData.urgency);
          setTouchedFields(prev => ({ ...prev, urgency: true }));
        }
        if (addWorkloadInitialData.activityType) {
          setActivityType(addWorkloadInitialData.activityType);
          setTouchedFields(prev => ({ ...prev, activityType: true }));
        }
        if (addWorkloadInitialData.estimatedHours) {
          setEstimatedHours(addWorkloadInitialData.estimatedHours);
          setTouchedFields(prev => ({ ...prev, estimatedHours: true }));
        }
        if (addWorkloadInitialData.notes) {
          setNotes(addWorkloadInitialData.notes);
          setTouchedFields(prev => ({ ...prev, notes: true }));
        }
        if (addWorkloadInitialData.cognitive) setCognitive(addWorkloadInitialData.cognitive);
        if (addWorkloadInitialData.emotional) setEmotional(addWorkloadInitialData.emotional);
        if (addWorkloadInitialData.physical) setPhysical(addWorkloadInitialData.physical);
        if (addWorkloadInitialData.subtasks && addWorkloadInitialData.subtasks.length > 0) {
          setSubtasks(addWorkloadInitialData.subtasks);
          setTouchedFields(prev => ({ ...prev, subtasks: true }));
        }
      } else if (addWorkloadInitialArea) {
        setArea(addWorkloadInitialArea);
        setTouchedFields(prev => ({ ...prev, area: true }));
      }
    }
  }, [isAddWorkloadOpen, addWorkloadInitialData, addWorkloadInitialArea]);

  if (!isAddWorkloadOpen) return null;

  // Live AI Prediction based on mandatory fields
  const aiPrediction = estimateWorkloadDetails(title, dueDate, dueTime, flexibility);

  const handleApplyAiEstimates = () => {
    setArea(aiPrediction.area);
    setUrgency(aiPrediction.urgency);
    setActivityType(aiPrediction.activityType);
    setEstimatedHours(aiPrediction.estimatedHours);
    setCognitive(aiPrediction.demandProfile.cognitive);
    setEmotional(aiPrediction.demandProfile.emotional);
    setPhysical(aiPrediction.demandProfile.physical);
    if (subtasks.length === 0) {
      setSubtasks(aiPrediction.subtasks);
    }
    if (!notes.trim()) {
      setNotes(aiPrediction.notes);
    }
    setAiAutoFilled(true);
    setTouchedFields({
      area: true,
      urgency: true,
      activityType: true,
      estimatedHours: true,
      demands: true,
      subtasks: true,
      notes: true
    });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      setSubtasks(prev => [
        ...prev,
        { id: `st-${Date.now()}`, title: newSubtaskTitle.trim(), completed: false }
      ]);
      setNewSubtaskTitle('');
      setTouchedFields(prev => ({ ...prev, subtasks: true }));
    }
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(prev => prev.map(st => st.id === id ? { ...st, completed: !st.completed } : st));
    setTouchedFields(prev => ({ ...prev, subtasks: true }));
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(st => st.id !== id));
    setTouchedFields(prev => ({ ...prev, subtasks: true }));
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
    setFormError(null);

    // Strict validation on 3 mandatory fields:
    if (!title.trim()) {
      setFormError('Please enter a Task Name to continue.');
      return;
    }
    if (!dueDate || !dueTime) {
      setFormError('Please enter a valid Deadline (Date & Time).');
      return;
    }
    if (!flexibility) {
      setFormError('Please select task Flexibility (Strict, Moderate, or Flexible).');
      return;
    }

    let deadlineIso = '2026-09-12T20:00:00';
    try {
      deadlineIso = new Date(`${dueDate}T${dueTime}:00`).toISOString();
    } catch {
      deadlineIso = new Date().toISOString();
    }

    // Determine final values: Use touched field if user customized, else AI estimated!
    const finalArea = touchedFields.area ? area : aiPrediction.area;
    const finalUrgency = touchedFields.urgency ? urgency : aiPrediction.urgency;
    const finalActivity = touchedFields.activityType ? activityType : aiPrediction.activityType;
    const finalHours = touchedFields.estimatedHours ? Number(estimatedHours) || 1 : aiPrediction.estimatedHours;
    const finalDemands = touchedFields.demands
      ? { cognitive, emotional, physical }
      : aiPrediction.demandProfile;
    const finalSubtasks = subtasks.length > 0 ? subtasks : aiPrediction.subtasks;
    const finalNotes = notes.trim().length > 0 ? notes.trim() : aiPrediction.notes;

    const allDone = finalSubtasks.length > 0 && finalSubtasks.every(s => s.completed);

    const newWorkloadPayload = {
      title: title.trim(),
      area: finalArea,
      activityType: finalActivity,
      deadline: deadlineIso,
      urgency: finalUrgency,
      flexibility,
      timeFlexibility: flexibility,
      effortFlexibility: flexibility,
      estimatedHours: finalHours,
      remainingTimeHours: finalHours,
      notes: finalNotes,
      demandProfile: finalDemands,
      perceivedStressImpact: Math.max(finalDemands.cognitive, finalDemands.emotional),
      subtasks: finalSubtasks,
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
    setCognitive(3);
    setEmotional(2);
    setPhysical(1);
    setSavedNasaScore(null);
    setTouchedFields({});
    setAiAutoFilled(false);
    setFormError(null);
    setIsAddWorkloadOpen(false);
  };

  const areas: WorkloadArea[] = ['Academic', 'Personal', 'Social', 'Self-Care'];
  const urgencies: UrgencyLevel[] = ['Low', 'Medium', 'High', 'Urgent'];
  const flexibilities: { level: FlexibilityLevel; label: string; desc: string; color: string; bg: string; border: string }[] = [
    { level: 'Strict', label: 'Strict', desc: 'Fixed deadline, cannot delay', color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' },
    { level: 'Moderate', label: 'Moderate', desc: '±1–2 days flexibility', color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' },
    { level: 'Flexible', label: 'Flexible', desc: 'High flexibility, easy to move', color: '#15803D', bg: '#F0FDF4', border: '#86EFAC' }
  ];
  const activities: ActivityType[] = ['Deep focus', 'Communication', 'Creative', 'Physical', 'Administrative'];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(44, 62, 80, 0.48)',
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
        maxWidth: '393px',
        maxHeight: '88vh',
        overflowY: 'auto',
        padding: '20px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.22)',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        border: `1px solid ${Colors.skyBlue}`
      }}>
        {/* Modal Header */}
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
              fontWeight: 800,
              color: '#059669',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Bot size={14} color="#059669" /> AI-Assisted Workload Setup
            </span>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: Colors.textDark, marginTop: '2px' }}>
              Add New Workload
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

        {/* Error Notice */}
        {formError && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '12px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            fontWeight: 700,
            color: '#B91C1C'
          }}>
            <AlertCircle size={15} color="#DC2626" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* ═══════════════════════════════════════════════════════════════════════════ */}
          {/* SECTION 1: MANDATORY DETAILS (User MUST fill in Task Name, Deadline, Flexibility) */}
          {/* ═══════════════════════════════════════════════════════════════════════════ */}
          <div style={{
            backgroundColor: '#F8FAFC',
            padding: '14px',
            borderRadius: '16px',
            border: '1.5px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Required Fields (Must Fill In)
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#DC2626',
                backgroundColor: '#FEE2E2',
                padding: '2px 6px',
                borderRadius: '6px'
              }}>
                * 3 Required
              </span>
            </div>

            {/* 1. Task Title (Required) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: Colors.textDark }}>
                  1. Task Name <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600 }}>Required</span>
              </div>
              <input
                type="text"
                required
                placeholder="e.g. Operating Systems Quiz Revision, Web Project, Gym..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (formError) setFormError(null);
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: !title.trim() && formError ? '1.5px solid #EF4444' : `1px solid ${Colors.borderSoft}`,
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: Colors.textDark,
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
              />
            </div>

            {/* 2. Deadline Date & Time (Required) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: Colors.textDark }}>
                  2. Deadline <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600 }}>Required</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#059669', fontWeight: 600, marginBottom: '2px' }}>
                    <CalendarIcon size={12} /> Due Date
                  </div>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => {
                      setDueDate(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: `1px solid ${Colors.borderSoft}`,
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: Colors.textDark,
                      backgroundColor: '#FFFFFF',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#C2410C', fontWeight: 600, marginBottom: '2px' }}>
                    <Clock size={12} /> Due Time
                  </div>
                  <input
                    type="time"
                    required
                    value={dueTime}
                    onChange={(e) => {
                      setDueTime(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: `1px solid ${Colors.borderSoft}`,
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: Colors.textDark,
                      backgroundColor: '#FFFFFF',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 3. Flexibility (Required) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: Colors.textDark }}>
                  3. Flexibility <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600 }}>Required</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                {flexibilities.map(f => {
                  const selected = flexibility === f.level;
                  return (
                    <button
                      key={f.level}
                      type="button"
                      onClick={() => {
                        setFlexibility(f.level);
                        if (formError) setFormError(null);
                      }}
                      style={{
                        padding: '8px 4px',
                        borderRadius: '12px',
                        border: selected ? `2px solid ${f.color}` : `1px solid ${Colors.borderSoft}`,
                        backgroundColor: selected ? f.bg : '#FFFFFF',
                        color: selected ? f.color : Colors.textMedium,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        transition: 'all 0.15s ease',
                        boxShadow: selected ? `0 2px 8px ${f.color}25` : 'none'
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 800 }}>{f.label}</span>
                      <span style={{ fontSize: '8.5px', color: selected ? f.color : '#94A3B8', fontWeight: 600, textAlign: 'center', lineHeight: 1.1 }}>
                        {f.level === 'Strict' ? 'Non-flexible' : f.level === 'Moderate' ? '±1–2 days' : 'Easy move'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════════════ */}
          {/* SECTION 2: SQUIRREL AI AUTO-ESTIMATION ASSISTANT BANNER                     */}
          {/* ═══════════════════════════════════════════════════════════════════════════ */}
          <div style={{
            background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
            border: '1.5px solid #A7F3D0',
            borderRadius: '16px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 2px 10px rgba(16, 185, 129, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#047857', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={14} color="#059669" />
                Squirrel AI Auto-Estimation
              </span>
              <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#065F46', backgroundColor: '#D1FAE5', padding: '2px 7px', borderRadius: '10px' }}>
                AI Ready
              </span>
            </div>

            <p style={{ fontSize: '11px', color: '#065F46', margin: 0, lineHeight: 1.35 }}>
              Leave the details below unfilled and Squirrel AI will automatically estimate the optimal <strong>Area</strong>, <strong>Urgency</strong>, <strong>Hours</strong>, <strong>Demand Intensity</strong>, and <strong>Subtasks</strong> based on your task name and deadline!
            </p>

            {/* Live AI Estimation Pills */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '5px',
              backgroundColor: 'rgba(255,255,255,0.85)',
              padding: '6px 8px',
              borderRadius: '10px',
              border: '1px solid #D1FAE5'
            }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#166534' }}>
                Predicted:
              </span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#1E40AF', backgroundColor: '#EFF6FF', padding: '1px 5px', borderRadius: '6px' }}>
                {aiPrediction.area}
              </span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#92400E', backgroundColor: '#FEF3C7', padding: '1px 5px', borderRadius: '6px' }}>
                {aiPrediction.urgency} Urgency
              </span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#6D28D9', backgroundColor: '#F5F3FF', padding: '1px 5px', borderRadius: '6px' }}>
                {aiPrediction.activityType}
              </span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#047857', backgroundColor: '#ECFDF5', padding: '1px 5px', borderRadius: '6px' }}>
                ~{aiPrediction.estimatedHours}h
              </span>
            </div>

            <button
              type="button"
              onClick={handleApplyAiEstimates}
              style={{
                backgroundColor: aiAutoFilled ? '#15803D' : '#059669',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '7px 12px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
            >
              <Sparkles size={13} />
              {aiAutoFilled ? '✨ AI Details Applied (You can tweak below)' : '✨ Auto-Fill Form with AI Estimates'}
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════════════ */}
          {/* SECTION 3: OPTIONAL / AI-ESTIMATED DETAILS                                */}
          {/* ═══════════════════════════════════════════════════════════════════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Workload Area Selector */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: Colors.textMedium }}>Workload Area</label>
                <span style={{ fontSize: '10px', color: touchedFields.area ? '#2563EB' : '#059669', fontWeight: 600 }}>
                  {touchedFields.area ? 'Customized' : '🤖 AI Estimated'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {areas.map((a) => {
                  const selected = (touchedFields.area ? area : aiPrediction.area) === a;
                  const style = AreaColors[a];
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => {
                        setArea(a);
                        setTouchedFields(prev => ({ ...prev, area: true }));
                      }}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: Colors.textMedium }}>Urgency Level</label>
                  <span style={{ fontSize: '9.5px', color: touchedFields.urgency ? '#2563EB' : '#059669', fontWeight: 600 }}>
                    {touchedFields.urgency ? 'Manual' : '🤖 AI'}
                  </span>
                </div>
                <select
                  value={touchedFields.urgency ? urgency : aiPrediction.urgency}
                  onChange={(e) => {
                    setUrgency(e.target.value as UrgencyLevel);
                    setTouchedFields(prev => ({ ...prev, urgency: true }));
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '12px',
                    border: `1px solid ${Colors.borderSoft}`,
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: Colors.textDark,
                    backgroundColor: Colors.background,
                    outline: 'none'
                  }}
                >
                  {urgencies.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: Colors.textMedium }}>Activity Type</label>
                  <span style={{ fontSize: '9.5px', color: touchedFields.activityType ? '#2563EB' : '#059669', fontWeight: 600 }}>
                    {touchedFields.activityType ? 'Manual' : '🤖 AI'}
                  </span>
                </div>
                <select
                  value={touchedFields.activityType ? activityType : aiPrediction.activityType}
                  onChange={(e) => {
                    setActivityType(e.target.value as ActivityType);
                    setTouchedFields(prev => ({ ...prev, activityType: true }));
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '12px',
                    border: `1px solid ${Colors.borderSoft}`,
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: Colors.textDark,
                    backgroundColor: Colors.background,
                    outline: 'none'
                  }}
                >
                  {activities.map(act => <option key={act} value={act}>{act}</option>)}
                </select>
              </div>
            </div>

            {/* Estimated Hours */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: Colors.textMedium }}>Estimated Hours</label>
                <span style={{ fontSize: '9.5px', color: touchedFields.estimatedHours ? '#2563EB' : '#059669', fontWeight: 600 }}>
                  {touchedFields.estimatedHours ? 'Manual' : '🤖 AI'}
                </span>
              </div>
              <input
                type="number"
                min={0.5}
                max={50}
                step={0.5}
                value={touchedFields.estimatedHours ? estimatedHours : aiPrediction.estimatedHours}
                onChange={(e) => {
                  setEstimatedHours(parseFloat(e.target.value) || 1);
                  setTouchedFields(prev => ({ ...prev, estimatedHours: true }));
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
                  outline: 'none'
                }}
              />
            </div>

            {/* Notes & Description */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: Colors.textMedium }}>Notes & Description</label>
                <span style={{ fontSize: '9.5px', color: touchedFields.notes ? '#2563EB' : '#059669', fontWeight: 600 }}>
                  {touchedFields.notes ? 'Manual' : '🤖 AI (if empty)'}
                </span>
              </div>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setTouchedFields(prev => ({ ...prev, notes: true }));
                }}
                placeholder={aiPrediction.notes}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  border: `1px solid ${Colors.borderSoft}`,
                  fontSize: '12.5px',
                  color: Colors.textDark,
                  backgroundColor: Colors.background,
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Demand Intensity Rating (1-5) */}
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
                <span style={{ fontSize: '10px', color: touchedFields.demands ? '#2563EB' : '#059669', fontWeight: 600 }}>
                  {touchedFields.demands ? 'Manual' : '🤖 AI Estimated'}
                </span>
              </div>

              {/* Cognitive */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563EB', fontWeight: 600 }}>
                    <Brain size={13} /> Cognitive Load (Thinking)
                  </span>
                  <span style={{ fontWeight: 700, color: Colors.textDark }}>
                    Level {touchedFields.demands ? cognitive : aiPrediction.demandProfile.cognitive}/5
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={touchedFields.demands ? cognitive : aiPrediction.demandProfile.cognitive}
                  onChange={(e) => {
                    setCognitive(parseInt(e.target.value));
                    setTouchedFields(prev => ({ ...prev, demands: true }));
                  }}
                  style={{ width: '100%', accentColor: '#2563EB' }}
                />
              </div>

              {/* Emotional */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#E11D48', fontWeight: 600 }}>
                    <Heart size={13} /> Emotional Load (Feeling effort)
                  </span>
                  <span style={{ fontWeight: 700, color: Colors.textDark }}>
                    Level {touchedFields.demands ? emotional : aiPrediction.demandProfile.emotional}/5
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={touchedFields.demands ? emotional : aiPrediction.demandProfile.emotional}
                  onChange={(e) => {
                    setEmotional(parseInt(e.target.value));
                    setTouchedFields(prev => ({ ...prev, demands: true }));
                  }}
                  style={{ width: '100%', accentColor: '#E11D48' }}
                />
              </div>

              {/* Physical */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600 }}>
                    <Activity size={13} /> Physical / Time Crunch
                  </span>
                  <span style={{ fontWeight: 700, color: Colors.textDark }}>
                    Level {touchedFields.demands ? physical : aiPrediction.demandProfile.physical}/5
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={touchedFields.demands ? physical : aiPrediction.demandProfile.physical}
                  onChange={(e) => {
                    setPhysical(parseInt(e.target.value));
                    setTouchedFields(prev => ({ ...prev, demands: true }));
                  }}
                  style={{ width: '100%', accentColor: '#059669' }}
                />
              </div>
            </div>

            {/* Subtasks Breakdown Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: Colors.textDark, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckSquare size={14} color="#059669" /> Subtasks Breakdown ({subtasks.filter(s => s.completed).length}/{subtasks.length > 0 ? subtasks.length : `${aiPrediction.subtasks.length} (AI)`})
                </label>
                <span style={{ fontSize: '10px', color: subtasks.length > 0 ? '#2563EB' : '#059669', fontWeight: 600 }}>
                  {subtasks.length > 0 ? 'Custom List' : '🤖 AI Generated on Save'}
                </span>
              </div>

              {subtasks.length > 0 ? (
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
              ) : (
                <div style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px dashed #CBD5E1',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  marginBottom: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>
                    🤖 AI Auto-Generated subtasks on save:
                  </div>
                  {aiPrediction.subtasks.map((st, i) => (
                    <div key={i} style={{ fontSize: '11.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#059669' }} />
                      <span>{st.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Subtask Input Row */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Add your own subtask..."
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

            {/* NASA-TLX Assessment (Optional) */}
            <div style={{ borderTop: `1px solid ${Colors.borderSoft}`, paddingTop: '10px' }}>
              <button
                type="button"
                onClick={() => setShowNasaTlx(!showNasaTlx)}
                style={{
                  width: '100%',
                  padding: '9px',
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
                <Calculator size={14} />
                {showNasaTlx ? 'Hide NASA-TLX Assessment' : 'Optional: Assess Workload with NASA-TLX'}
              </button>

              {showNasaTlx && (
                <div style={{
                  marginTop: '10px',
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
          </div>

          {/* Action Buttons */}
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
              <Check size={16} /> Save & Grow Apple on Tree
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
