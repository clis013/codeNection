import React from 'react';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';
import { CartoonEmoji } from '../components/Common/CartoonEmoji';
import { getLastNLocalDates, getShortWeekdayLabel } from '../utils/dateHelpers';
import { 
  ArrowRight, Clock, AlertTriangle, Brain, Sparkles, Feather, Palette, Activity, Heart, ShieldCheck
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    todayCheckIn,
    setIsCheckInOpen,
    capacityProfile,
    setIsTreeHoleOpen,
    setIsColourReflectionOpen,
    setActiveTab,
    checkIns,
    workloads,
  } = useApp();

  const isTodayCheckedIn = !!todayCheckIn;

  const getDayMood = (dateStr: string, fallbackMood: string) => {
    const c = checkIns.find(item => item.date === dateStr);
    return c ? c.emotionFeeling : fallbackMood;
  };

  // Dynamic last-5-days grid (oldest → newest, today is last)
  const last5 = getLastNLocalDates(5);
  const days = last5.map(({ dateStr, date, isToday }) => ({
    day: isToday ? 'Today' : getShortWeekdayLabel(date),
    date: dateStr,
    mood: isToday
      ? (isTodayCheckedIn ? todayCheckIn!.emotionFeeling : '?')
      : getDayMood(dateStr, ''),
    isToday
  }));

  // Stress summary label — only derived from today's real check-in, never fabricated
  const getStressSummary = () => {
    if (!todayCheckIn) return null; // No check-in today
    const cat = todayCheckIn.category.toUpperCase();
    const comp = todayCheckIn.baselineCategory
      ? todayCheckIn.baselineCategory.charAt(0).toUpperCase() + todayCheckIn.baselineCategory.slice(1)
      : '';
    return comp ? `${cat} • ${comp}` : cat;
  };

  // Status Styling: Manageable (Green whole block), Strained (Yellow whole block), Overloaded (Red whole block), InsufficientData (Grey whole block)
  const status = capacityProfile.analysisResult.demandResourceStatus;
  const isManageable = status === 'Manageable';
  const isStrained = status === 'Strained';
  const isOverloaded = status === 'Overloaded';
  const isInsufficient = status === 'InsufficientData';

  const statusColors = isManageable ? {
    cardBg: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
    cardBorder: '1.5px solid #86EFAC',
    cardShadow: '0 8px 28px rgba(22, 101, 52, 0.08)',
    titleColor: '#166534',
    subtextColor: '#15803D',
    badgeBg: '#DCFCE7',
    badgeText: '#166534',
    badgeBorder: '#86EFAC',
    innerBg: 'rgba(255, 255, 255, 0.85)',
    innerBorder: 'rgba(134, 239, 172, 0.9)',
    textPrimary: '#166534',
    btnBg: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',
    btnBorder: '1.5px solid #86EFAC',
    btnText: '#166534',
    btnShadow: '0 4px 14px rgba(34, 197, 94, 0.15)'
  } : isStrained ? {
    cardBg: 'linear-gradient(135deg, #FEFCE8 0%, #FEF9C3 100%)',
    cardBorder: '1.5px solid #FDE047',
    cardShadow: '0 8px 28px rgba(180, 83, 9, 0.08)',
    titleColor: '#92400E',
    subtextColor: '#B45309',
    badgeBg: '#FEF3C7',
    badgeText: '#92400E',
    badgeBorder: '#FCD34D',
    innerBg: 'rgba(255, 255, 255, 0.85)',
    innerBorder: 'rgba(253, 230, 138, 0.9)',
    textPrimary: '#92400E',
    btnBg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
    btnBorder: '1.5px solid #FCD34D',
    btnText: '#92400E',
    btnShadow: '0 4px 14px rgba(217, 119, 6, 0.15)'
  } : isOverloaded ? {
    cardBg: 'linear-gradient(135deg, #FFF1F2 0%, #FEE2E2 100%)',
    cardBorder: '1.5px solid #FECDD3',
    cardShadow: '0 8px 28px rgba(185, 28, 28, 0.08)',
    titleColor: '#991B1B',
    subtextColor: '#B91C1C',
    badgeBg: '#FEE2E2',
    badgeText: '#991B1B',
    badgeBorder: '#FCA5A5',
    innerBg: 'rgba(255, 255, 255, 0.85)',
    innerBorder: 'rgba(252, 165, 165, 0.9)',
    textPrimary: '#991B1B',
    btnBg: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
    btnBorder: '1.5px solid #FCA5A5',
    btnText: '#991B1B',
    btnShadow: '0 4px 14px rgba(239, 68, 68, 0.15)'
  } : {
    cardBg: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
    cardBorder: '1.5px solid #E2E8F0',
    cardShadow: '0 8px 28px rgba(100, 116, 139, 0.08)',
    titleColor: '#334155',
    subtextColor: '#475569',
    badgeBg: '#F1F5F9',
    badgeText: '#475569',
    badgeBorder: '#E2E8F0',
    innerBg: 'rgba(255, 255, 255, 0.85)',
    innerBorder: 'rgba(226, 232, 240, 0.9)',
    textPrimary: '#475569',
    btnBg: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
    btnBorder: '1.5px solid #CBD5E1',
    btnText: '#334155',
    btnShadow: '0 4px 14px rgba(100, 116, 139, 0.15)'
  };

  return (
    <div style={{
      padding: '14px 18px 32px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      fontFamily: "'Outfit', -apple-system, sans-serif"
    }}>

      {/* ========================================================================= */}
      {/* SECTION 1: DAILY CHECK-IN (LAST 5 DAYS STYLE WITH '?' FOR TODAY EMOJI)   */}
      {/* ========================================================================= */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="serif-title" style={{
            fontSize: '20px',
            fontWeight: 600,
            color: Colors.textDark,
            margin: 0,
            letterSpacing: '-0.3px'
          }}>
            Daily Check-in
          </h2>
          <span className="aesthetic-caption">
            {isTodayCheckedIn ? 'Checked in • Tap to view snapshot' : 'Tap today (?) to check in'}
          </span>
        </div>

        {/* 5-Day Mood Tracker Box */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.5) 100%)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          borderRadius: '26px',
          padding: '16px 14px',
          border: '1.5px solid rgba(255, 255, 255, 0.85)',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.05), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px',
            alignItems: 'center'
          }}>
            {days.map((item, idx) => {
              const isUncheckedToday = item.isToday && !isTodayCheckedIn;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (item.isToday) {
                      setIsCheckInOpen(true);
                    }
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: item.isToday ? 'pointer' : 'default',
                    transition: 'transform 0.15s ease',
                    transform: item.isToday ? 'scale(1.05)' : 'none'
                  }}
                  title={item.isToday ? (isTodayCheckedIn ? 'Click to view snapshot or retest' : 'Click to complete check in!') : item.day}
                >
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: isUncheckedToday
                      ? '#FFF7ED'
                      : 'rgba(255, 255, 255, 0.95)',
                    border: item.isToday
                      ? '2.5px solid #FB923C'
                      : '1.5px solid rgba(226, 232, 240, 0.85)',
                    boxShadow: item.isToday ? '0 0 0 3px rgba(251, 146, 60, 0.25)' : '0 2px 6px rgba(0,0,0,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    {isUncheckedToday ? (
                      <span style={{ fontSize: '20px', fontWeight: 900, color: '#EA580C' }}>
                        ?
                      </span>
                    ) : (
                      <CartoonEmoji mood={item.mood} size={36} />
                    )}
                  </div>

                  <span style={{
                    fontSize: '11px',
                    fontWeight: item.isToday ? 900 : 600,
                    color: item.isToday ? '#EA580C' : Colors.textMuted
                  }}>
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: STATE & LOAD INSIGHT (REAL APP DATA + PREVIOUS BUTTON DESIGN)  */}
      {/* ========================================================================= */}
      {(() => {
        const isMan = status === 'Manageable';
        const isOver = status === 'Overloaded';
        const isStrain = status === 'Strained';

        // Real metrics derived from today's check-in only (never yesterday's)
        // When no check-in today, stress and energy are genuinely unknown
        const stressCategory = todayCheckIn ? todayCheckIn.category : null;
        const stressColor = !stressCategory ? '#94A3B8'
          : (stressCategory === 'Very High' || stressCategory === 'High')
          ? '#DC2626'
          : stressCategory === 'Elevated'
          ? '#D97706'
          : '#166534';

        const energyNum = todayCheckIn?.energyLevel ?? null;
        const energyDisplay = energyNum === null
          ? null
          : (energyNum <= 2 ? 'Low' : energyNum === 3 ? 'Moderate' : 'High');
        const energyColor = !energyDisplay ? '#94A3B8'
          : energyDisplay === 'Low' ? '#DC2626'
          : energyDisplay === 'Moderate' ? '#D97706'
          : '#166534';

        const activeWorkloadsList = workloads.filter(w => w.status !== 'Completed');
        const totalWorkloadHours = Number(activeWorkloadsList.reduce((acc, w) => acc + (w.estimatedHours || 0), 0).toFixed(1));
        const availableHours = capacityProfile.candidateTimeHours !== null ? Number(capacityProfile.candidateTimeHours.toFixed(1)) : null;
        const timeLoadColor = availableHours !== null && totalWorkloadHours > availableHours ? '#DC2626' : (availableHours === null ? '#94A3B8' : '#166534');

        const cardTheme = isMan ? {
          outerBg: 'linear-gradient(135deg, rgba(240, 253, 244, 0.88) 0%, rgba(220, 252, 231, 0.68) 100%)',
          outerBorder: '1.5px solid #86EFAC',
          shadow: '0 8px 30px rgba(22, 101, 52, 0.08)',
          dotColor: '#16A34A',
          titleColor: '#166534',
          badgeBg: '#DCFCE7',
          badgeBorder: '#86EFAC',
          badgeText: '#166534',
          innerBorder: '#DCFCE7',
          accentColor: '#16A34A',
          captionColor: '#166534',
          btnGradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          btnShadow: '0 4px 14px rgba(16, 185, 129, 0.28), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
          defaultInsight: 'Your capacity and recovery resources are currently well balanced with your scheduled workload.'
        } : isOver ? {
          outerBg: 'linear-gradient(135deg, rgba(254, 242, 242, 0.88) 0%, rgba(254, 226, 226, 0.68) 100%)',
          outerBorder: '1.5px solid #FECACA',
          shadow: '0 8px 30px rgba(220, 38, 38, 0.08)',
          dotColor: '#DC2626',
          titleColor: '#991B1B',
          badgeBg: '#FEE2E2',
          badgeBorder: '#FECACA',
          badgeText: '#991B1B',
          innerBorder: '#FEE2E2',
          accentColor: '#DC2626',
          captionColor: '#991B1B',
          btnGradient: 'linear-gradient(135deg, #F87171 0%, #E11D48 100%)',
          btnShadow: '0 4px 14px rgba(225, 29, 72, 0.28), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
          defaultInsight: 'Your demands significantly exceed your recovery capacity. High urgency adjustments are needed.'
        } : isStrain ? {
          outerBg: 'linear-gradient(135deg, rgba(254, 252, 232, 0.88) 0%, rgba(254, 243, 199, 0.68) 100%)',
          outerBorder: '1.5px solid #FDE68A',
          shadow: '0 8px 30px rgba(217, 119, 6, 0.08)',
          dotColor: '#D97706',
          titleColor: '#92400E',
          badgeBg: '#FEF3C7',
          badgeBorder: '#FDE68A',
          badgeText: '#92400E',
          innerBorder: '#FEF3C7',
          accentColor: '#D97706',
          captionColor: '#92400E',
          btnGradient: 'linear-gradient(135deg, #FB923C 0%, #F43F5E 100%)',
          btnShadow: '0 4px 14px rgba(249, 115, 22, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
          defaultInsight: 'Your current demands show meaningful pressure, with high cognitive demand in upcoming workloads and limited recovery buffers.'
        } : {
          // InsufficientData
          outerBg: 'linear-gradient(135deg, rgba(248, 250, 252, 0.88) 0%, rgba(241, 245, 249, 0.68) 100%)',
          outerBorder: '1.5px solid #E2E8F0',
          shadow: '0 8px 30px rgba(100, 116, 139, 0.08)',
          dotColor: '#94A3B8',
          titleColor: '#334155',
          badgeBg: '#F1F5F9',
          badgeBorder: '#E2E8F0',
          badgeText: '#475569',
          innerBorder: '#F1F5F9',
          accentColor: '#64748B',
          captionColor: '#475569',
          btnGradient: 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)',
          btnShadow: '0 4px 14px rgba(100, 116, 139, 0.28), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
          defaultInsight: (workloads.filter(w => w.status !== 'Completed').length > 0)
            ? "Your workload is recorded, but today's resource state is missing. Complete today's check-in to compare your demands with your current resources."
            : 'Please record some workloads and complete a daily check-in to see your analysis.'
        };

        const analysisMismatch = capacityProfile.analysisResult.mismatch;
        const insightText = (analysisMismatch?.detected && analysisMismatch.insight) 
          ? analysisMismatch.insight 
          : cardTheme.defaultInsight;

        return (
          <div style={{
            background: cardTheme.outerBg,
            backdropFilter: 'blur(20px) saturate(160%)',
            WebkitBackdropFilter: 'blur(20px) saturate(160%)',
            borderRadius: '24px',
            padding: '16px 18px',
            border: cardTheme.outerBorder,
            boxShadow: `${cardTheme.shadow}, inset 0 1px 2px rgba(255, 255, 255, 0.9)`,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {/* Top Header: Title (STATE & LOAD INSIGHT) & Status Badge (as in picture) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: cardTheme.dotColor }} />
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: cardTheme.titleColor, margin: 0, letterSpacing: '0.2px' }}>
                  STATE & LOAD INSIGHT
                </h3>
              </div>

              <span style={{
                fontSize: '11.5px',
                color: cardTheme.badgeText,
                fontWeight: 800,
                backgroundColor: cardTheme.badgeBg,
                padding: '3px 10px',
                borderRadius: '12px',
                border: `1px solid ${cardTheme.badgeBorder}`
              }}>
                {status === 'InsufficientData' ? 'UNKNOWN' : status.toUpperCase()}
              </span>
            </div>

            {/* Description */}
            <p style={{ fontSize: '12.5px', color: '#475569', margin: 0, lineHeight: '1.45' }}>
              {insightText}
            </p>

            {/* 3 Metric Boxes: Stress Level | Energy | Time Load (Directly derived from user's app data) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {/* Stress Level */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '12px 6px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                border: '1px solid rgba(0, 0, 0, 0.04)'
              }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                  STRESS LEVEL
                </span>
                <span style={{ fontSize: '14px', fontWeight: 900, color: stressColor }}>
                  {stressCategory ?? <span style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 700 }}>No data</span>}
                </span>
              </div>

              {/* Energy */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '12px 6px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                border: '1px solid rgba(0, 0, 0, 0.04)'
              }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                  ENERGY
                </span>
                <span style={{ fontSize: '14px', fontWeight: 900, color: energyColor }}>
                  {energyDisplay ?? <span style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 700 }}>No data</span>}
                </span>
              </div>

              {/* Time Load — derived from remainingTimeHours, always available */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '12px 6px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                border: '1px solid rgba(0, 0, 0, 0.04)'
              }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                  CANDIDATE TIME (7 DAYS)
                </span>
                <span style={{ fontSize: '14px', fontWeight: 900, color: timeLoadColor }}>
                  {availableHours !== null ? `${totalWorkloadHours}h / ${availableHours}h` : `${totalWorkloadHours}h / —`}
                </span>
              </div>
            </div>

            {/* Bottom: Understand My Load button fitting full width of the box with previous gradient design */}
            <div style={{
              width: '100%',
              marginTop: '4px',
              paddingTop: '10px',
              borderTop: `1px solid rgba(0, 0, 0, 0.06)`
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('map')}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  border: 'none',
                  background: cardTheme.btnGradient,
                  color: '#FFFFFF',
                  padding: '12px 20px',
                  borderRadius: '16px',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  letterSpacing: '0.2px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: cardTheme.btnShadow,
                  transition: 'all 0.18s ease'
                }}
              >
                <span>Understand My Load</span>
                <ArrowRight size={15} strokeWidth={2.6} color="#FFFFFF" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* SECTION 3: RECOVERY FEATURES (ORIGINAL DESIGN WITH COVER PAGE CARDS)      */}
      {/* ========================================================================= */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 className="serif-title" style={{
            fontSize: '19px',
            fontWeight: 600,
            color: Colors.textDark,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            Recover Pathways <ArrowRight size={16} color={Colors.textMuted} />
          </h3>
          <span className="aesthetic-caption">
            Emotional release & calm
          </span>
        </div>

        {/* Two side by side COVER PAGE cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          
          {/* Tree Hole Cover Page Card */}
          <div
            onClick={() => setIsTreeHoleOpen(true)}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1.5px solid rgba(187, 247, 208, 0.9)',
              boxShadow: '0 8px 24px rgba(34, 197, 94, 0.1), 0 2px 6px rgba(0,0,0,0.03)',
              overflow: 'hidden',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.2s ease',
            }}
          >
            {/* Visual Cover Header Art */}
            <div style={{ position: 'relative', width: '100%', height: '95px', overflow: 'hidden' }}>
              <svg width="100%" height="95" viewBox="0 0 180 95" fill="none" style={{ display: 'block' }}>
                <defs>
                  <linearGradient id="thSky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#DCFCE7" />
                    <stop offset="60%" stopColor="#BBF7D0" />
                    <stop offset="100%" stopColor="#86EFAC" />
                  </linearGradient>
                  <radialGradient id="thTreeGlow" cx="50%" cy="40%" r="50%">
                    <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect width="180" height="95" fill="url(#thSky)" />
                {/* Sun / Aura */}
                <circle cx="90" cy="38" r="34" fill="url(#thTreeGlow)" />
                {/* Tree Trunk */}
                <path d="M83 95 L84 62 Q85 52 90 48 Q95 52 96 62 L97 95 Z" fill="#92400E" />
                {/* Tree Hollow / Hole */}
                <ellipse cx="90" cy="68" rx="4.5" ry="6.5" fill="#451A03" />
                <ellipse cx="90" cy="68" rx="2.5" ry="4" fill="#1C0A00" />
                {/* Lush Foliage Canopy */}
                <circle cx="90" cy="35" r="28" fill="#16A34A" />
                <circle cx="68" cy="40" r="20" fill="#15803D" opacity="0.95" />
                <circle cx="112" cy="40" r="20" fill="#15803D" opacity="0.95" />
                <circle cx="78" cy="22" r="18" fill="#22C55E" opacity="0.85" />
                <circle cx="108" cy="22" r="18" fill="#22C55E" opacity="0.85" />
                <circle cx="93" cy="14" r="15" fill="#BBF7D0" />
                {/* Blossom Accents */}
                <circle cx="74" cy="30" r="2" fill="#FDE047" />
                <circle cx="112" cy="30" r="2" fill="#F472B6" />
                <circle cx="93" cy="18" r="2.5" fill="#C084FC" />
                {/* Drifting Leaves */}
                <text x="32" y="46" fontSize="11" transform="rotate(-15 32 46)">🍃</text>
                <text x="138" y="58" fontSize="10" transform="rotate(25 138 58)">🍃</text>
              </svg>
            </div>

            {/* Cover Info Section */}
            <div style={{
              padding: '12px 12px 14px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              flex: 1,
              justifyContent: 'space-between',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)'
            }}>
              <div>
                <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#166534', letterSpacing: '-0.2px' }}>
                  Tree Hole
                </div>
                <p style={{ fontSize: '11px', color: '#15803D', marginTop: '2px', lineHeight: '1.35' }}>
                  Shout & release stress with fluttering leaves
                </p>
              </div>

              {/* Enter Button Chip */}
              <div style={{
                marginTop: '4px',
                backgroundColor: 'rgba(220, 252, 231, 0.75)',
                border: '1px solid rgba(187, 247, 208, 0.9)',
                borderRadius: '12px',
                padding: '5px 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                fontWeight: 800,
                color: '#15803D'
              }}>
                <span>Enter Pathway</span>
                <span>→</span>
              </div>
            </div>
          </div>

          {/* Colour Reflection Cover Page Card */}
          <div
            onClick={() => setIsColourReflectionOpen(true)}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1.5px solid rgba(221, 214, 254, 0.9)',
              boxShadow: '0 8px 24px rgba(168, 85, 247, 0.1), 0 2px 6px rgba(0,0,0,0.03)',
              overflow: 'hidden',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.2s ease',
            }}
          >
            {/* Visual Cover Header Art */}
            <div style={{ position: 'relative', width: '100%', height: '95px', overflow: 'hidden' }}>
              <svg width="100%" height="95" viewBox="0 0 180 95" fill="none" style={{ display: 'block' }}>
                <defs>
                  <linearGradient id="crSky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FAF5FF" />
                    <stop offset="50%" stopColor="#F3E8FF" />
                    <stop offset="100%" stopColor="#E9D5FF" />
                  </linearGradient>
                  <radialGradient id="mandalaCenterGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#C084FC" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect width="180" height="95" fill="url(#crSky)" />
                {/* Ambient circular soft aura */}
                <circle cx="90" cy="48" r="42" fill="url(#mandalaCenterGlow)" />
                {/* Geometric / Floral Mandala Petals */}
                <circle cx="90" cy="48" r="32" stroke="#DDD6FE" strokeWidth="1.2" strokeDasharray="3 3" />
                <circle cx="90" cy="20" r="10" fill="#FBCFE8" opacity="0.65" />
                <circle cx="90" cy="76" r="10" fill="#FBCFE8" opacity="0.65" />
                <circle cx="62" cy="48" r="10" fill="#BAE6FD" opacity="0.65" />
                <circle cx="118" cy="48" r="10" fill="#BAE6FD" opacity="0.65" />
                <circle cx="70" cy="28" r="8" fill="#BBF7D0" opacity="0.6" />
                <circle cx="110" cy="28" r="8" fill="#FED7AA" opacity="0.6" />
                <circle cx="70" cy="68" r="8" fill="#FED7AA" opacity="0.6" />
                <circle cx="110" cy="68" r="8" fill="#BBF7D0" opacity="0.6" />
                {/* Inner blooming rosette */}
                <circle cx="90" cy="48" r="14" fill="#E9D5FF" />
                <circle cx="90" cy="48" r="9" fill="#FEF08A" opacity="0.9" />
                <circle cx="90" cy="48" r="5" fill="#F472B6" />
                {/* Sparkles / Starlight */}
                <circle cx="30" cy="24" r="2" fill="#C084FC" />
                <circle cx="150" cy="30" r="2.5" fill="#F472B6" />
                <circle cx="140" cy="70" r="1.5" fill="#93C5FD" />
                <circle cx="38" cy="70" r="2" fill="#FDE047" />
              </svg>
            </div>

            {/* Cover Info Section */}
            <div style={{
              padding: '12px 12px 14px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              flex: 1,
              justifyContent: 'space-between',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF5FF 100%)'
            }}>
              <div>
                <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#6B21A8', letterSpacing: '-0.2px' }}>
                  Colour Reflection
                </div>
                <p style={{ fontSize: '11px', color: '#7E22CE', marginTop: '2px', lineHeight: '1.35' }}>
                  Mandala coloring & emotional insights
                </p>
              </div>

              {/* Enter Button Chip */}
              <div style={{
                marginTop: '4px',
                backgroundColor: 'rgba(243, 232, 255, 0.75)',
                border: '1px solid rgba(221, 214, 254, 0.9)',
                borderRadius: '12px',
                padding: '5px 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                fontWeight: 800,
                color: '#7E22CE'
              }}>
                <span>Enter Pathway</span>
                <span>→</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
