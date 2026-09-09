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

  // Status Styling: Manageable, Strained, Overloaded, InsufficientData
  const status = capacityProfile.analysisResult.demandResourceStatus;
  const isManageable = status === 'Manageable';
  const isStrained = status === 'Strained';
  const isOverloaded = status === 'Overloaded';
  const isInsufficient = status === 'InsufficientData';

  return (
    <div style={{
      padding: '14px 18px 32px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      fontFamily: "'Outfit', -apple-system, sans-serif"
    }}>

      {/* ========================================================================= */}
      {/* SECTION 1: DAILY CHECK-IN (LAST 5 DAYS STYLE WITH '?' MATCHING IMAGE 2)  */}
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
                    gap: '6px',
                    cursor: item.isToday ? 'pointer' : 'default',
                    transition: 'transform 0.15s ease',
                    transform: item.isToday ? 'scale(1.04)' : 'none'
                  }}
                  title={item.isToday ? (isTodayCheckedIn ? 'Click to view snapshot or retest' : 'Click to complete check in!') : item.day}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: isUncheckedToday
                      ? '#FFF7ED'
                      : 'rgba(255, 255, 255, 0.95)',
                    border: item.isToday
                      ? (isUncheckedToday ? '3px solid #F97316' : '2.5px solid #FB923C')
                      : '1.5px solid rgba(226, 232, 240, 0.85)',
                    boxShadow: isUncheckedToday
                      ? '0 0 0 3.5px #FED7AA, 0 2px 8px rgba(234, 88, 12, 0.12)'
                      : item.isToday ? '0 0 0 3px rgba(251, 146, 60, 0.25)' : '0 2px 6px rgba(0,0,0,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    {isUncheckedToday ? (
                      <span style={{ fontSize: '22px', fontWeight: 900, color: '#EA580C', lineHeight: 1 }}>
                        ?
                      </span>
                    ) : (
                      <CartoonEmoji mood={item.mood} size={36} />
                    )}
                  </div>

                  <span style={{
                    fontSize: '12px',
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
      {/* SECTION 2: DAILY STATE & LOAD INSIGHT (EXACT MATCHING IMAGE 1 SPEC)       */}
      {/* ========================================================================= */}
      {(() => {
        const isMan = status === 'Manageable';
        const isOver = status === 'Overloaded';
        const isStrain = status === 'Strained';
        const isPending = !isTodayCheckedIn || status === 'InsufficientData';

        // 1. Stress Level
        const stressCategory = todayCheckIn ? todayCheckIn.category : null;
        const stressDisplay = stressCategory ?? '--';
        const stressColor = !todayCheckIn ? '#94A3B8'
          : (stressCategory === 'Very High' || stressCategory === 'High')
            ? '#DC2626'
            : stressCategory === 'Elevated'
              ? '#D97706'
              : '#15803D';

        // 2. Energy
        const energyNum = todayCheckIn?.energyLevel ?? null;
        const energyDisplay = energyNum === null
          ? '--'
          : (energyNum <= 2 ? 'Low' : energyNum === 3 ? 'Moderate' : 'High');
        const energyColor = energyNum === null ? '#94A3B8'
          : energyNum <= 2 ? '#991B1B'
            : energyNum === 3 ? '#D97706'
              : '#15803D';

        // 3. Time Load (active remaining hours vs available candidate time hours)
        const activeWorkloadsList = workloads.filter(w => w.status !== 'Completed');
        const totalWorkloadHours = Number(activeWorkloadsList.reduce((acc, w) => acc + (w.remainingTimeHours ?? w.estimatedHours ?? 0), 0).toFixed(1));
        const availableHours = capacityProfile.candidateTimeHours !== null ? Number(capacityProfile.candidateTimeHours.toFixed(1)) : 19;
        const timeLoadDisplay = `${totalWorkloadHours}h / ${availableHours}h`;

        // Theme configuration for all states (Manageable reflects Image 1 design)
        const theme = isPending ? {
          outerBg: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 55%, #F1F5F9 100%)',
          outerBorder: '1.5px solid #E2E8F0',
          shadow: '0 8px 30px rgba(100, 116, 139, 0.05)',
          headerColor: '#475569',
          badgeText: 'Pending Check-in',
          badgeBorder: '#CBD5E1',
          badgeColor: '#475569',
          heroIconBg: '#F1F5F9',
          heroIconBorder: '1px solid #E2E8F0',
          heroIconColor: '#64748B',
          HeroIcon: Clock,
          heroTitle: 'Daily check-in pending',
          heroSubtitle: "Complete today's check-in to compare your personal resources with your recorded workload.",
          timeLoadColor: '#334155',
          btnColor: '#334155'
        } : isMan ? {
          outerBg: 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 55%, #F8FAFC 100%)',
          outerBorder: '1.5px solid #DCFCE7',
          shadow: '0 8px 30px rgba(22, 101, 52, 0.05)',
          headerColor: '#15803D',
          badgeText: 'Manageable',
          badgeBorder: '#86EFAC',
          badgeColor: '#15803D',
          heroIconBg: '#DCFCE7',
          heroIconBorder: '1px solid #86EFAC',
          heroIconColor: '#15803D',
          HeroIcon: ShieldCheck,
          heroTitle: 'Workload is balanced',
          heroSubtitle: 'Your current commitments appear manageable with the resources you have available.',
          timeLoadColor: '#15803D',
          btnColor: '#15803D'
        } : isStrain ? {
          outerBg: 'linear-gradient(180deg, #FEFCE8 0%, #FFFFFF 55%, #F8FAFC 100%)',
          outerBorder: '1.5px solid #FDE68A',
          shadow: '0 8px 30px rgba(217, 119, 6, 0.05)',
          headerColor: '#B45309',
          badgeText: 'Strained',
          badgeBorder: '#FDE68A',
          badgeColor: '#B45309',
          heroIconBg: '#FEF3C7',
          heroIconBorder: '1px solid #FDE68A',
          heroIconColor: '#D97706',
          HeroIcon: AlertTriangle,
          heroTitle: 'Workload pressure is elevated',
          heroSubtitle: 'Your current demands show meaningful pressure. Adjustments are recommended to make the plan manageable.',
          timeLoadColor: '#D97706',
          btnColor: '#B45309'
        } : {
          // Overloaded
          outerBg: 'linear-gradient(180deg, #FFF1F2 0%, #FFFFFF 55%, #F8FAFC 100%)',
          outerBorder: '1.5px solid #FECDD3',
          shadow: '0 8px 30px rgba(220, 38, 38, 0.05)',
          headerColor: '#B91C1C',
          badgeText: 'Overloaded',
          badgeBorder: '#FECDD3',
          badgeColor: '#B91C1C',
          heroIconBg: '#FEE2E2',
          heroIconBorder: '1px solid #FECDD3',
          heroIconColor: '#DC2626',
          HeroIcon: AlertTriangle,
          heroTitle: 'Workload is overloaded',
          heroSubtitle: 'Your current demands appear difficult to manage with the resources and time available right now.',
          timeLoadColor: '#DC2626',
          btnColor: '#B91C1C'
        };

        const analysisMismatch = capacityProfile.analysisResult.mismatch;
        const displaySubtitle = (analysisMismatch?.detected && analysisMismatch.insight)
          ? analysisMismatch.insight
          : theme.heroSubtitle;

        const { HeroIcon } = theme;

        return (
          <div style={{
            background: theme.outerBg,
            borderRadius: '26px',
            padding: '18px 18px 16px 18px',
            border: theme.outerBorder,
            boxShadow: `${theme.shadow}, inset 0 1px 2px rgba(255, 255, 255, 0.9)`,
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            {/* Top Header: Sparkle + Title & Status Badge Pill (Image 1 style) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px', lineHeight: 1 }}>✨</span>
                <h3 style={{
                  fontSize: '12.5px',
                  fontWeight: 900,
                  color: theme.headerColor,
                  margin: 0,
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase'
                }}>
                  DAILY STATE & LOAD INSIGHT
                </h3>
              </div>

              <span style={{
                fontSize: '12px',
                color: theme.badgeColor,
                fontWeight: 800,
                backgroundColor: '#FFFFFF',
                padding: '3px 12px',
                borderRadius: '999px',
                border: `1px solid ${theme.badgeBorder}`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
              }}>
                {theme.badgeText}
              </span>
            </div>

            {/* Hero Insight Block: Rounded Icon Box + Title & Subtitle */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '16px',
                backgroundColor: theme.heroIconBg,
                border: theme.heroIconBorder,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <HeroIcon size={22} color={theme.heroIconColor} strokeWidth={2.2} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: 900,
                  color: '#0F172A',
                  margin: 0,
                  letterSpacing: '-0.2px'
                }}>
                  {theme.heroTitle}
                </h4>
                <p style={{
                  fontSize: '12.5px',
                  color: '#475569',
                  margin: 0,
                  lineHeight: '1.45'
                }}>
                  {displaySubtitle}
                </p>
              </div>
            </div>

            {/* 3 Metric Cards: STRESS LEVEL | ENERGY | TIME LOAD */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {/* Stress Level */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '10px 6px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                border: '1px solid #F1F5F9'
              }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                  STRESS LEVEL
                </span>
                <span style={{ fontSize: '14.5px', fontWeight: 900, color: stressColor }}>
                  {stressDisplay}
                </span>
              </div>

              {/* Energy */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '10px 6px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                border: '1px solid #F1F5F9'
              }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                  ENERGY
                </span>
                <span style={{ fontSize: '14.5px', fontWeight: 900, color: energyColor }}>
                  {energyDisplay}
                </span>
              </div>

              {/* Time Load */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '10px 6px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                border: '1px solid #F1F5F9'
              }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                  TIME LOAD
                </span>
                <span style={{ fontSize: '14.5px', fontWeight: 900, color: theme.timeLoadColor }}>
                  {timeLoadDisplay}
                </span>
              </div>
            </div>

            {/* Divider Line */}
            <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '2px 0 0 0' }} />

            {/* Action Button: Understand My Load (White card-button matching Image 1) */}
            <button
              type="button"
              onClick={() => setActiveTab('map')}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: theme.btnColor,
                padding: '12px 20px',
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                transition: 'all 0.15s ease'
              }}
            >
              <span>Understand My Load</span>
              <ArrowRight size={16} strokeWidth={2.4} color={theme.btnColor} />
            </button>
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
