export interface FixedBusyEvent {
  id: string;
  title: string;
  startDateTime: string; // ISO 8601
  endDateTime: string;   // ISO 8601
  source: 'mock' | 'google' | 'manual';
  isMovable: boolean;
}

export interface ProtectedTime {
  id: string;
  title: string;
  type: 'sleep' | 'routine' | 'manual';
  source: 'mock' | 'manual';
  
  // For MVP, we can represent recurring sleep using a generic start time and end time (e.g. "23:30" to "07:30")
  isRecurring: boolean;
  recurringStartTime?: string; // HH:mm format
  recurringEndTime?: string;   // HH:mm format
  
  // For non-recurring explicit blocks
  startDateTime?: string; // ISO 8601
  endDateTime?: string;   // ISO 8601
}

export interface FocusBlock {
  id: string;
  workloadId: string;
  startDateTime: string; // ISO 8601
  endDateTime: string;   // ISO 8601
  status: 'planned' | 'completed' | 'missed';
  locked: boolean;
}

export interface CandidateTimeWindow {
  startDateTime: string; // ISO 8601
  endDateTime: string;   // ISO 8601
  durationMinutes: number;
}

export interface TimeResourceFacts {
  calendarDataAvailable: boolean;
  calendarDataSource: 'mock' | 'google' | 'manual';
  horizonStart: string; // ISO 8601
  horizonEnd: string;   // ISO 8601
  candidateWindowCount: number;
  candidateTimeHours: number;
}
