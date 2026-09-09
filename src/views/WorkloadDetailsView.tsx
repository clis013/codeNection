import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { WorkloadItem, WorkloadArea } from '../types/workload';
import { Colors } from '../theme/colors';
import { CartoonEmoji } from '../components/Common/CartoonEmoji';
import {
  Filter, Plus, ChevronDown, Check, BookOpen, Coffee, Users, Laptop, Layers,
  Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Edit3, X, Sparkles, CheckCircle2
} from 'lucide-react';

export const WorkloadDetailsView: React.FC = () => {
  const {
    workloads,
    setSelectedWorkload,
    setIsWorkloadDetailOpen,
    setIsAddWorkloadOpen,
    setAddWorkloadInitialArea,
    toggleSubtask,
    updateWorkload,
    sortBy,
    setSortBy,
    searchQuery,
    checkIns,
    todayCheckIn
  } = useApp();

  // WORKLOAD TWO TABS: 'calendar' (Tab A) vs 'records' (Tab B)
  const [activeWorkloadTab, setActiveWorkloadTab] = useState<'calendar' | 'records'>('calendar');

  // Calendar Drill-Down Views: 'month' | 'week' | 'day' | 'mood'
  const [calendarViewMode, setCalendarViewMode] = useState<'month' | 'week' | 'day' | 'mood'>('month');
  const [selectedDay, setSelectedDay] = useState<number>(5); // Default to Sept 5 (Today)
  const months = ['August 2026', 'September 2026', 'October 2026', 'November 2026'];
  const [monthIndex, setMonthIndex] = useState(1); // September 2026

  // Real 2026 Calendar Weeks (Monday to Sunday)
  const weekRanges = [
    'Aug 31 – Sep 6, 2026',
    'Sep 7 – Sep 13, 2026',
    'Sep 14 – Sep 20, 2026',
    'Sep 21 – Sep 27, 2026',
    'Sep 28 – Oct 4, 2026'
  ];
  const [weekIndex, setWeekIndex] = useState(0); // Aug 31 - Sep 6 (contains Saturday Sep 5, Today)

  interface WeekCalendarDay {
    name: string;
    num: number;
    isToday: boolean;
    dateStr: string;
    isOther?: boolean;
  }

  const weekDaysByRange: WeekCalendarDay[][] = [
    // Week 0: Aug 31 - Sep 6, 2026 (Mon 31, Tue 1, Wed 2, Thu 3, Fri 4, Sat 5, Sun 6)
    [
      { name: 'Mon', num: 31, isToday: false, dateStr: '2026-08-31' },
      { name: 'Tue', num: 1, isToday: false, dateStr: '2026-09-01' },
      { name: 'Wed', num: 2, isToday: false, dateStr: '2026-09-02' },
      { name: 'Thu', num: 3, isToday: false, dateStr: '2026-09-03' },
      { name: 'Fri', num: 4, isToday: false, dateStr: '2026-09-04' },
      { name: 'Sat', num: 5, isToday: true, dateStr: '2026-09-05' },
      { name: 'Sun', num: 6, isToday: false, dateStr: '2026-09-06' },
    ],
    // Week 1: Sep 7 - Sep 13, 2026 (Mon 7, Tue 8, Wed 9, Thu 10, Fri 11, Sat 12, Sun 13)
    [
      { name: 'Mon', num: 7, isToday: false, dateStr: '2026-09-07' },
      { name: 'Tue', num: 8, isToday: false, dateStr: '2026-09-08' },
      { name: 'Wed', num: 9, isToday: false, dateStr: '2026-09-09' },
      { name: 'Thu', num: 10, isToday: false, dateStr: '2026-09-10' },
      { name: 'Fri', num: 11, isToday: false, dateStr: '2026-09-11' },
      { name: 'Sat', num: 12, isToday: false, dateStr: '2026-09-12' },
      { name: 'Sun', num: 13, isToday: false, dateStr: '2026-09-13' },
    ],
    // Week 2: Sep 14 - Sep 20, 2026 (Mon 14 to Sun 20)
    [
      { name: 'Mon', num: 14, isToday: false, dateStr: '2026-09-14' },
      { name: 'Tue', num: 15, isToday: false, dateStr: '2026-09-15' },
      { name: 'Wed', num: 16, isToday: false, dateStr: '2026-09-16' },
      { name: 'Thu', num: 17, isToday: false, dateStr: '2026-09-17' },
      { name: 'Fri', num: 18, isToday: false, dateStr: '2026-09-18' },
      { name: 'Sat', num: 19, isToday: false, dateStr: '2026-09-19' },
      { name: 'Sun', num: 20, isToday: false, dateStr: '2026-09-20' },
    ],
    // Week 3: Sep 21 - Sep 27, 2026 (Mon 21 to Sun 27)
    [
      { name: 'Mon', num: 21, isToday: false, dateStr: '2026-09-21' },
      { name: 'Tue', num: 22, isToday: false, dateStr: '2026-09-22' },
      { name: 'Wed', num: 23, isToday: false, dateStr: '2026-09-23' },
      { name: 'Thu', num: 24, isToday: false, dateStr: '2026-09-24' },
      { name: 'Fri', num: 25, isToday: false, dateStr: '2026-09-25' },
      { name: 'Sat', num: 26, isToday: false, dateStr: '2026-09-26' },
      { name: 'Sun', num: 27, isToday: false, dateStr: '2026-09-27' },
    ],
    // Week 4: Sep 28 - Oct 4, 2026 (Mon 28, Tue 29, Wed 30, Thu 1, Fri 2, Sat 3, Sun 4)
    [
      { name: 'Mon', num: 28, isToday: false, dateStr: '2026-09-28' },
      { name: 'Tue', num: 29, isToday: false, dateStr: '2026-09-29' },
      { name: 'Wed', num: 30, isToday: false, dateStr: '2026-09-30' },
      { name: 'Thu', num: 1, isToday: false, dateStr: '2026-10-01' },
      { name: 'Fri', num: 2, isToday: false, dateStr: '2026-10-02' },
      { name: 'Sat', num: 3, isToday: false, dateStr: '2026-10-03' },
      { name: 'Sun', num: 4, isToday: false, dateStr: '2026-10-04' },
    ]
  ];

  const [isGoogleSynced, setIsGoogleSynced] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Timeblock schedule edit modal state (Specification: timeblocks can be tapped and open to see details and editable)
  const [editingScheduleTask, setEditingScheduleTask] = useState<null | {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    area: WorkloadArea;
  }>(null);

  // Workload Records filters
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  // Floating Action Button (FAB) State
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [shellEl, setShellEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setShellEl(document.getElementById('app-shell'));
  }, []);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTasks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper to check if task is inactive / completed
  const isTaskInactive = (item: WorkloadItem) => {
    if (item.status === 'Completed') return true;
    if (item.subtasks.length > 0 && item.subtasks.every(s => s.completed)) return true;
    return false;
  };

  // Filter and Sort Workloads
  const processedWorkloads = workloads
    .filter(item => {
      const isInactive = isTaskInactive(item);
      if (statusFilter === 'Active' && isInactive) return false;
      if (statusFilter === 'Inactive' && !isInactive) return false;

      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.activityType.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'deadline') {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === 'urgency') {
        const order = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
        return order[b.urgency] - order[a.urgency];
      }
      if (sortBy === 'demand') {
        const demandA = a.demandProfile.cognitive + a.demandProfile.emotional + a.demandProfile.physical;
        const demandB = b.demandProfile.cognitive + b.demandProfile.emotional + b.demandProfile.physical;
        return demandB - demandA;
      }
      if (sortBy === 'stress') {
        return b.perceivedStressImpact - a.perceivedStressImpact;
      }
      return 0;
    });

  const activeWorkloads = processedWorkloads.filter(item => !isTaskInactive(item));
  const inactiveWorkloads = processedWorkloads.filter(item => isTaskInactive(item));

  const getAreaIcon = (area: WorkloadArea) => {
    switch (area) {
      case 'Academic': return <Laptop size={14} />;
      case 'Personal': return <BookOpen size={14} />;
      case 'Social': return <Users size={14} />;
      case 'Self-Care': default: return <Coffee size={14} />;
    }
  };

  const getAreaColor = (area: string) => {
    switch (area) {
      case 'Academic': return { bg: '#F3EEFD', text: '#7C3AED', border: '#DDD6FE', dot: '#8B5CF6' };
      case 'Personal': return { bg: '#FFF3EB', text: '#C2410C', border: '#FED7AA', dot: '#FF8A50' };
      case 'Social': return { bg: '#FFF1F2', text: '#E11D48', border: '#FECDD3', dot: '#FF6B6B' };
      case 'Self-Care': default: return { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD', dot: '#0284C7' };
    }
  };

  const getUrgencyBlockStyle = (urgency: string, isInactive: boolean) => {
    const whiteGlassBg = 'linear-gradient(135deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.6) 100%)';
    const whiteGlassBorder = '1.5px solid rgba(255, 255, 255, 0.9)';
    const whiteGlassShadow = '0 8px 24px rgba(0, 0, 0, 0.04), inset 0 1px 2px rgba(255, 255, 255, 0.95)';

    if (isInactive) {
      return {
        cardBg: whiteGlassBg,
        cardBorder: '1.5px solid rgba(203, 213, 225, 0.7)',
        cardShadow: whiteGlassShadow,
        tagBg: 'rgba(241, 245, 249, 0.85)',
        tagColor: '#64748B',
        tagBorder: '#CBD5E1',
        label: 'Inactive',
        accentColor: '#94A3B8',
        progressColor: '#94A3B8',
        editColor: '#94A3B8'
      };
    }
    switch (urgency) {
      case 'Urgent':
      case 'High':
        return {
          cardBg: whiteGlassBg,
          cardBorder: whiteGlassBorder,
          cardShadow: whiteGlassShadow,
          tagBg: 'rgba(254, 226, 226, 0.75)',
          tagColor: '#DC2626',
          tagBorder: '#FECACA',
          label: urgency === 'Urgent' ? '🚨 Urgent' : '⚡ High',
          accentColor: '#DC2626',
          progressColor: '#EF4444',
          editColor: '#DC2626'
        };
      case 'Medium':
        return {
          cardBg: whiteGlassBg,
          cardBorder: whiteGlassBorder,
          cardShadow: whiteGlassShadow,
          tagBg: 'rgba(254, 243, 199, 0.75)',
          tagColor: '#B45309',
          tagBorder: '#FDE68A',
          label: '⏳ Medium',
          accentColor: '#D97706',
          progressColor: '#F59E0B',
          editColor: '#D97706'
        };
      case 'Low':
      default:
        return {
          cardBg: whiteGlassBg,
          cardBorder: whiteGlassBorder,
          cardShadow: whiteGlassShadow,
          tagBg: 'rgba(220, 252, 231, 0.75)',
          tagColor: '#166534',
          tagBorder: '#86EFAC',
          label: '🌱 Low',
          accentColor: '#16A34A',
          progressColor: '#10B981',
          editColor: '#16A34A'
        };
    }
  };

  const getSortLabel = (s: string) => {
    switch (s) {
      case 'deadline': return 'Deadline';
      case 'urgency': return 'Urgency';
      case 'demand': return 'Demand';
      case 'stress': return 'Stress Level';
      default: return 'Deadline';
    }
  };

  const areaOptions: Array<{
    area: WorkloadArea;
    label: string;
    bg: string;
    border: string;
    color: string;
    shadow: string;
  }> = [
    {
      area: 'Self-Care',
      label: 'Self-Care',
      bg: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
      border: '1.5px solid #BAE6FD',
      color: '#0369A1',
      shadow: '0 4px 14px rgba(2, 132, 199, 0.28)',
    },
    {
      area: 'Social',
      label: 'Social',
      bg: 'linear-gradient(135deg, #FFF1F2 0%, #FECDD3 100%)',
      border: '1.5px solid #FECDD3',
      color: '#E11D48',
      shadow: '0 4px 14px rgba(225, 29, 72, 0.28)',
    },
    {
      area: 'Personal',
      label: 'Personal',
      bg: 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)',
      border: '1.5px solid #FDBA74',
      color: '#9A3412',
      shadow: '0 4px 14px rgba(234, 88, 12, 0.28)',
    },
    {
      area: 'Academic',
      label: 'Academic',
      bg: 'linear-gradient(135deg, #F3EEFD 0%, #E9D5FF 100%)',
      border: '1.5px solid #DDD6FE',
      color: '#7C3AED',
      shadow: '0 4px 14px rgba(124, 58, 237, 0.28)',
    }
  ];

  // Real 2026 Calendar Month Generator (Monday to Sunday)
  const getMonthWeeks = (mIdx: number) => {
    const monthNumber = [8, 9, 10, 11][mIdx] || 9; // 8=Aug, 9=Sep, 10=Oct, 11=Nov
    const year = 2026;
    const firstDayDate = new Date(year, monthNumber - 1, 1);
    // Convert Sunday=0 to Monday=0 (Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6)
    const firstDayOffset = (firstDayDate.getDay() + 6) % 7;
    const daysInCurrentMonth = new Date(year, monthNumber, 0).getDate();
    const daysInPreviousMonth = new Date(year, monthNumber - 1, 0).getDate();

    const allCells: Array<{ day: number; monthNum: number; isOther: boolean; isToday: boolean; dateStr: string }> = [];

    // 1. Previous month leading days
    for (let i = firstDayOffset - 1; i >= 0; i--) {
      const d = daysInPreviousMonth - i;
      const prevMonth = monthNumber - 1;
      const dateStr = `${year}-${prevMonth.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      allCells.push({
        day: d,
        monthNum: prevMonth,
        isOther: true,
        isToday: false,
        dateStr
      });
    }

    // 2. Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const isToday = monthNumber === 9 && d === 5;
      const dateStr = `${year}-${monthNumber.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      allCells.push({
        day: d,
        monthNum: monthNumber,
        isOther: false,
        isToday,
        dateStr
      });
    }

    // 3. Next month trailing days to complete 42 cells (6 rows x 7 cols)
    const remaining = 42 - allCells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = monthNumber + 1;
      const dateStr = `${year}-${nextMonth.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      allCells.push({
        day: d,
        monthNum: nextMonth,
        isOther: true,
        isToday: false,
        dateStr
      });
    }

    const weeks = [];
    for (let w = 0; w < 6; w++) {
      weeks.push({
        weekIdx: w,
        days: allCells.slice(w * 7, (w + 1) * 7)
      });
    }
    return weeks;
  };

  const getTasksForDate = (dateStr: string) => {
    return workloads.filter(w => {
      if (w.scheduledDate) {
        return w.scheduledDate === dateStr;
      }
      if (w.deadline) {
        return w.deadline.startsWith(dateStr);
      }
      return false;
    });
  };

  // Calendar Data & Helpers (September 2026: 30 days. Sep 1 is Tuesday, offset = 1)
  const daysInMonth = 30;
  const startDayOffset = 1;

  const monthlyEmotions: Record<number, string> = {
    1: 'Great', 2: 'Great', 3: 'All Good', 4: 'All Good',
    5: todayCheckIn?.emotionFeeling || 'Tense',
    6: 'Normal', 7: 'All Good', 8: 'Normal', 9: 'Normal', 10: 'Tense',
    11: 'Tense', 12: 'Great', 13: 'Normal', 14: 'Tense', 15: 'Overwhelmed',
    16: 'Tense', 17: 'Tense', 18: 'All Good', 19: 'Great', 20: 'Great',
    21: 'All Good', 22: 'Normal', 23: 'Normal', 24: 'Tense', 25: 'All Good',
    26: 'Great', 27: 'Great', 28: 'All Good', 29: 'Normal', 30: 'All Good'
  };

  const getTasksForDay = (day: number) => {
    return workloads.filter(w => {
      if (w.scheduledDate) {
        const dNum = parseInt(w.scheduledDate.split('-')[2], 10);
        return dNum === day;
      }
      const d = new Date(w.deadline);
      return d.getDate() === day;
    });
  };

  const handleGoogleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setIsGoogleSynced(true);
    }, 600);
  };

  const handleSaveScheduleEdit = () => {
    if (!editingScheduleTask) return;
    const target = workloads.find(w => w.id === editingScheduleTask.id);
    if (target) {
      updateWorkload({
        ...target,
        scheduledDate: editingScheduleTask.date,
        scheduledStartTime: editingScheduleTask.startTime,
        scheduledEndTime: editingScheduleTask.endTime,
        deadline: `${editingScheduleTask.date}T${editingScheduleTask.endTime}:00.000Z`
      });
    }
    setEditingScheduleTask(null);
  };

  // Week days around selectedDay
  const currentWeekStartDay = Math.max(1, selectedDay - 2);
  const weekDays = [0, 1, 2, 3, 4, 5, 6].map(i => {
    const d = currentWeekStartDay + i;
    return d <= 30 ? d : d - 30;
  });

  const renderWorkloadCard = (item: WorkloadItem, isInactive: boolean) => {
    const blockStyle = getUrgencyBlockStyle(item.urgency, isInactive);
    const areaIcon = getAreaIcon(item.area);
    const completedSubtasks = item.subtasks.filter(s => s.completed).length;
    const totalSubtasks = item.subtasks.length;
    const progressPct = totalSubtasks > 0
      ? Math.round((completedSubtasks / totalSubtasks) * 100)
      : (isInactive ? 100 : 0);
    const deadlineDate = new Date(item.deadline);
    const isExpanded = !!expandedTasks[item.id];

    return (
      <div
        key={item.id}
        style={{
          background: blockStyle.cardBg,
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          borderRadius: '22px',
          padding: '16px 18px 14px 18px',
          border: blockStyle.cardBorder,
          boxShadow: blockStyle.cardShadow,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          transition: 'all 0.2s ease',
          opacity: isInactive ? 0.82 : 1,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 800,
            color: isInactive ? '#94A3B8' : blockStyle.accentColor,
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            {areaIcon}
            {item.area}
          </span>

          <span style={{
            backgroundColor: blockStyle.tagBg,
            color: blockStyle.tagColor,
            border: `1px solid ${blockStyle.tagBorder}`,
            fontSize: '11px',
            fontWeight: 800,
            padding: '2.5px 10px',
            borderRadius: '12px'
          }}>
            {blockStyle.label}
          </span>
        </div>

        <div>
          <h4 style={{
            fontSize: '15px',
            fontWeight: 800,
            color: isInactive ? '#64748B' : Colors.textDark,
            lineHeight: 1.3,
            textDecoration: isInactive ? 'line-through' : 'none',
            margin: 0
          }}>
            {item.title}
          </h4>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '6px',
            marginTop: '6px',
            fontSize: '11.5px',
            color: isInactive ? '#94A3B8' : '#64748B'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Due: <b>{deadlineDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}</b></span>
            </div>

            <button
              onClick={(e) => toggleExpand(item.id, e)}
              style={{
                backgroundColor: isExpanded ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.75)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '12px',
                padding: '3px 9px',
                fontSize: '11px',
                fontWeight: 700,
                color: isExpanded ? blockStyle.accentColor : Colors.textDark,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
            >
              <span>Subtasks: <b>{completedSubtasks}/{totalSubtasks}</b></span>
              <ChevronDown
                size={13}
                strokeWidth={2.4}
                style={{
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  color: isExpanded ? blockStyle.accentColor : '#64748B'
                }}
              />
            </button>
          </div>
        </div>

        {isExpanded && item.subtasks.length > 0 && (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.88)',
            borderRadius: '14px',
            padding: '10px 12px',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            {item.subtasks.map(st => (
              <div
                key={st.id}
                onClick={() => toggleSubtask(item.id, st.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: st.completed ? '#94A3B8' : Colors.textDark,
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  border: st.completed ? '1px solid #10B981' : '1px solid #CBD5E1',
                  backgroundColor: st.completed ? '#10B981' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF'
                }}>
                  {st.completed && <Check size={12} strokeWidth={3} />}
                </div>
                <span style={{ textDecoration: st.completed ? 'line-through' : 'none' }}>{st.title}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: '2px', paddingBottom: '4px' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedWorkload(item);
              setIsWorkloadDetailOpen(true);
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px 4px',
              fontSize: '12px',
              fontWeight: 800,
              color: blockStyle.editColor,
              cursor: 'pointer'
            }}
          >
            Edit
          </button>
        </div>

        {/* Sleek progress line docked at the bottom of the card box */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4.5px',
          backgroundColor: 'rgba(0, 0, 0, 0.07)',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progressPct}%`,
            height: '100%',
            backgroundColor: blockStyle.progressColor,
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>
    );
  };

  const renderFloatingActionMenu = () => {
    const fabContent = (
      <>
        {isFabOpen && (
          <div
            onClick={() => setIsFabOpen(false)}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.28)',
              backdropFilter: 'blur(3px)',
              zIndex: 94,
            }}
          />
        )}

        <div style={{
          position: 'absolute',
          bottom: '92px',
          right: '20px',
          zIndex: 96,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '9px',
          pointerEvents: 'auto'
        }}>
          {isFabOpen && areaOptions.map((opt) => (
            <button
              key={opt.area}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setAddWorkloadInitialArea(opt.area);
                setIsAddWorkloadOpen(true);
                setIsFabOpen(false);
              }}
              style={{
                width: '124px',
                height: '38px',
                borderRadius: '19px',
                background: opt.bg,
                border: opt.border,
                color: opt.color,
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: opt.shadow,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              {opt.label}
            </button>
          ))}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFabOpen(!isFabOpen);
            }}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)',
              border: '2px solid rgba(251, 146, 60, 0.6)',
              color: '#9A3412',
              boxShadow: '0 8px 26px rgba(234, 88, 12, 0.4), 0 2px 8px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 97
            }}
            title={isFabOpen ? 'Close Menu' : 'Add New Task'}
          >
            <Plus
              size={28}
              strokeWidth={2.6}
              style={{
                transform: isFabOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            />
          </button>
        </div>
      </>
    );

    if (shellEl) {
      return createPortal(fabContent, shellEl);
    }
    return fabContent;
  };

  return (
    <div style={{ padding: '10px 18px 26px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* 1. TOP TITLE ROW */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 className="serif-title" style={{ fontSize: '24px', fontWeight: 600, color: Colors.textDark, letterSpacing: '-0.4px', margin: 0 }}>
            Workload
          </h2>
        </div>
      </div>

      {/* 2. TOP TWO TABS: CALENDAR vs WORKLOAD RECORDS (ALWAYS SAME SIZE, NO A) OR B)) */}
      <div style={{
        backgroundColor: 'rgba(241, 245, 249, 0.9)',
        borderRadius: '16px',
        padding: '4px',
        display: 'flex',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        width: '100%',
        boxSizing: 'border-box',
        gap: '4px'
      }}>
        <button
          type="button"
          onClick={() => setActiveWorkloadTab('calendar')}
          style={{
            flex: 1,
            width: '50%',
            borderRadius: '12px',
            padding: '9px 12px',
            border: 'none',
            backgroundColor: activeWorkloadTab === 'calendar' ? '#FFFFFF' : 'transparent',
            color: activeWorkloadTab === 'calendar' ? '#1E293B' : '#64748B',
            fontWeight: activeWorkloadTab === 'calendar' ? 800 : 600,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: activeWorkloadTab === 'calendar' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
        >
          <CalendarIcon size={15} color={activeWorkloadTab === 'calendar' ? '#F97316' : '#64748B'} />
          <span>Calendar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveWorkloadTab('records')}
          style={{
            flex: 1,
            width: '50%',
            borderRadius: '12px',
            padding: '9px 12px',
            border: 'none',
            backgroundColor: activeWorkloadTab === 'records' ? '#FFFFFF' : 'transparent',
            color: activeWorkloadTab === 'records' ? '#1E293B' : '#64748B',
            fontWeight: activeWorkloadTab === 'records' ? 800 : 600,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: activeWorkloadTab === 'records' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
        >
          <Layers size={15} color={activeWorkloadTab === 'records' ? '#8B5CF6' : '#64748B'} />
          <span>Workload Records</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB A: CALENDAR (GOOGLE CALENDAR STYLE WITH MONTH, WEEK & DAY DRILLDOWN)  */}
      {/* ========================================================================= */}
      {activeWorkloadTab === 'calendar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Google Calendar Sync Banner Card (Matching user picture design) */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 247, 237, 0.95) 0%, rgba(255, 237, 213, 0.75) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '26px',
            padding: '12px 18px',
            border: '1.5px solid #FED7AA',
            boxShadow: '0 4px 18px rgba(249, 115, 22, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            {/* Left: Google Calendar Icon + Text */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* White rounded badge with blue Google Calendar Icon */}
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                border: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  backgroundColor: '#3B82F6',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', backgroundColor: '#1D4ED8' }} />
                  <div style={{ position: 'absolute', top: '1px', left: '5px', width: '2px', height: '3px', borderRadius: '1px', backgroundColor: '#FFFFFF' }} />
                  <div style={{ position: 'absolute', top: '1px', right: '5px', width: '2px', height: '3px', borderRadius: '1px', backgroundColor: '#FFFFFF' }} />
                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#FFFFFF', marginTop: '4px', fontFamily: 'sans-serif' }}>
                    G
                  </span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.2px' }}>
                  Sync with Google Calendar?
                </span>
                <span style={{ fontSize: '11px', fontWeight: 500, color: '#64748B' }}>
                  Import your courses, schedules & deadlines
                </span>
              </div>
            </div>

            {/* Right: Sync Now Pill Button */}
            <button
              type="button"
              onClick={handleGoogleSync}
              disabled={isSyncing}
              style={{
                backgroundColor: isGoogleSynced ? '#DCFCE7' : '#FFEDD5',
                border: isGoogleSynced ? '1.5px solid #86EFAC' : '1.5px solid #FDBA74',
                borderRadius: '18px',
                padding: '7px 18px',
                fontSize: '12.5px',
                fontWeight: 800,
                color: isGoogleSynced ? '#166534' : '#9A3412',
                cursor: isSyncing ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 2px 8px rgba(249, 115, 22, 0.12)',
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
            >
              {isSyncing ? (
                <span>Syncing...</span>
              ) : isGoogleSynced ? (
                <>
                  <Check size={13} strokeWidth={3} />
                  <span>Synced</span>
                </>
              ) : (
                <span>Sync Now</span>
              )}
            </button>
          </div>

          {/* Calendar View Mode Switcher: Dropdown aligned to RIGHT SIDE */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '2px 2px 0 2px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <select
                value={calendarViewMode}
                onChange={(e) => setCalendarViewMode(e.target.value as any)}
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '14px',
                  padding: '7px 32px 7px 14px',
                  fontSize: '12px',
                  fontWeight: 800,
                  color: Colors.textDark,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  outline: 'none'
                }}
              >
                <option value="month">Month View</option>
                <option value="week">Week View</option>
                <option value="day">Day View</option>
                <option value="mood">Mood Calendar</option>
              </select>
              <ChevronDown size={14} color="#64748B" style={{ position: 'absolute', right: '10px', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 1. MONTH VIEW (Layout following Picture 1: Multi-day Spanning Bars, No Mood Emojis) */}
          {/* ========================================================================= */}
          {calendarViewMode === 'month' && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '16px 10px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
              border: '1.5px solid rgba(226, 232, 240, 0.9)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px 6px 4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setMonthIndex(prev => Math.max(0, prev - 1))}
                    style={{
                      background: '#F1F5F9',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: Colors.textDark,
                      transition: 'all 0.15s ease'
                    }}
                    title="Previous Month"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: Colors.textDark }}>
                    {months[monthIndex]}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMonthIndex(prev => Math.min(months.length - 1, prev + 1))}
                    style={{
                      background: '#F1F5F9',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: Colors.textDark,
                      transition: 'all 0.15s ease'
                    }}
                    title="Next Month"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                <span style={{ fontSize: '11px', color: Colors.textMuted, fontStyle: 'italic' }}>
                  Tap date for week view
                </span>
              </div>

              {/* Day Headers: Mon - Sun */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#64748B', paddingBottom: '4px' }}>
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span style={{ color: '#0D9488', fontWeight: 800 }}>Sat</span><span>Sun</span>
              </div>

              {/* 6 Weeks Grid with Real App Tasks from workloads matching exact 2026 calendar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', borderTop: '1px solid #F1F5F9' }}>
                {getMonthWeeks(monthIndex).map((wk) => (
                  <div
                    key={wk.weekIdx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: '#FAFAFA',
                      borderRadius: '12px',
                      padding: '4px 2px',
                      border: '1px solid #F1F5F9',
                      gap: '3px'
                    }}
                  >
                    {/* Day numbers in this week */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', alignItems: 'center' }}>
                      {wk.days.map((dObj, colIdx) => (
                        <div
                          key={colIdx}
                          onClick={() => {
                            setSelectedDay(dObj.day);
                            const targetWkIdx = weekDaysByRange.findIndex(w => w.some(d => d.dateStr === dObj.dateStr));
                            if (targetWkIdx !== -1) {
                              setWeekIndex(targetWkIdx);
                            }
                            setCalendarViewMode('week');
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '24px',
                            cursor: 'pointer'
                          }}
                          title={`Day ${dObj.day} - Click to switch to week view`}
                        >
                          {dObj.isToday ? (
                            <span style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              backgroundColor: '#0D9488',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: 800,
                              boxShadow: '0 2px 6px rgba(13, 148, 136, 0.35)'
                            }}>
                              {dObj.day}
                            </span>
                          ) : (
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: dObj.isOther ? '#CBD5E1' : '#334155'
                            }}>
                              {dObj.day}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Real app tasks for each day column in this week */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', minHeight: '16px', alignItems: 'flex-start' }}>
                      {wk.days.map((dObj, colIdx) => {
                        const dayTasks = getTasksForDate(dObj.dateStr);
                        return (
                          <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                            {dayTasks.map(t => {
                              const colorStyle = getAreaColor(t.area);
                              return (
                                <div
                                  key={t.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedWorkload(t);
                                    setIsWorkloadDetailOpen(true);
                                  }}
                                  style={{
                                    backgroundColor: colorStyle.bg,
                                    color: colorStyle.text,
                                    borderLeft: `2.5px solid ${colorStyle.dot}`,
                                    fontSize: '8px',
                                    fontWeight: 800,
                                    padding: '1.5px 3px',
                                    borderRadius: '4px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                  }}
                                  title={`${t.title} (${t.area})`}
                                >
                                  {t.title}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. WEEK VIEW (Layout following Picture 2: All-Day Banners + 7-Col Time Grid) */}
          {/* ========================================================================= */}
          {calendarViewMode === 'week' && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '16px 10px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
              border: '1.5px solid rgba(226, 232, 240, 0.9)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setWeekIndex(prev => Math.max(0, prev - 1))}
                    style={{
                      background: '#F1F5F9',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: Colors.textDark,
                      transition: 'all 0.15s ease'
                    }}
                    title="Previous Week"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span style={{ fontSize: '14.5px', fontWeight: 800, color: Colors.textDark }}>
                    {weekRanges[weekIndex]}
                  </span>
                  <button
                    type="button"
                    onClick={() => setWeekIndex(prev => Math.min(weekRanges.length - 1, prev + 1))}
                    style={{
                      background: '#F1F5F9',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: Colors.textDark,
                      transition: 'all 0.15s ease'
                    }}
                    title="Next Week"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                <span style={{ fontSize: '11px', color: Colors.textMuted }}>
                  Tap day column for Day View
                </span>
              </div>

              {/* 7-Day Header: Dynamic based on weekIndex matching 2026 calendar */}
              <div style={{ display: 'grid', gridTemplateColumns: '42px repeat(7, 1fr)', gap: '2px', alignItems: 'center' }}>
                <div />
                {(weekDaysByRange[weekIndex] || weekDaysByRange[0]).map((d, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setSelectedDay(d.num);
                      setCalendarViewMode('day'); // Tap day column to open Day View
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      cursor: 'pointer',
                      padding: '4px 0'
                    }}
                    title={`Day ${d.num} - Click for Day View`}
                  >
                    <span style={{ fontSize: '10px', color: d.isToday ? '#0D9488' : '#64748B', fontWeight: d.isToday ? 800 : 600 }}>
                      {d.name}
                    </span>
                    {d.isToday ? (
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#0D9488',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 800,
                        boxShadow: '0 2px 6px rgba(13, 148, 136, 0.35)'
                      }}>
                        {d.num}
                      </span>
                    ) : (
                      <span style={{ fontSize: '12px', fontWeight: 600, color: d.isOther ? '#94A3B8' : '#334155' }}>
                        {d.num}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* 7-Column Time Grid (10:00 to 23:00) with Time Indicator Line at 18:00 */}
              <div style={{
                borderTop: '1px solid #F1F5F9',
                paddingTop: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1px',
                maxHeight: '380px',
                overflowY: 'auto',
                paddingRight: '2px'
              }}>
                {['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'].map(hour => {
                  const isIndicatorRow = hour === '18:00';

                  return (
                    <div
                      key={hour}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '42px repeat(7, 1fr)',
                        gap: '2px',
                        minHeight: '34px',
                        alignItems: 'stretch',
                        position: 'relative'
                      }}
                    >
                      {/* Left Hour Label */}
                      <span style={{ fontSize: '10px', fontWeight: 600, color: '#94A3B8', paddingTop: '2px' }}>
                        {hour}
                      </span>

                      {/* 7 Day Columns */}
                      {(weekDaysByRange[weekIndex] || weekDaysByRange[0]).map((dObj, colIdx) => {
                        const dayNum = dObj.num;
                        const isTodayCol = dObj.isToday;
                        const dayTasks = getTasksForDate(dObj.dateStr);
                        const matched = dayTasks.find(t =>
                          t.scheduledStartTime && t.scheduledStartTime.startsWith(hour.slice(0, 2))
                        );

                        return (
                          <div
                            key={colIdx}
                            onClick={() => {
                              if (matched) {
                                setEditingScheduleTask({
                                  id: matched.id,
                                  title: matched.title,
                                  date: dObj.dateStr,
                                  startTime: matched.scheduledStartTime || hour,
                                  endTime: matched.scheduledEndTime || '12:00',
                                  area: matched.area
                                });
                              } else {
                                setSelectedDay(dayNum);
                                setCalendarViewMode('day');
                              }
                            }}
                            style={{
                              backgroundColor: isTodayCol ? '#F0FDFA' : '#FAFAFA',
                              borderRadius: '6px',
                              border: '1px solid #F1F5F9',
                              position: 'relative',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            {/* Current time indicator line on Sat 5 at 18:00 */}
                            {isTodayCol && isIndicatorRow && (
                              <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: 0,
                                right: 0,
                                display: 'flex',
                                alignItems: 'center',
                                zIndex: 10,
                                pointerEvents: 'none'
                              }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0F172A', marginLeft: '-3px' }} />
                                <div style={{ flex: 1, height: '1.5px', backgroundColor: '#0F172A' }} />
                              </div>
                            )}

                            {matched && (
                              <div style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: getAreaColor(matched.area).bg,
                                borderLeft: `3px solid ${getAreaColor(matched.area).dot}`,
                                borderRadius: '4px',
                                padding: '1px 3px',
                                overflow: 'hidden',
                                fontSize: '8px',
                                fontWeight: 800,
                                color: getAreaColor(matched.area).text,
                                lineHeight: '1.1'
                              }}>
                                {matched.title}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. DAY VIEW (Layout following Picture 3: Top All-Day Banner + Timeline)   */}
          {/* ========================================================================= */}
          {calendarViewMode === 'day' && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '16px 14px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
              border: '1.5px solid rgba(226, 232, 240, 0.9)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {/* Top Day Header: Dynamic Day Badge + <> Day Navigation */}
              {(() => {
                const selectedDateObj = new Date(2026, 8, selectedDay);
                const dayOfWeekShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][selectedDateObj.getDay()];
                const dayOfWeekFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedDateObj.getDay()];
                return (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: '#0D9488',
                        color: '#FFFFFF',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(13, 148, 136, 0.35)',
                        flexShrink: 0
                      }}>
                        <span style={{ fontSize: '8.5px', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1 }}>{dayOfWeekShort}</span>
                        <span style={{ fontSize: '15px', fontWeight: 900, lineHeight: 1 }}>{selectedDay}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedDay(prev => Math.max(1, prev - 1))}
                          style={{
                            background: '#F1F5F9',
                            border: 'none',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: Colors.textDark,
                            transition: 'all 0.15s ease'
                          }}
                          title="Previous Day"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <div>
                          <span style={{ fontSize: '15px', fontWeight: 800, color: Colors.textDark }}>
                            {dayOfWeekFull}, Sep {selectedDay}, 2026
                          </span>
                          <span style={{ display: 'block', fontSize: '11px', color: '#64748B' }}>
                            Daily Workload Schedule
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedDay(prev => Math.min(30, prev + 1))}
                          style={{
                            background: '#F1F5F9',
                            border: 'none',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: Colors.textDark,
                            transition: 'all 0.15s ease'
                          }}
                          title="Next Day"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Hourly Timeline with Current Time Indicator at 18:00 */}
              <div style={{
                borderTop: '1px solid #F1F5F9',
                paddingTop: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                maxHeight: '380px',
                overflowY: 'auto',
                paddingRight: '4px'
              }}>
                {['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'].map(hour => {
                  const dayTasks = getTasksForDay(selectedDay);
                  const matchedTask = dayTasks.find(t => (t.scheduledStartTime && t.scheduledStartTime.startsWith(hour.slice(0, 2))) || (hour === '10:00' && selectedDay === 5));
                  const is1800 = hour === '18:00';

                  return (
                    <div key={hour} style={{ display: 'flex', flexDirection: 'column', gap: '2px', minHeight: '38px', position: 'relative' }}>
                      {/* 18:00 Current Time Line Indicator */}
                      {is1800 && (
                        <div style={{
                          position: 'absolute',
                          top: '0',
                          left: '42px',
                          right: '0',
                          display: 'flex',
                          alignItems: 'center',
                          zIndex: 10,
                          pointerEvents: 'none'
                        }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0F172A', marginLeft: '-4px' }} />
                          <div style={{ flex: 1, height: '1.5px', backgroundColor: '#0F172A' }} />
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', width: '38px', paddingTop: '4px' }}>
                          {hour}
                        </span>

                        <div style={{ flex: 1, borderTop: '1px solid #F1F5F9', paddingTop: '4px' }}>
                          {matchedTask ? (
                            <div
                              onClick={() => setEditingScheduleTask({
                                id: matchedTask.id,
                                title: matchedTask.title,
                                date: `2026-09-${String(selectedDay).padStart(2, '0')}`,
                                startTime: matchedTask.scheduledStartTime || hour,
                                endTime: matchedTask.scheduledEndTime || '12:00',
                                area: matchedTask.area
                              })}
                              style={{
                                backgroundColor: getAreaColor(matchedTask.area).bg,
                                borderLeft: `4px solid ${getAreaColor(matchedTask.area).dot}`,
                                borderRadius: '10px',
                                padding: '8px 12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                              }}
                            >
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: 800, color: getAreaColor(matchedTask.area).text }}>
                                  {matchedTask.title}
                                </div>
                                <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
                                  {matchedTask.scheduledStartTime || hour} - {matchedTask.scheduledEndTime || '12:00'} • {matchedTask.area}
                                </div>
                              </div>
                              <Edit3 size={13} color={getAreaColor(matchedTask.area).text} />
                            </div>
                          ) : (
                            <div
                              onClick={() => {
                                setEditingScheduleTask({
                                  id: `new-${Date.now()}`,
                                  title: 'New Timeblock',
                                  date: `2026-09-${String(selectedDay).padStart(2, '0')}`,
                                  startTime: hour,
                                  endTime: `${parseInt(hour.slice(0, 2)) + 1}:00`,
                                  area: 'Academic'
                                });
                              }}
                              style={{
                                height: '28px',
                                border: '1px dashed #E2E8F0',
                                borderRadius: '8px',
                                cursor: 'pointer'
                              }}
                              title="Click to schedule workload at this hour"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. MOOD CALENDAR VIEW */}
          {calendarViewMode === 'mood' && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '16px 12px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
              border: '1.5px solid rgba(226, 232, 240, 0.9)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setMonthIndex(prev => Math.max(0, prev - 1))}
                    style={{
                      background: '#F1F5F9',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: Colors.textDark,
                      transition: 'all 0.15s ease'
                    }}
                    title="Previous Month"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: Colors.textDark }}>{months[monthIndex]} Mood Flow</span>
                    <span style={{ display: 'block', fontSize: '11px', color: Colors.textMuted }}>Daily check-in emotional records</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMonthIndex(prev => Math.min(months.length - 1, prev + 1))}
                    style={{
                      background: '#F1F5F9',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: Colors.textDark,
                      transition: 'all 0.15s ease'
                    }}
                    title="Next Month"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#FFF7ED', padding: '4px 8px', borderRadius: '10px' }}>
                  <CartoonEmoji mood={todayCheckIn?.emotionFeeling || 'All Good'} size={18} />
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#EA580C' }}>Today: {todayCheckIn?.emotionFeeling || 'All Good'}</span>
                </div>
              </div>

              {/* Day Headers Mo - Su */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '10.5px', fontWeight: 700, color: '#94A3B8' }}>
                <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
              </div>

              {/* 7-column Calendar Grid matching 2026 calendar */}
              {(() => {
                const currentMonthNum = [8, 9, 10, 11][monthIndex] || 9;
                const moodFirstDayOffset = (new Date(2026, currentMonthNum - 1, 1).getDay() + 6) % 7;
                const moodDaysInMonth = new Date(2026, currentMonthNum, 0).getDate();

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                    {Array.from({ length: moodFirstDayOffset }).map((_, idx) => (
                      <div key={`empty-mood-${idx}`} style={{ minHeight: '56px' }} />
                    ))}

                    {Array.from({ length: moodDaysInMonth }).map((_, idx) => {
                      const day = idx + 1;
                      const mood = monthlyEmotions[day] || 'All Good';
                      const isSelected = selectedDay === day;
                      const isToday = currentMonthNum === 9 && day === 5;

                      return (
                        <div
                          key={day}
                          onClick={() => {
                            setSelectedDay(day);
                          }}
                          style={{
                            minHeight: '62px',
                            backgroundColor: isSelected ? '#FFEDD5' : isToday ? '#FFF7ED' : '#FAFAFA',
                            borderRadius: '14px',
                            padding: '4px 2px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            border: isSelected ? '1.5px solid #FB923C' : isToday ? '1.5px solid #FB923C' : '1px solid #F1F5F9',
                            transition: 'all 0.15s ease'
                          }}
                          title={`Day ${day}: ${mood}`}
                        >
                          <span style={{ fontSize: '10px', fontWeight: isToday ? 900 : 600, color: isToday ? '#EA580C' : '#64748B' }}>
                            {day}
                          </span>
                          <CartoonEmoji mood={mood} size={26} />
                          <span style={{ fontSize: '8.5px', fontWeight: 700, color: isToday ? '#EA580C' : '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                            {mood}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB B: WORKLOAD RECORDS (LIST, SEARCH & DETAIL MODAL)                     */}
      {/* ========================================================================= */}
      {activeWorkloadTab === 'records' && (
        <>
          {/* FILTER DROPDOWN */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(12px)',
                border: '1.5px solid rgba(254, 215, 170, 0.8)',
                borderRadius: '20px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 700,
                color: Colors.textDark,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
            >
              <Filter size={13} color={Colors.peachText} />
              <span>Filter: <b>{statusFilter === 'All' ? getSortLabel(sortBy) : `${statusFilter} • ${getSortLabel(sortBy)}`}</b></span>
              <ChevronDown size={14} />
            </button>

            <span style={{ fontSize: '11.5px', color: Colors.textMuted }}>
              {processedWorkloads.length} workload{processedWorkloads.length === 1 ? '' : 's'} shown
            </span>

            {isFilterDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '38px',
                left: 0,
                backgroundColor: '#FFFFFF',
                borderRadius: '18px',
                border: '1.5px solid rgba(254, 215, 170, 0.9)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                padding: '10px 8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                zIndex: 100,
                minWidth: '185px'
              }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: Colors.peachText, textTransform: 'uppercase', padding: '2px 8px', marginBottom: '2px' }}>
                    Status Filter
                  </div>
                  {([
                    { id: 'All', label: 'All Workloads' },
                    { id: 'Active', label: 'Active Tasks' },
                    { id: 'Inactive', label: 'Inactive Status' }
                  ] as const).map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setStatusFilter(item.id);
                        setIsFilterDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        background: statusFilter === item.id ? 'rgba(255, 237, 226, 0.9)' : 'none',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '6px 10px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: statusFilter === item.id ? 800 : 500,
                        color: statusFilter === item.id ? Colors.peachText : Colors.textDark,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{item.label}</span>
                      {statusFilter === item.id && <Check size={13} color={Colors.peachText} />}
                    </button>
                  ))}
                </div>

                <div style={{ height: '1px', backgroundColor: 'rgba(254, 215, 170, 0.5)' }} />

                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: Colors.peachText, textTransform: 'uppercase', padding: '2px 8px', marginBottom: '2px' }}>
                    Sort By
                  </div>
                  {([
                    { id: 'deadline', label: 'Deadline' },
                    { id: 'urgency', label: 'Urgency' },
                    { id: 'demand', label: 'Demand' },
                    { id: 'stress', label: 'Stress Level' }
                  ] as const).map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSortBy(item.id);
                        setIsFilterDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        background: sortBy === item.id ? 'rgba(255, 237, 226, 0.9)' : 'none',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '6px 10px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: sortBy === item.id ? 800 : 500,
                        color: sortBy === item.id ? Colors.peachText : Colors.textDark,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{item.label}</span>
                      {sortBy === item.id && <Check size={13} color={Colors.peachText} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* WORKLOAD CARDS LIST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {processedWorkloads.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(12px)',
                borderRadius: '26px',
                border: '1.5px dashed rgba(226, 232, 240, 0.8)'
              }}>
                <Layers size={36} color={Colors.textMuted} style={{ marginBottom: '8px' }} />
                <p style={{ fontSize: '14px', fontWeight: 700, color: Colors.textDark }}>No workloads found</p>
                <p style={{ fontSize: '12px', color: Colors.textMuted, marginTop: '4px' }}>Try switching the filter or tap the + button to create a task</p>
              </div>
            ) : statusFilter === 'All' ? (
              <>
                {activeWorkloads.map(item => renderWorkloadCard(item, false))}

                {inactiveWorkloads.length > 0 && (
                  <>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: activeWorkloads.length > 0 ? '8px' : '0px',
                      marginBottom: '2px'
                    }}>
                      <div style={{ height: '1px', flex: 1, backgroundColor: 'rgba(203, 213, 225, 0.6)' }} />
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Inactive Workloads ({inactiveWorkloads.length})
                      </span>
                      <div style={{ height: '1px', flex: 1, backgroundColor: 'rgba(203, 213, 225, 0.6)' }} />
                    </div>

                    {inactiveWorkloads.map(item => renderWorkloadCard(item, true))}
                  </>
                )}
              </>
            ) : (
              processedWorkloads.map(item => renderWorkloadCard(item, isTaskInactive(item)))
            )}
          </div>
        </>
      )}

      {/* SCHEDULE TIMEBLOCK EDIT MODAL (Specification: timeblocks can be tapped, details viewed and editable) */}
      {editingScheduleTask && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(8px)',
          zIndex: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '26px',
            width: '100%',
            maxWidth: '360px',
            padding: '22px 20px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: Colors.textDark, margin: 0 }}>
                Edit Schedule Timeblock
              </h3>
              <button
                onClick={() => setEditingScheduleTask(null)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={15} color="#64748B" />
              </button>
            </div>

            <div style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B' }}>
              {editingScheduleTask.title}
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>Date</label>
              <input
                type="date"
                value={editingScheduleTask.date}
                onChange={(e) => setEditingScheduleTask({ ...editingScheduleTask, date: e.target.value })}
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', marginTop: '2px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>Start Time</label>
                <input
                  type="time"
                  value={editingScheduleTask.startTime}
                  onChange={(e) => setEditingScheduleTask({ ...editingScheduleTask, startTime: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', marginTop: '2px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>End Time</label>
                <input
                  type="time"
                  value={editingScheduleTask.endTime}
                  onChange={(e) => setEditingScheduleTask({ ...editingScheduleTask, endTime: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', marginTop: '2px' }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveScheduleEdit}
              style={{
                width: '100%',
                backgroundColor: '#166534',
                color: '#FFFFFF',
                borderRadius: '16px',
                padding: '11px',
                border: 'none',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                marginTop: '4px'
              }}
            >
              Save Timeblock
            </button>
          </div>
        </div>
      )}

      {/* FLOATING ACTION BUTTON (+) */}
      {renderFloatingActionMenu()}

    </div>
  );
};
