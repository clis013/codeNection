import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { WorkloadItem, WorkloadArea } from '../types/workload';
import { FixedBusyEvent } from '../types/calendar';
import { Colors } from '../theme/colors';
import { CartoonEmoji } from '../components/Common/CartoonEmoji';
import {
  Filter, Plus, ChevronDown, Check, BookOpen, Coffee, Users, Laptop, Layers,
  Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Edit3, X, Sparkles, CheckCircle2
} from 'lucide-react';

import { calculateDurationHours } from './BalanceView';

export const WorkloadDetailsView: React.FC = () => {
  const {
    workloads,
    busyEvents,
    setSelectedWorkload,
    setIsWorkloadDetailOpen,
    setIsAddWorkloadOpen,
    setAddWorkloadInitialArea,
    toggleSubtask,
    updateWorkload,
    setCustomSchedules,
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
  const [selectedDay, setSelectedDay] = useState<number>(8); // Default to Sept 8 (Demo Anchor)
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
  const [weekIndex, setWeekIndex] = useState(1); // Default to Week 1: Sep 7 - Sep 13 (contains Tue Sep 8 Demo Anchor)
  const [selectedBusyEvent, setSelectedBusyEvent] = useState<FixedBusyEvent | null>(null);

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
      { name: 'Sat', num: 5, isToday: false, dateStr: '2026-09-05' },
      { name: 'Sun', num: 6, isToday: false, dateStr: '2026-09-06' },
    ],
    // Week 1: Sep 7 - Sep 13, 2026 (Mon 7, Tue 8, Wed 9, Thu 10, Fri 11, Sat 12, Sun 13)
    [
      { name: 'Mon', num: 7, isToday: false, dateStr: '2026-09-07' },
      { name: 'Tue', num: 8, isToday: true, dateStr: '2026-09-08' },
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
      const isToday = monthNumber === 9 && d === 8;
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
    const remainingCells = 42 - allCells.length;
    const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
    for (let d = 1; d <= remainingCells; d++) {
      const dateStr = `${monthNumber === 12 ? year + 1 : year}-${nextMonth.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
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

  interface ScheduledEntry {
    task: WorkloadItem;
    blockId?: string;
    date: string;
    startTime: string;
    endTime: string;
    durationHours: number;
  }

  const getScheduledEntriesForDate = (dateStr: string): ScheduledEntry[] => {
    const entries: ScheduledEntry[] = [];
    workloads.forEach(t => {
      if (t.status === 'Completed') return;
      if (t.scheduledBlocks && t.scheduledBlocks.length > 0) {
        t.scheduledBlocks.forEach(b => {
          if (b.date === dateStr) {
            const startH = parseInt(b.startTime.slice(0, 2), 10);
            let endH = parseInt(b.endTime.slice(0, 2), 10);
            if (parseInt(b.endTime.slice(3, 5), 10) > 0) endH += 1;
            const dur = Math.max(0.5, b.durationHours || (endH - startH));
            entries.push({
              task: t,
              blockId: b.id,
              date: b.date,
              startTime: b.startTime,
              endTime: b.endTime,
              durationHours: dur
            });
          }
        });
      } else if (t.scheduledDate === dateStr && t.scheduledStartTime) {
        const startH = parseInt(t.scheduledStartTime.slice(0, 2), 10);
        let endH = t.scheduledEndTime ? parseInt(t.scheduledEndTime.slice(0, 2), 10) : startH + 1;
        if (t.scheduledEndTime && parseInt(t.scheduledEndTime.slice(3, 5), 10) > 0) endH += 1;
        const dur = Math.max(0.5, endH - startH);
        entries.push({
          task: t,
          date: t.scheduledDate,
          startTime: t.scheduledStartTime,
          endTime: t.scheduledEndTime || `${String(startH + 1).padStart(2, '0')}:00`,
          durationHours: dur
        });
      }
    });
    return entries;
  };

  const getTasksForDate = (dateStr: string) => {
    return workloads.filter(w => {
      if (w.scheduledBlocks && w.scheduledBlocks.some(b => b.date === dateStr)) {
        return true;
      }
      if (w.scheduledDate) {
        return w.scheduledDate === dateStr;
      }
      if (w.deadline) {
        return w.deadline.startsWith(dateStr);
      }
      return false;
    });
  };

  const getBusyEventsForDate = (dateStr: string): FixedBusyEvent[] => {
    return (busyEvents || []).filter(b => b.startDateTime.startsWith(dateStr));
  };

  // Calendar Data & Helpers (September 2026: 30 days. Sep 1 is Tuesday, offset = 1)
  const daysInMonth = 30;
  const startDayOffset = 1;

  // Exact Nicole Emotion History (Sep 1 to Sep 8)
  const monthlyEmotions: Record<number, string> = {
    1: 'All Good',
    2: 'All Good',
    3: 'Normal',
    4: 'Tense',
    5: 'Little Stressed',
    6: 'Tense',
    7: 'Overwhelmed',
    8: todayCheckIn?.emotionFeeling || 'Overwhelmed',
  };

  const getTasksForDay = (day: number) => {
    const dStr = `2026-09-${String(day).padStart(2, '0')}`;
    return workloads.filter(w => {
      if (w.scheduledBlocks && w.scheduledBlocks.some(b => b.date === dStr)) {
        return true;
      }
      if (w.scheduledDate) {
        const dNum = parseInt(w.scheduledDate.split('-')[2], 10);
        return dNum === day;
      }
      const d = new Date(w.deadline);
      return d.getDate() === day;
    });
  };

  const getBusyEventsForDay = (day: number): FixedBusyEvent[] => {
    return (busyEvents || []).filter(b => {
      if (!b.startDateTime.startsWith('2026-09-')) return false;
      const dayNum = parseInt(b.startDateTime.slice(8, 10), 10);
      return dayNum === day;
    });
  };

  const getShortWorkloadTitle = (title: string): string => {
    const lower = title.toLowerCase();
    if (lower.includes('operating system quiz') || lower.includes('os quiz')) return 'OS Quiz 1';
    if (lower.includes('web programming') || lower.includes('web prog')) return 'Web Prog';
    if (lower.includes('sponsorship') || lower.includes('sponsorship prep')) return 'TC Sponsor';
    if (lower.includes('tech carnival') && lower.includes('logistics')) return 'TC Logistics';
    if (lower.includes('tech carnival') && lower.includes('meeting')) return 'TC Meeting';
    if (lower.includes('tech carnival') && (lower.includes('prep') || lower.includes('event'))) return 'TC Event';
    if (lower.includes('fcg')) return 'FCG Test 1';
    if (lower.includes('philosophy')) return 'Philosophy';
    return title;
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
      const dur = calculateDurationHours(editingScheduleTask.startTime, editingScheduleTask.endTime);
      const updatedBlocks = (target.scheduledBlocks || []).map(b => {
        if (b.date === editingScheduleTask.date) {
          return {
            ...b,
            date: editingScheduleTask.date,
            startTime: editingScheduleTask.startTime,
            endTime: editingScheduleTask.endTime,
            durationHours: dur
          };
        }
        return b;
      });

      updateWorkload({
        ...target,
        scheduledDate: editingScheduleTask.date,
        scheduledStartTime: editingScheduleTask.startTime,
        scheduledEndTime: editingScheduleTask.endTime,
        scheduledBlocks: updatedBlocks.length > 0 ? updatedBlocks : target.scheduledBlocks,
        deadline: `${editingScheduleTask.date}T${editingScheduleTask.endTime}:00.000Z`
      });

      setCustomSchedules(prev => ({
        ...prev,
        [target.id]: {
          date: editingScheduleTask.date,
          startTime: editingScheduleTask.startTime,
          endTime: editingScheduleTask.endTime
        },
        [`${target.id}-1`]: {
          date: editingScheduleTask.date,
          startTime: editingScheduleTask.startTime,
          endTime: editingScheduleTask.endTime
        }
      }));
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
          {!isGoogleSynced && (
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
                  backgroundColor: '#FFEDD5',
                  border: '1.5px solid #FDBA74',
                  borderRadius: '18px',
                  padding: '7px 18px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  color: '#9A3412',
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
                ) : (
                  <span>Sync Now</span>
                )}
              </button>
            </div>
          )}

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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#64748B', paddingBottom: '4px' }}>
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span style={{ color: '#0D9488', fontWeight: 800 }}>Sat</span><span>Sun</span>
              </div>

              {/* 6 Weeks Grid with Real App Tasks from workloads matching exact 2026 calendar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', borderTop: '1px solid #F1F5F9' }}>
                {getMonthWeeks(monthIndex).map((wk) => (
                  <div
                    key={wk.weekIdx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                      gap: '4px',
                      padding: '2px 0'
                    }}
                  >
                    {wk.days.map((dObj, colIdx) => {
                      const dayTasks = getTasksForDate(dObj.dateStr);
                      return (
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
                            flexDirection: 'column',
                            minHeight: '52px',
                            minWidth: 0,
                            width: '100%',
                            overflow: 'hidden',
                            backgroundColor: dObj.isToday ? 'rgba(13, 148, 136, 0.05)' : '#FAFAFA',
                            border: dObj.isToday ? '1.5px solid rgba(13, 148, 136, 0.4)' : '1px solid #F1F5F9',
                            borderRadius: '10px',
                            padding: '4px 3px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            boxSizing: 'border-box'
                          }}
                          title={`Day ${dObj.day} - Click to switch to week view`}
                        >
                          {/* Day Number Header */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '20px',
                            marginBottom: '3px'
                          }}>
                            {dObj.isToday ? (
                              <span style={{
                                width: '20px',
                                height: '20px',
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

                          {/* Workload Due Dates (Google Calendar Style Event Pills) */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%', minWidth: 0, overflow: 'hidden' }}>
                            {dayTasks.map(t => {
                              const colorStyle = getAreaColor(t.area);
                              const shortTitle = getShortWorkloadTitle(t.title);
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
                                    borderLeft: `3px solid ${colorStyle.dot}`,
                                    borderTop: `1px solid ${colorStyle.border}`,
                                    borderRight: `1px solid ${colorStyle.border}`,
                                    borderBottom: `1px solid ${colorStyle.border}`,
                                    fontSize: '8px',
                                    fontWeight: 700,
                                    padding: '2px 3px',
                                    borderRadius: '4px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    minWidth: 0,
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                    lineHeight: '1.2'
                                  }}
                                  title={`📌 ${t.title} (Due: ${t.deadline ? t.deadline.slice(11, 16) : 'All Day'} • ${t.area})`}
                                >
                                  {shortTitle}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
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
              <div style={{ display: 'grid', gridTemplateColumns: '42px repeat(7, minmax(0, 1fr))', gap: '2px', alignItems: 'center' }}>
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

              {/* All-Day / Workload Due Row (Google Calendar Style) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '42px repeat(7, minmax(0, 1fr))',
                gap: '2px',
                padding: '4px 0',
                borderTop: '1px solid #F1F5F9',
                borderBottom: '1.5px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', paddingLeft: '4px' }}>
                  Due
                </span>
                {(weekDaysByRange[weekIndex] || weekDaysByRange[0]).map((dObj, colIdx) => {
                  const dayTasks = getTasksForDate(dObj.dateStr);
                  return (
                    <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, padding: '0 1px' }}>
                      {dayTasks.map(t => {
                        const colorStyle = getAreaColor(t.area);
                        const shortTitle = getShortWorkloadTitle(t.title);
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
                              borderLeft: `3px solid ${colorStyle.dot}`,
                              borderTop: `1px solid ${colorStyle.border}`,
                              borderRight: `1px solid ${colorStyle.border}`,
                              borderBottom: `1px solid ${colorStyle.border}`,
                              fontSize: '8px',
                              fontWeight: 700,
                              padding: '2px 3px',
                              borderRadius: '4px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              minWidth: 0,
                              width: '100%',
                              boxSizing: 'border-box',
                              cursor: 'pointer',
                              textAlign: 'left',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                            }}
                            title={`📌 ${t.title} (Due: ${t.deadline ? t.deadline.slice(11, 16) : 'All Day'} • ${t.area})`}
                          >
                            {shortTitle}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* 7-Column Time Grid (08:00 to 23:00) with Time Indicator Line at 18:00 */}
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
                {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'].map(hour => {
                  const isIndicatorRow = hour === '18:00';

                  return (
                    <div
                      key={hour}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '42px repeat(7, minmax(0, 1fr))',
                        gap: '2px',
                        height: '36px',
                        minHeight: '36px',
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
                        const curH = parseInt(hour.slice(0, 2), 10);

                        const dayEntries = getScheduledEntriesForDate(dObj.dateStr);
                        const matchedEntry = dayEntries.find(e => {
                          const sH = parseInt(e.startTime.slice(0, 2), 10);
                          let eH = parseInt(e.endTime.slice(0, 2), 10);
                          if (parseInt(e.endTime.slice(3, 5), 10) > 0) eH += 1;
                          return curH >= sH && curH < eH;
                        });
                        const isEntryStart = matchedEntry && matchedEntry.startTime.slice(0, 2) === hour.slice(0, 2);
                        const entryStartH = matchedEntry ? parseInt(matchedEntry.startTime.slice(0, 2), 10) : 0;
                        let entryEndH = matchedEntry ? parseInt(matchedEntry.endTime.slice(0, 2), 10) : 0;
                        if (matchedEntry && parseInt(matchedEntry.endTime.slice(3, 5), 10) > 0) entryEndH += 1;
                        const entrySpanHours = matchedEntry ? Math.max(1, entryEndH - entryStartH) : 1;

                        const dayTasks = getTasksForDate(dObj.dateStr);
                        const matchedDeadlineTask = !matchedEntry ? dayTasks.find(t =>
                          !t.scheduledStartTime && (!t.scheduledBlocks || t.scheduledBlocks.length === 0) && t.deadline && t.deadline.slice(11, 13) === hour.slice(0, 2)
                        ) : undefined;

                        const dayBusy = getBusyEventsForDate(dObj.dateStr);
                        const matchedBusy = dayBusy.find(b => {
                          const startH = parseInt(b.startDateTime.slice(11, 13), 10);
                          let endH = parseInt(b.endDateTime.slice(11, 13), 10);
                          if (parseInt(b.endDateTime.slice(14, 16), 10) > 0) endH += 1;
                          return curH >= startH && curH < endH;
                        });
                        const isBusyStart = matchedBusy && matchedBusy.startDateTime.slice(11, 13) === hour.slice(0, 2);
                        const startH = matchedBusy ? parseInt(matchedBusy.startDateTime.slice(11, 13), 10) : 0;
                        let endH = matchedBusy ? parseInt(matchedBusy.endDateTime.slice(11, 13), 10) : 0;
                        if (matchedBusy && parseInt(matchedBusy.endDateTime.slice(14, 16), 10) > 0) endH += 1;
                        const durationHours = matchedBusy ? Math.max(1, endH - startH) : 1;

                        return (
                          <div
                            key={colIdx}
                            onClick={() => {
                              if (matchedBusy) {
                                setSelectedBusyEvent(matchedBusy);
                              } else if (matchedEntry && isEntryStart) {
                                setEditingScheduleTask({
                                  id: matchedEntry.task.id,
                                  title: matchedEntry.task.title,
                                  date: matchedEntry.date,
                                  startTime: matchedEntry.startTime,
                                  endTime: matchedEntry.endTime,
                                  area: matchedEntry.task.area
                                });
                              } else if (matchedDeadlineTask) {
                                setSelectedWorkload(matchedDeadlineTask);
                                setIsWorkloadDetailOpen(true);
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
                              cursor: 'pointer',
                              height: '36px',
                              boxSizing: 'border-box'
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

                            {/* Render continuous fixed busy timeblock starting at its start hour */}
                            {matchedBusy && isBusyStart ? (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBusyEvent(matchedBusy);
                                }}
                                style={{
                                  position: 'absolute',
                                  top: '1px',
                                  left: '1px',
                                  right: '1px',
                                  height: `${durationHours * 36 + (durationHours - 1) * 2 - 2}px`,
                                  backgroundColor: '#EFF6FF',
                                  border: '1.5px solid #93C5FD',
                                  borderLeft: '3.5px solid #2563EB',
                                  borderRadius: '6px',
                                  padding: '3px 4px',
                                  overflow: 'hidden',
                                  zIndex: 15,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'flex-start',
                                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.12)',
                                  boxSizing: 'border-box'
                                }}
                                title={`📅 ${matchedBusy.startDateTime.slice(11, 16)}–${matchedBusy.endDateTime.slice(11, 16)} ${matchedBusy.title} (Fixed Commitment • ${durationHours}h)`}
                              >
                                <div style={{ fontSize: '8px', fontWeight: 900, color: '#1D4ED8', display: 'flex', alignItems: 'center', gap: '2px', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  <span>📅</span>
                                  <span>{matchedBusy.startDateTime.slice(11, 16)}–{matchedBusy.endDateTime.slice(11, 16)}</span>
                                </div>
                                <div style={{ fontSize: '8px', fontWeight: 800, color: '#1E293B', marginTop: '2px', lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: durationHours >= 3 ? 3 : 2, WebkitBoxOrient: 'vertical' }}>
                                  {matchedBusy.title}
                                </div>
                                {durationHours >= 2 && (
                                  <div style={{ fontSize: '7px', color: '#2563EB', marginTop: 'auto', fontWeight: 700 }}>
                                    {durationHours}h block
                                  </div>
                                )}
                              </div>
                            ) : !matchedBusy && matchedEntry && isEntryStart ? (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingScheduleTask({
                                    id: matchedEntry.task.id,
                                    title: matchedEntry.task.title,
                                    date: matchedEntry.date,
                                    startTime: matchedEntry.startTime,
                                    endTime: matchedEntry.endTime,
                                    area: matchedEntry.task.area
                                  });
                                }}
                                style={{
                                  position: 'absolute',
                                  top: '1px',
                                  left: '1px',
                                  right: '1px',
                                  height: `${entrySpanHours * 36 + (entrySpanHours - 1) * 2 - 2}px`,
                                  backgroundColor: getAreaColor(matchedEntry.task.area).bg,
                                  border: `1.5px solid ${getAreaColor(matchedEntry.task.area).border}`,
                                  borderLeft: `3.5px solid ${getAreaColor(matchedEntry.task.area).dot}`,
                                  borderRadius: '6px',
                                  padding: '3px 4px',
                                  overflow: 'hidden',
                                  zIndex: 14,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'flex-start',
                                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                                  boxSizing: 'border-box'
                                }}
                                title={`📌 ${matchedEntry.startTime}–${matchedEntry.endTime} ${matchedEntry.task.title} (${matchedEntry.durationHours}h)`}
                              >
                                <div style={{ fontSize: '8px', fontWeight: 900, color: getAreaColor(matchedEntry.task.area).text, display: 'flex', alignItems: 'center', gap: '2px', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  <span>📌</span>
                                  <span>{matchedEntry.startTime}–{matchedEntry.endTime}</span>
                                </div>
                                <div style={{ fontSize: '8px', fontWeight: 800, color: '#1E293B', marginTop: '2px', lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: entrySpanHours >= 3 ? 3 : 2, WebkitBoxOrient: 'vertical' }}>
                                  {matchedEntry.task.title}
                                </div>
                                <div style={{ fontSize: '7px', color: getAreaColor(matchedEntry.task.area).text, marginTop: 'auto', fontWeight: 700 }}>
                                  {matchedEntry.durationHours}h block
                                </div>
                              </div>
                            ) : !matchedBusy && !matchedEntry && matchedDeadlineTask ? (
                              <div style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: getAreaColor(matchedDeadlineTask.area).bg,
                                borderLeft: `3px solid ${getAreaColor(matchedDeadlineTask.area).dot}`,
                                borderRadius: '4px',
                                padding: '1px 3px',
                                overflow: 'hidden',
                                fontSize: '8px',
                                fontWeight: 800,
                                color: getAreaColor(matchedDeadlineTask.area).text,
                                lineHeight: '1.1',
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  📌 Due: {getShortWorkloadTitle(matchedDeadlineTask.title)}
                                </span>
                              </div>
                            ) : null}
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

              {/* Workload Due Today Banner (Google Calendar Style) */}
              {(() => {
                const dayDueTasks = getTasksForDay(selectedDay);
                if (dayDueTasks.length === 0) return null;
                return (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    padding: '8px 12px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>📌</span> Due Today:
                    </span>
                    {dayDueTasks.map(t => {
                      const colorStyle = getAreaColor(t.area);
                      const timeStr = t.deadline ? t.deadline.slice(11, 16) : '';
                      return (
                        <div
                          key={t.id}
                          onClick={() => {
                            setSelectedWorkload(t);
                            setIsWorkloadDetailOpen(true);
                          }}
                          style={{
                            backgroundColor: colorStyle.bg,
                            color: colorStyle.text,
                            borderLeft: `3.5px solid ${colorStyle.dot}`,
                            borderTop: `1px solid ${colorStyle.border}`,
                            borderRight: `1px solid ${colorStyle.border}`,
                            borderBottom: `1px solid ${colorStyle.border}`,
                            borderRadius: '8px',
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                          }}
                          title={`Click to view details for ${t.title}`}
                        >
                          <span>{t.title}</span>
                          {timeStr && <span style={{ opacity: 0.85, fontSize: '10px' }}>(Due {timeStr})</span>}
                        </div>
                      );
                    })}
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
                {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'].map(hour => {
                  const curH = parseInt(hour.slice(0, 2), 10);
                  const selectedDateStr = `2026-09-${String(selectedDay).padStart(2, '0')}`;
                  const dayEntries = getScheduledEntriesForDate(selectedDateStr);
                  const matchedDayEntry = dayEntries.find(e => {
                    const sH = parseInt(e.startTime.slice(0, 2), 10);
                    let eH = parseInt(e.endTime.slice(0, 2), 10);
                    if (parseInt(e.endTime.slice(3, 5), 10) > 0) eH += 1;
                    return curH >= sH && curH < eH;
                  });
                  const isEntryStart = matchedDayEntry && matchedDayEntry.startTime.slice(0, 2) === hour.slice(0, 2);
                  const entryStartH = matchedDayEntry ? parseInt(matchedDayEntry.startTime.slice(0, 2), 10) : 0;
                  let entryEndH = matchedDayEntry ? parseInt(matchedDayEntry.endTime.slice(0, 2), 10) : 0;
                  if (matchedDayEntry && parseInt(matchedDayEntry.endTime.slice(3, 5), 10) > 0) entryEndH += 1;
                  const entrySpanHours = matchedDayEntry ? Math.max(1, entryEndH - entryStartH) : 1;

                  const dayTasks = getTasksForDay(selectedDay);
                  const matchedDeadlineTask = !matchedDayEntry ? dayTasks.find(t =>
                    !t.scheduledStartTime && (!t.scheduledBlocks || t.scheduledBlocks.length === 0) && t.deadline && t.deadline.slice(11, 13) === hour.slice(0, 2)
                  ) : undefined;

                  const dayBusy = getBusyEventsForDay(selectedDay);
                  const matchedBusy = dayBusy.find(b => {
                    const startH = parseInt(b.startDateTime.slice(11, 13), 10);
                    let endH = parseInt(b.endDateTime.slice(11, 13), 10);
                    if (parseInt(b.endDateTime.slice(14, 16), 10) > 0) endH += 1;
                    return curH >= startH && curH < endH;
                  });
                  const isBusyStart = matchedBusy && matchedBusy.startDateTime.slice(11, 13) === hour.slice(0, 2);
                  const startH = matchedBusy ? parseInt(matchedBusy.startDateTime.slice(11, 13), 10) : 0;
                  let endH = matchedBusy ? parseInt(matchedBusy.endDateTime.slice(11, 13), 10) : 0;
                  if (matchedBusy && parseInt(matchedBusy.endDateTime.slice(14, 16), 10) > 0) endH += 1;
                  const durationHours = matchedBusy ? Math.max(1, endH - startH) : 1;
                  const is1800 = hour === '18:00';

                  return (
                    <div key={hour} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', height: '52px', minHeight: '52px', position: 'relative', boxSizing: 'border-box' }}>
                      {/* 18:00 Current Time Line Indicator */}
                      {is1800 && (
                        <div style={{
                          position: 'absolute',
                          top: '0',
                          left: '42px',
                          right: '0',
                          display: 'flex',
                          alignItems: 'center',
                          zIndex: 25,
                          pointerEvents: 'none'
                        }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0F172A', marginLeft: '-4px' }} />
                          <div style={{ flex: 1, height: '1.5px', backgroundColor: '#0F172A' }} />
                        </div>
                      )}

                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', width: '38px', paddingTop: '4px' }}>
                        {hour}
                      </span>

                      <div style={{ flex: 1, borderTop: '1px solid #F1F5F9', paddingTop: '2px', position: 'relative', height: '100%', boxSizing: 'border-box' }}>
                        {matchedBusy && isBusyStart ? (
                          <div
                            onClick={() => setSelectedBusyEvent(matchedBusy)}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              left: 0,
                              right: 0,
                              height: `${durationHours * 52 + (durationHours - 1) * 2 - 4}px`,
                              backgroundColor: '#EFF6FF',
                              border: '1.5px solid #93C5FD',
                              borderLeft: '4px solid #2563EB',
                              borderRadius: '12px',
                              padding: '10px 14px',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.12)',
                              zIndex: 20,
                              boxSizing: 'border-box'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                              <div>
                                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span>📅</span>
                                  <span>{matchedBusy.title}</span>
                                </div>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', marginTop: '2px' }}>
                                  {matchedBusy.startDateTime.slice(11, 16)} – {matchedBusy.endDateTime.slice(11, 16)} ({durationHours} {durationHours === 1 ? 'hour' : 'hours'})
                                </div>
                              </div>
                              <span style={{ fontSize: '10px', backgroundColor: '#DBEAFE', color: '#1D4ED8', padding: '2px 8px', borderRadius: '8px', fontWeight: 700, flexShrink: 0 }}>
                                Fixed Commitment
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748B', borderTop: '1px dashed #BFDBFE', paddingTop: '6px', marginTop: '6px' }}>
                              <span>Mock Calendar • Non-movable</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563EB', fontWeight: 600 }}>
                                <span>Subtracted from Free Time</span>
                                <CalendarIcon size={13} />
                              </div>
                            </div>
                          </div>
                        ) : matchedBusy && !isBusyStart ? (
                          /* Covered by continuous multi-hour block above - no duplicate block */
                          <div style={{ height: '100%' }} />
                        ) : matchedDayEntry && isEntryStart ? (
                          <div
                            onClick={() => {
                              setEditingScheduleTask({
                                id: matchedDayEntry.task.id,
                                title: matchedDayEntry.task.title,
                                date: matchedDayEntry.date,
                                startTime: matchedDayEntry.startTime,
                                endTime: matchedDayEntry.endTime,
                                area: matchedDayEntry.task.area
                              });
                            }}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              left: 0,
                              right: 0,
                              height: `${entrySpanHours * 52 + (entrySpanHours - 1) * 2 - 4}px`,
                              backgroundColor: getAreaColor(matchedDayEntry.task.area).bg,
                              border: `1.5px solid ${getAreaColor(matchedDayEntry.task.area).border}`,
                              borderLeft: `4px solid ${getAreaColor(matchedDayEntry.task.area).dot}`,
                              borderRadius: '12px',
                              padding: '10px 14px',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                              zIndex: 18,
                              boxSizing: 'border-box'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                              <div>
                                <div style={{ fontSize: '13.5px', fontWeight: 800, color: getAreaColor(matchedDayEntry.task.area).text, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span>📌</span>
                                  <span>{matchedDayEntry.task.title}</span>
                                </div>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginTop: '2px' }}>
                                  {matchedDayEntry.startTime} – {matchedDayEntry.endTime} ({matchedDayEntry.durationHours} {matchedDayEntry.durationHours === 1 ? 'hour' : 'hours'}) • {matchedDayEntry.task.area}
                                </div>
                              </div>
                              <span style={{ fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.85)', color: getAreaColor(matchedDayEntry.task.area).text, padding: '2px 8px', borderRadius: '8px', fontWeight: 700, flexShrink: 0 }}>
                                Scheduled
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748B', borderTop: '1px dashed #CBD5E1', paddingTop: '6px', marginTop: '6px' }}>
                              <span>Workload Balance Plan Block</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: getAreaColor(matchedDayEntry.task.area).text, fontWeight: 600 }}>
                                <Clock size={13} />
                                <span>Tap to Edit</span>
                              </div>
                            </div>
                          </div>
                        ) : matchedDayEntry && !isEntryStart ? (
                          <div style={{ height: '100%' }} />
                        ) : matchedDeadlineTask ? (
                          <div
                            onClick={() => {
                              setSelectedWorkload(matchedDeadlineTask);
                              setIsWorkloadDetailOpen(true);
                            }}
                            style={{
                              backgroundColor: getAreaColor(matchedDeadlineTask.area).bg,
                              borderLeft: `4px solid ${getAreaColor(matchedDeadlineTask.area).dot}`,
                              borderTop: `1px solid ${getAreaColor(matchedDeadlineTask.area).border}`,
                              borderRight: `1px solid ${getAreaColor(matchedDeadlineTask.area).border}`,
                              borderBottom: `1px solid ${getAreaColor(matchedDeadlineTask.area).border}`,
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
                              <div style={{ fontSize: '13px', fontWeight: 800, color: getAreaColor(matchedDeadlineTask.area).text, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span>📌</span>
                                <span>{matchedDeadlineTask.title}</span>
                              </div>
                              <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
                                Due: {matchedDeadlineTask.deadline ? matchedDeadlineTask.deadline.slice(11, 16) : 'End of day'} • {matchedDeadlineTask.area} • {matchedDeadlineTask.estimatedHours}h est
                              </div>
                            </div>
                            <span style={{ fontSize: '10px', fontWeight: 700, backgroundColor: 'rgba(255,255,255,0.7)', padding: '2px 8px', borderRadius: '6px', color: getAreaColor(matchedDeadlineTask.area).text }}>
                              Workload Due
                            </span>
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
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              opacity: 0.15,
                              transition: 'opacity 0.15s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.15'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                          >
                            <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>+ Schedule focus block</span>
                          </div>
                        )}
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
                  <CartoonEmoji mood={todayCheckIn?.emotionFeeling || 'Overwhelmed'} size={18} />
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#EA580C' }}>Today: {todayCheckIn?.emotionFeeling || 'Overwhelmed'}</span>
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
                      const mood = currentMonthNum === 9 ? monthlyEmotions[day] || 'Unchecked' : 'Unchecked';
                      const isSelected = selectedDay === day;
                      const isToday = currentMonthNum === 9 && day === 8;

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
                            {mood === 'Unchecked' ? '-' : mood}
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

      {/* FIXED BUSY EVENT DETAIL MODAL */}
      {selectedBusyEvent && (
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
            gap: '14px',
            border: '1.5px solid #E2E8F0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563EB'
                }}>
                  <CalendarIcon size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Fixed Calendar Event
                  </span>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {selectedBusyEvent.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedBusyEvent(null)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={15} color="#64748B" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#F8FAFC', padding: '12px 14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Date:</span>
                <span style={{ color: '#0F172A', fontWeight: 800 }}>{selectedBusyEvent.startDateTime.slice(0, 10)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Time:</span>
                <span style={{ color: '#0F172A', fontWeight: 800 }}>{selectedBusyEvent.startDateTime.slice(11, 16)} – {selectedBusyEvent.endDateTime.slice(11, 16)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Source:</span>
                <span style={{ color: '#2563EB', fontWeight: 800 }}>Mock Calendar</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Flexibility:</span>
                <span style={{ color: '#DC2626', fontWeight: 800 }}>Non-movable (Fixed)</span>
              </div>
            </div>

            <div style={{ fontSize: '11px', color: '#64748B', lineHeight: '1.4' }}>
              This event is part of your fixed busy schedule. During Candidate Time calculation, Restore subtracts this block so you are never scheduled during classes or meetings.
            </div>

            <button
              onClick={() => setSelectedBusyEvent(null)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '14px',
                border: 'none',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* FLOATING ACTION BUTTON (+) */}
      {renderFloatingActionMenu()}

    </div>
  );
};
