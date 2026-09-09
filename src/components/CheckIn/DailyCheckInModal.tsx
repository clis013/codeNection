import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Colors } from '../../theme/colors';
import { CartoonEmoji } from '../Common/CartoonEmoji';
import {
  X, ArrowLeft, ArrowRight, AlertCircle, Check, CheckCircle, Activity, RefreshCw, Home,
  TrendingUp, TrendingDown, Battery, Shield, Zap, Sparkles, Compass
} from 'lucide-react';
import { getTodayLocalDate } from '../../utils/dateHelpers';

export const DailyCheckInModal: React.FC = () => {
  const {
    isCheckInOpen,
    setIsCheckInOpen,
    saveCheckIn,
    todayCheckIn,
    calculatePss,
    calculateBaselineDiff,
    baselineStressAverage,
    baselineEnergyAverage,
    baselineControlAverage,
    baselineMentalDemandAverage,
    baselineCopingConfidenceAverage,
    hasBaseline,
    isRetestRequested,
    setIsRetestRequested,
    checkIns
  } = useApp();

  // Show snapshot view if already checked in or just finished
  const [showSnapshot, setShowSnapshot] = useState<boolean>(false);
  const [snapshotTab, setSnapshotTab] = useState<'today' | 'trends'>('today');
  const [step, setStep] = useState<number>(1);
  const [q1Stress, setQ1Stress] = useState<number | null>(null);
  const [q2Control, setQ2Control] = useState<number | null>(null);
  const [q3Demand, setQ3Demand] = useState<number | null>(null);
  const [q4Capability, setQ4Capability] = useState<number | null>(null);
  const [q5Energy, setQ5Energy] = useState<number | null>(null);
  const [q6Feeling, setQ6Feeling] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  useEffect(() => {
    if (isCheckInOpen) {
      if (todayCheckIn && !isRetestRequested) {
        setShowSnapshot(true);
      } else {
        setShowSnapshot(false);
        setStep(1);
      }
    }
  }, [isCheckInOpen, todayCheckIn, isRetestRequested]);

  if (!isCheckInOpen) return null;

  const resetForm = () => {
    setStep(1);
    setQ1Stress(null);
    setQ2Control(null);
    setQ3Demand(null);
    setQ4Capability(null);
    setQ5Energy(null);
    setQ6Feeling(null);
    setShowExitConfirm(false);
    setShowSnapshot(false);
    setIsRetestRequested(false);
  };

  const handleRetest = () => {
    setIsRetestRequested(true);
    setShowSnapshot(false);
    setStep(1);
    setQ1Stress(null);
    setQ2Control(null);
    setQ3Demand(null);
    setQ4Capability(null);
    setQ5Energy(null);
    setQ6Feeling(null);
  };

  const handleFinishAndSave = (chosenFeeling?: string) => {
    const s1 = q1Stress ?? 3;
    const s2 = q2Control ?? 3;
    const s3 = q3Demand ?? 3;
    const s4 = q4Capability ?? 3;
    const s5 = q5Energy ?? 3;
    const feeling = chosenFeeling || q6Feeling || 'All Good';

    // PSS formula: Q1 + (6 - Q2) + Q3 + (6 - Q4)
    const pssCalc = calculatePss(s1, s2, s3, s4);

    // Baseline comparison: null when fewer than 30 prior records exist
    const baseCalc = calculateBaselineDiff(pssCalc.score);

    saveCheckIn({
      // Use real local calendar date — NOT hardcoded
      date: getTodayLocalDate(),
      createdAt: new Date().toISOString(),

      // Raw question answers (stored for reproducibility)
      q1_stress: s1,
      q2_control: s2,
      q3_mentalDemand: s3,
      q4_capability: s4,
      energyLevel: s5,
      emotionFeeling: feeling,

      // Derived at save time
      pssScore: pssCalc.score,
      category: pssCalc.category,
      snapshotInterpretation: pssCalc.interpretation,

      // Aliases for view compatibility
      controlScore: s2,
      mentalDemandScore: s3,
      copingCapabilityScore: s4,

      // Baseline fields — only present when hasBaseline is true
      ...(baseCalc !== null ? {
        baselineDiff: baseCalc.diff,
        baselineCategory: baseCalc.category,
        baselineInterpretation: baseCalc.interpretation
      } : {})
    });

    setIsRetestRequested(false);
    setShowSnapshot(true);
  };

  const handleQuickFillNicoleDemo = () => {
    setQ1Stress(5);
    setQ2Control(2);
    setQ3Demand(5);
    setQ4Capability(2);
    setQ5Energy(1);
    setQ6Feeling('Overwhelmed');

    const pssCalc = calculatePss(5, 2, 5, 2);
    const baseCalc = calculateBaselineDiff(pssCalc.score);

    saveCheckIn({
      date: getTodayLocalDate(),
      createdAt: '2026-09-08T22:15:00+08:00',
      q1_stress: 5,
      q2_control: 2,
      q3_mentalDemand: 5,
      q4_capability: 2,
      energyLevel: 1,
      emotionFeeling: 'Overwhelmed',
      pssScore: pssCalc.score,
      category: pssCalc.category,
      snapshotInterpretation: pssCalc.interpretation,
      controlScore: 2,
      mentalDemandScore: 5,
      copingCapabilityScore: 2,
      ...(baseCalc !== null ? {
        baselineDiff: baseCalc.diff,
        baselineCategory: baseCalc.category,
        baselineInterpretation: baseCalc.interpretation
      } : {})
    });

    setIsRetestRequested(false);
    setShowSnapshot(true);
  };

  // Auto-advance handlers: advance to next page as soon as all questions on current step are filled
  const onSelectQ1 = (val: number) => {
    setQ1Stress(val);
    if (q2Control !== null && q3Demand !== null) {
      setTimeout(() => setStep(2), 220);
    }
  };

  const onSelectQ2 = (val: number) => {
    setQ2Control(val);
    if (q1Stress !== null && q3Demand !== null) {
      setTimeout(() => setStep(2), 220);
    }
  };

  const onSelectQ3 = (val: number) => {
    setQ3Demand(val);
    if (q1Stress !== null && q2Control !== null) {
      setTimeout(() => setStep(2), 220);
    }
  };

  const onSelectQ4 = (val: number) => {
    setQ4Capability(val);
    if (q5Energy !== null) {
      setTimeout(() => setStep(3), 220);
    }
  };

  const onSelectQ5 = (val: number) => {
    setQ5Energy(val);
    if (q4Capability !== null) {
      setTimeout(() => setStep(3), 220);
    }
  };

  const onSelectQ6 = (feeling: string) => {
    setQ6Feeling(feeling);
    setTimeout(() => {
      handleFinishAndSave(feeling);
    }, 250);
  };

  // Check if current step has all answers completed (useful if user navigated back)
  const isStep1Complete = q1Stress !== null && q2Control !== null && q3Demand !== null;
  const isStep2Complete = q4Capability !== null && q5Energy !== null;

  // Option labels from MD specification
  const q1Labels = ['Not at all', 'Slightly stressed', 'Moderately', 'Quite stressed', 'Extremely stressed'];
  const q2Labels = ['No control', 'Slight control', 'Moderate', 'Mostly in control', 'Full control'];
  const q3Labels = ['Not at all', 'Light demand', 'Moderate', 'High demand', 'Intense demand'];
  const q4Labels = ['Not capable', 'Slightly capable', 'Moderately', 'Quite capable', 'Fully capable'];
  const q5Labels = ['Exhausted', 'Low energy', 'Moderate', 'Good energy', 'Full battery'];

  const feelings = [
    { label: 'Great', mood: 'Great', desc: 'Feeling energized, vibrant & positive', bg: 'rgba(254, 249, 195, 0.5)', border: '#FDE047', color: '#854D0E' },
    { label: 'All Good', mood: 'All Good', desc: 'Calm, grounded & balanced state', bg: 'rgba(220, 252, 231, 0.5)', border: '#86EFAC', color: '#166534' },
    { label: 'Normal', mood: 'Normal', desc: 'Steady, manageable day-to-day flow', bg: 'rgba(243, 232, 255, 0.5)', border: '#DDD6FE', color: '#6B21A8' },
    { label: 'Tense', mood: 'Tense', desc: 'Slight pressure felt & mental strain', bg: 'rgba(255, 237, 213, 0.5)', border: '#FED7AA', color: '#9A3412' },
    { label: 'Overwhelmed', mood: 'Overwhelmed', desc: 'Heavy cognitive burden & exhaustion', bg: 'rgba(255, 228, 230, 0.5)', border: '#FECDD3', color: '#BE123C' },
  ];

  const renderLikertRow = (
    qNumber: number,
    title: string,
    value: number | null,
    onChange: (val: number) => void,
    labels: string[]
  ) => (
    <div style={{
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '20px',
      padding: '16px 16px',
      border: value !== null ? '1.5px solid #FED7AA' : '1.2px solid rgba(226, 232, 240, 0.9)',
      boxShadow: value !== null ? '0 4px 16px rgba(251, 146, 60, 0.08)' : '0 2px 8px rgba(0, 0, 0, 0.03)',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      transition: 'all 0.2s ease'
    }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: Colors.peachText, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Question {qNumber}
          </span>
        </div>
        <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: Colors.textDark, marginTop: '2px', lineHeight: 1.3 }}>
          {title}
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
        {[1, 2, 3, 4, 5].map((val) => {
          const isSelected = value === val;
          return (
            <button
              key={val}
              type="button"
              onClick={() => onChange(val)}
              style={{
                height: '42px',
                borderRadius: '12px',
                border: isSelected ? '2px solid #FB923C' : '1px solid rgba(226, 232, 240, 0.9)',
                backgroundColor: isSelected ? '#FFEDD5' : '#FFFFFF',
                color: isSelected ? '#9A3412' : Colors.textDark,
                fontWeight: isSelected ? 800 : 600,
                fontSize: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 2px 8px rgba(251, 146, 60, 0.25)' : 'none'
              }}
            >
              {val}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: Colors.textMuted }}>
        <span style={{ maxWidth: '45%' }}>{labels[0]}</span>
        <span style={{ maxWidth: '45%', textAlign: 'right' }}>{labels[4]}</span>
      </div>
    </div>
  );

  // Snapshot calculated metrics
  const activePss = todayCheckIn
    ? { score: todayCheckIn.pssScore, category: todayCheckIn.category, interpretation: todayCheckIn.snapshotInterpretation || 'Calculated stress level' }
    : calculatePss(q1Stress ?? 3, q2Control ?? 3, q3Demand ?? 3, q4Capability ?? 3);

  // Baseline: may be null when fewer than 30 prior records exist
  const activeBaseline: { diff: number; category: string; interpretation: string } | null = todayCheckIn
    ? (todayCheckIn.baselineCategory !== undefined && todayCheckIn.baselineDiff !== undefined
      ? { diff: todayCheckIn.baselineDiff, category: todayCheckIn.baselineCategory, interpretation: todayCheckIn.baselineInterpretation || 'Typical level' }
      : null)
    : calculateBaselineDiff(activePss.score);

  // Format comparison display label (e.g. "Typical level", "Higher than normal", "Lower than normal")
  const getComparisonLabel = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'normal': return 'Typical level';
      case 'elevated': return 'Higher than normal';
      case 'significantly elevated': return 'Significantly elevated';
      case 'lower than normal': return 'Lower than normal';
      default: return 'Typical level';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
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
        maxWidth: '410px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px 22px',
        boxShadow: '0 25px 60px rgba(15, 23, 42, 0.15)',
        border: '1.5px solid rgba(255, 255, 255, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>

        {/* Modal Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showSnapshot ? '20px' : '14px' }}>
          {!showSnapshot && step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              style={{
                border: 'none',
                background: 'rgba(241, 245, 249, 0.8)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: Colors.textDark
              }}
            >
              <ArrowLeft size={17} />
            </button>
          ) : <div style={{ width: '32px' }} />}

          <h3 style={{
            fontSize: '15px',
            fontWeight: 800,
            color: '#1E293B',
            margin: 0,
            textAlign: 'center'
          }}>
            {showSnapshot ? 'Check-in Complete' : `Daily Check-in (${step}/3)`}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {!showSnapshot && ((step === 1 && isStep1Complete) || (step === 2 && isStep2Complete)) && (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                title="Continue to next page"
                style={{
                  border: 'none',
                  backgroundColor: '#FFF7ED',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#EA580C'
                }}
              >
                <ArrowRight size={17} />
              </button>
            )}

            <button
              onClick={() => {
                if (showSnapshot) {
                  setIsCheckInOpen(false);
                } else {
                  setShowExitConfirm(true);
                }
              }}
              style={{
                border: 'none',
                backgroundColor: '#F1F5F9',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B'
              }}
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Progress Bar (during questionnaire only) */}
        {!showSnapshot && (
          <div style={{ width: '100%', height: '4px', backgroundColor: '#E2E8F0', borderRadius: '2px', marginBottom: '18px' }}>
            <div style={{
              width: `${(step / 3) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #FFB088 0%, #FF8A50 100%)',
              borderRadius: '2px',
              transition: 'width 0.25s ease'
            }} />
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: CURRENT STATE SNAPSHOT (Exact matching user's uploaded screenshot) */}
        {/* ========================================================================= */}
        {showSnapshot ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>

            {/* Glowing Green Check Icon Circle */}
            <div style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              backgroundColor: '#E8FDF0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.18)',
              marginTop: '4px'
            }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <Check size={26} strokeWidth={3} />
              </div>
            </div>

            {/* All Set! Title & Subtitle */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 800,
                color: '#0F172A',
                margin: 0,
                letterSpacing: '-0.3px'
              }}>
                All Set!
              </h2>
              <p style={{
                fontSize: '13px',
                color: '#64748B',
                margin: 0
              }}>
                Your daily check-in is recorded.
              </p>
            </div>

            {/* CURRENT STATE SNAPSHOT INSET CONTAINER (Exact match to screenshot) */}
            <div style={{
              width: '100%',
              backgroundColor: '#F8FAFC',
              borderRadius: '24px',
              padding: '18px 16px',
              border: '1.2px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginTop: '2px'
            }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#94A3B8',
                letterSpacing: '0.8px',
                textTransform: 'uppercase'
              }}>
                CURRENT STATE SNAPSHOT
              </span>

              {/* Two side-by-side white cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Left Card: Stress */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '16px 12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  border: '1px solid #F1F5F9',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Activity size={22} color="#F97316" strokeWidth={2.4} />
                  <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
                    Stress
                  </span>
                  <span style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    color: activePss.category === 'Normal' ? '#166534' : activePss.category === 'Elevated' ? '#EA580C' : '#DC2626'
                  }}>
                    {activePss.category}
                  </span>
                  <span style={{ fontSize: '10px', color: '#94A3B8' }}>
                    Score: {activePss.score}/20
                  </span>
                </div>

                {/* Right Card: Baseline Comparison */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '16px 12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  border: '1px solid #F1F5F9',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Activity size={22} color="#8B5CF6" strokeWidth={2.4} />
                  <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
                    Comparison
                  </span>
                  {activeBaseline !== null ? (
                    <>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#7C3AED' }}>
                        {getComparisonLabel(activeBaseline.category)}
                      </span>
                      <span style={{ fontSize: '10px', color: '#94A3B8' }}>
                        {activeBaseline.diff > 0 ? `+${activeBaseline.diff}` : `${activeBaseline.diff}`} vs 30d avg
                      </span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#94A3B8', textAlign: 'center', lineHeight: 1.3 }}>
                        Building baseline
                      </span>
                      <span style={{ fontSize: '10px', color: '#CBD5E1', textAlign: 'center', lineHeight: 1.3 }}>
                        Available after 30 check-ins
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Back to Home Button (Soft Lime/Green Gradient from screenshot) */}
            <button
              type="button"
              onClick={() => setIsCheckInOpen(false)}
              style={{
                width: '100%',
                height: '50px',
                borderRadius: '25px',
                border: '1.2px solid #BBF7D0',
                background: 'linear-gradient(135deg, #ECFCCB 0%, #DCFCE7 100%)',
                color: '#166534',
                fontWeight: 800,
                fontSize: '14.5px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(134, 239, 172, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '4px',
                transition: 'transform 0.12s ease'
              }}
            >
              <span>Back to Home</span>
            </button>

            {/* Retest Link/Button (Specification: If user clicks back in, directly show current snapshot and give button "Retest" or "Back to home") */}
            <button
              type="button"
              onClick={handleRetest}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                padding: '4px 8px',
                marginTop: '-4px'
              }}
            >
              <RefreshCw size={13} />
              <span>Retest Daily Check-in</span>
            </button>

          </div>
        ) : showExitConfirm ? (

          /* Exit Confirmation Overlay */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '14px',
            padding: '20px 8px'
          }}>
            <AlertCircle size={44} color="#EA580C" />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: Colors.textDark }}>Leave Check-In?</h3>
            <p style={{ fontSize: '13px', color: Colors.textMuted, maxWidth: '280px', lineHeight: 1.4 }}>
              Your check-in responses won't be saved if you leave before completing the assessment.
            </p>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button
                onClick={() => setShowExitConfirm(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '14px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Continue
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  setIsCheckInOpen(false);
                  resetForm();
                }}
                style={{
                  padding: '10px 18px',
                  borderRadius: '14px',
                  border: 'none',
                  backgroundColor: '#FFEAEA',
                  color: '#C62828',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Leave
              </button>
            </div>
          </div>
        ) : (

          /* ========================================================================= */
          /* VIEW 2: QUESTIONNAIRE FLOW (AUTO-ADVANCES WITHOUT NEED FOR NEXT BUTTON)   */
          /* ========================================================================= */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* STEP 1: Q1, Q2, Q3 */}
            {step === 1 && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: Colors.textDark, margin: 0 }}>
                    Stress, Control & Demands
                  </h2>
                  <p style={{ fontSize: '12px', color: Colors.textMuted, margin: 0 }}>
                    Select your rating for each question to automatically continue.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {renderLikertRow(1, "How stressed do you feel right now?", q1Stress, onSelectQ1, q1Labels)}
                  {renderLikertRow(2, "How much control do you feel you have over your day?", q2Control, onSelectQ2, q2Labels)}
                  {renderLikertRow(3, "How mentally demanding has your day been?", q3Demand, onSelectQ3, q3Labels)}
                </div>

                {/* Optional Demo Shortcut */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={handleQuickFillNicoleDemo}
                    style={{
                      background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
                      border: '1.2px solid #FED7AA',
                      borderRadius: '12px',
                      padding: '8px 14px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      color: '#C2410C',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 6px rgba(234, 88, 12, 0.08)'
                    }}
                  >
                    <Sparkles size={13} color="#EA580C" />
                    <span>⚡ Quick Fill: Nicole's Demo State (Overwhelmed)</span>
                  </button>
                </div>
              </>
            )}

            {/* STEP 2: Q4, Q5 */}
            {step === 2 && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: Colors.textDark, margin: 0 }}>
                    Coping & Energy
                  </h2>
                  <p style={{ fontSize: '12px', color: Colors.textMuted, margin: 0 }}>
                    Rate your coping confidence and energy to continue.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {renderLikertRow(4, "How capable do you feel of handling your current workload?", q4Capability, onSelectQ4, q4Labels)}
                  {renderLikertRow(5, "How much energy do you have right now?", q5Energy, onSelectQ5, q5Labels)}
                </div>
              </>
            )}

            {/* STEP 3: Q6 (EMOTION TRACKING - AUTO-COMPLETES ON TAP) */}
            {step === 3 && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: Colors.peachText, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Question 6
                  </span>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: Colors.textDark, margin: 0 }}>
                    What best describes how you feel right now?
                  </h2>
                  <p style={{ fontSize: '12px', color: Colors.textMuted, margin: 0 }}>
                    Tap your current emotion to record check-in.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {feelings.map((f) => {
                    const isSelected = q6Feeling === f.label;
                    return (
                      <div
                        key={f.label}
                        onClick={() => onSelectQ6(f.label)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '18px',
                          border: isSelected ? `2px solid ${f.border}` : '1.5px solid rgba(226, 232, 240, 0.8)',
                          backgroundColor: isSelected ? f.bg : '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          cursor: 'pointer',
                          boxShadow: isSelected ? '0 4px 14px rgba(0, 0, 0, 0.05)' : '0 1px 3px rgba(0, 0, 0, 0.02)',
                          transition: 'all 0.15s ease',
                          transform: isSelected ? 'scale(1.02)' : 'none'
                        }}
                      >
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          backgroundColor: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                          flexShrink: 0
                        }}>
                          <CartoonEmoji mood={f.mood} size={36} />
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontWeight: 800,
                            fontSize: '14.5px',
                            color: isSelected ? f.color : Colors.textDark
                          }}>
                            {f.label}
                          </div>
                          <div style={{ fontSize: '11.5px', color: Colors.textMuted, marginTop: '2px' }}>
                            {f.desc}
                          </div>
                        </div>

                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: isSelected ? `2px solid ${f.border}` : '1.5px solid #CBD5E1',
                          backgroundColor: isSelected ? f.border : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFFFFF' }} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
