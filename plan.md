# Beating the Burnout 🫂
## Stress and Workload Manager
### Master Product, UX & Implementation Specification
### Humanreadable Plan — Updated September 2026

---

## Purpose of This Document

This is the complete human-readable product plan for **Beating the Burnout**.

It is the shared reference for:

- product understanding;
- UX/UI design;
- frontend prototype implementation;
- team handoff;
- hackathon explanation;
- future backend and AI integration.

This plan preserves the detailed product reasoning, feature definitions, data design, UX specification, analysis logic, edge cases, state behaviour, and MVP boundaries established throughout the project.

Later confirmed decisions override older wording where the two conflict.

The separate Antigravity Prototype Build Prompt is an **AI implementation instruction layer**. It explains how a coding agent should interpret this plan, but it does not replace this plan as the definition of the product.

---

# Table of Contents

## 1. Product Foundation

1.1 Product Problem, Goal & Positioning  
1.2 Core Product Questions  
1.3 Product Philosophy  
1.4 Evidence, Uncertainty & User Autonomy  
1.5 Source-of-Truth Rule  

## 2. Conceptual Model

2.1 Workload & Demand

Workload  
Cognitive, Emotional & Physical Demand  
Time Demand  

2.2 Stress & Stress Context

Perceived Stress  
Stress Source  
Stress–Load Mismatch  

2.3 Resources & Capacity

Energy  
Perceived Control  
Available Time  
Contextual Social Support  
Capacity  

2.4 Planning Concepts

Area  
Activity Type  
Subtask  
Planning / Focus Block  
Fixed / Busy Time  
Protected Rest  
Available Scheduling Time  

2.5 Required Conceptual Distinctions  

## 3. Global Product Rules

3.1 Data Availability & Missing Data  
3.2 Confirmation & Persistent Changes  
3.3 System Facts vs AI Interpretation  
3.4 Evidence Traceability & No Chained Assumptions  
3.5 Current State vs Historical State  
3.6 Recalculation, Freshness & Historical Stability  
3.7 User-Facing Language Rules  

## 4. Product Architecture & Navigation

4.1 Primary Product Areas  
4.2 Overall User Journey  
4.3 System Processing Flow  
4.4 AI Architecture  

Stress Dump AI  
Analysis AI  
Balance AI  

## 5. Daily Check-In & Personal State

5.1 Daily Check-In Input & Modal Flow  
5.2 Perceived Stress Scoring  
5.3 Stress Interpretation Bands  
5.4 Energy, Control & Emotion  
5.5 Current State Snapshot  
5.6 Personal Baseline  
5.7 Retest & Same-Day Record Behaviour  
5.8 Missing Check-In Behaviour  
5.9 Scientific Positioning  

## 6. AI Chatbot / Stress Dump

6.1 Purpose & Conversation Flow  
6.2 Information Extraction  
6.3 Conditional Extraction Review  
6.4 Grouped Editing & Confirmation  
6.5 Stress Factors, Workloads & Suggested Subtasks  
6.6 Confirmed Summary & Persistent Context  
6.7 24-Hour Conversation Lifecycle  
6.8 Post-Confirmation Analysis & Next Actions  
6.9 Failure & Rejected-Extraction Behaviour  

## 7. Workload & Calendar

7.1 Workload Data Model  
7.2 Workload Status & Lifecycle  
7.3 Subtasks & Progress  
7.4 Demand Profile  
7.5 Priority, Progress & Remaining Time  
7.6 Calendar Conceptual Model  
7.7 Planning / Focus Blocks  
7.8 Protected Rest  
7.9 Time Feasibility  
7.10 Google Calendar Integration  

## 8. Analysis Framework

8.1 Demand–Resource Relationships  
8.2 Multi-Workload Demand Analysis  
8.3 Manageable / Strained / Overloaded  
8.4 Main Constraints & Contributors  
8.5 Stress–Load Mismatch Detection  
8.6 Historical Analysis  
8.7 Sustained Strain  

## 9. Restore Balance

9.1 Balance Activation & Decision Framework  
9.2 Keep  
9.3 Move / Delay  
9.4 Reduce  
9.5 Remove  
9.6 Reconsider  
9.7 Recover  
9.8 Decision-Specific Plan Details & Editing  
9.9 Accept, Edit, Exclude & Apply  
9.10 Recommendation Freshness & Regeneration  
9.11 Balance Undo Window  

## 10. Page UI/UX Specification

10.1 Global UX Principles  

10.2 Home

Check-In  
Daily State & Load Insight  
Recovery  

10.3 Map

Overall Analysis Summary  
Stress–Load Mismatch  
Workload Area Distribution  
Demand Profile  
Resources  
Time Feasibility  
Restore Balance  

10.4 AI Chatbot

Conversation  
Conditional Extraction Review  
Grouped Editing  
Confirmation  
Analysis & Next Actions  

10.5 Workload

Calendar Tab  
Month View  
Week View  
Day View  
View Navigation  
Time-Block Details  
Workload Records Tab  
Workload Cards  
Subtasks  
Completed Workloads  

10.6 Balance

Recovery Area  
Decision Sections  
Recommendation Cards  
Decision-Specific Editing  
Apply Selected Actions  

## 11. Data Architecture & Processing

11.1 Data Layers  
11.2 User & Preferences  
11.3 Daily Check-In  
11.4 Stress Dump  
11.5 Workload & Subtasks  
11.6 Calendar & Planning Blocks  
11.7 Derived Analysis Data  
11.8 Historical Snapshots  
11.9 Balance Proposal & Undo Data  

## 12. State Transitions & Recalculation

12.1 Check-In Transitions  
12.2 Workload & Subtask Transitions  
12.3 Calendar Transitions  
12.4 Balance Application & Undo  
12.5 Analysis Refresh Triggers  
12.6 Balance AI Activation  
12.7 Stale Analysis & Recommendation Invalidation  

## 13. Edge Cases & Failure States

13.1 Missing or Incomplete Data  
13.2 Stress–Load Mismatch Cases  
13.3 Scheduling Edge Cases  
13.4 Subtask & Progress Edge Cases  
13.5 AI Failure  
13.6 Historical References  

## 14. Technical & MVP Architecture

14.1 Frontend-First Architecture  
14.2 Service Responsibilities  
14.3 MVP Product Loop  
14.4 Demo Scenario  
14.5 Success Criteria  

## 15. Guardrails, TBD & Future Work

15.1 Forbidden Metrics & Logic  
15.2 Coding-Agent Guardrails  
15.3 Explicit TBDs  
15.4 Future Work  

---

# 1. Product Foundation

## 1.1 Product Problem, Goal & Positioning

Students and other busy users often manage their responsibilities using calendars, task lists, deadlines, and productivity applications.

These systems are useful for answering:

> What do I need to do?

They are much weaker at answering:

> Can I realistically handle everything I am carrying right now?

A person can continue accepting work even when their available time, energy, control, or other resources are becoming insufficient.

At the same time, high workload does not always mean high stress, and high stress does not always mean that the visible workload is objectively impossible.

This creates a gap between:

- what the user has to handle;
- what those commitments demand;
- what resources the user currently has;
- how stressed the user actually feels;
- whether the current plan is sustainable.

**Beating the Burnout** is designed around that gap.

The product is not intended to maximize productivity.

It is not intended to diagnose burnout.

Its goal is:

> Create a realistic, sustainable plan where important and urgent work can be handled while respecting the user's current resources and making trade-offs visible.

The user remains in control of persistent Workload and Calendar changes.

---

## 1.2 Core Product Questions

The product should help the user answer:

### What am I carrying?

Represented by:

- Workloads;
- deadlines;
- Remaining Time;
- commitments;
- Stress Factors;
- Calendar constraints.

### What does my current load demand from me?

Represented by:

- Cognitive Demand;
- Emotional Demand;
- Physical Demand;
- Time Demand.

### What resources do I currently have?

Represented by:

- Energy;
- Perceived Control;
- Available Scheduling Time;
- contextual Social Support.

### How stressed do I currently feel?

Represented by the Daily Check-In.

### Does my current plan appear manageable?

Represented by:

- deterministic system facts;
- Demand–Resource Analysis;
- Manageable / Strained / Overloaded.

### What seems to be contributing most?

Represented through evidence-backed Analysis rather than simplistic workload size.

### What could change?

Represented through Restore Balance:

- Keep;
- Move / Delay;
- Reduce;
- Remove;
- Reconsider;
- Recover.

---

## 1.3 Product Philosophy

The app should not reduce a complex personal situation into one artificial score.

The design philosophy is:

> Make invisible load visible.

The system should:

- reveal constraints;
- distinguish facts from interpretation;
- make trade-offs understandable;
- acknowledge uncertainty;
- support Recovery;
- preserve user autonomy;
- help users make realistic decisions.

It should not:

- maximize scheduled work;
- imply that every free hour should be productive;
- assume high Stress automatically means Overload;
- hide scheduling problems simply because the user prefers a particular plan.

---

## 1.4 Evidence, Uncertainty & User Autonomy

The app must distinguish between:

### Known

Confirmed or deterministically derived information.

Example:

> 5 hours of work remain before Tuesday.

### Interpreted

An explanation based on multiple known signals.

Example:

> Your current strain appears mainly related to a tight deadline window combined with several cognitively demanding tasks.

### Suggested

A candidate action.

Example:

> Moving your lower-priority reading task to Thursday may free two hours before Tuesday.

### Unknown

Information the app does not currently know.

Example:

> Remaining Time has not been estimated.

Unknown data must remain unknown unless a defined fallback exists.

The system must not fabricate completeness.

The user remains the final decision-maker.

---

## 1.5 Source-of-Truth Rule

The product should preserve this hierarchy:

1. confirmed user data;
2. deterministic system facts;
3. AI interpretation;
4. AI recommendations;
5. user-confirmed persistent changes.

AI does not become authoritative simply because it generated an interpretation.

Persistent user-confirmed information takes precedence over AI assumptions.

---

# 2. Conceptual Model

## 2.1 Workload & Demand

### Workload

A **Workload** is something the user has to handle.

Examples:

- Database Assignment;
- Club Event;
- Laundry;
- Presentation;
- Personal Errand.

A Workload is not itself a Demand score.

### Cognitive, Emotional & Physical Demand

Demand describes what a Workload requires from the user.

MVP Demand dimensions:

- Cognitive Demand;
- Emotional Demand;
- Physical Demand.

Each uses:

**Low | Moderate | High**

Example:

**Database Assignment**

- Cognitive: High
- Emotional: Moderate
- Physical: Low

### Time Demand

Time-related pressure is handled separately.

It comes from objective planning information such as:

- Remaining Time;
- deadline;
- urgency;
- Calendar availability;
- Fixed/Busy commitments;
- existing Focus Blocks;
- Protected Rest.

The user does not manually rate a separate Time Pressure score.

---

## 2.2 Stress & Stress Context

### Perceived Stress

Perceived Stress answers:

> How stressed do I feel right now?

It comes from Daily Check-In.

### Stress Source

Stress Source answers:

> What is making me stressed?

It may come from confirmed Stress Dump context.

A Stress Source is not automatically a Workload.

Examples:

- uncertainty;
- conflict;
- family concern;
- group members not contributing;
- fear of poor performance.

### Stress–Load Mismatch

Perceived Stress and recorded load may disagree.

This disagreement can itself be useful information.

Two strong mismatch cases are supported:

1. High / Very High Stress + Manageable recorded load.
2. Normal Stress + Overloaded recorded load.

Mismatch is discussed further in Chapter 8.

---

## 2.3 Resources & Capacity

### Energy

Current Energy comes from Daily Check-In Q6.

### Perceived Control

Current Perceived Control comes from Daily Check-In Q2.

### Available Time

Available Time means **Available Scheduling Time**, not simply visually empty Calendar space.

### Contextual Social Support

Social Support remains contextual for MVP.

Example:

> Group members are not helping with this assignment.

Do not convert this into a global:

`Social Support = 2/5`

### Capacity

Capacity is an umbrella concept describing the resources available to handle Demand.

Do not calculate:

- Capacity Score;
- Capacity Percentage;
- mandatory Capacity Status.

Keep the underlying resource signals visible.

---

## 2.4 Planning Concepts

### Area

Area answers:

> Where does this Workload belong?

Examples:

- Academic;
- Personal;
- Social;
- Self-care.

### Activity Type

Activity Type answers:

> What kind of activity is this?

Examples:

- Deep Focus;
- Communication;
- Creative;
- Physical.

Area and Activity Type are different.

### Subtask

A Subtask is a smaller piece of one Workload.

Example:

Database Assignment:

- ERD;
- SQL;
- PHP;
- Report.

### Planning / Focus Block

A Focus Block is Calendar time allocated for planned work.

It may reference a Workload but is an independent Calendar object.

### Fixed / Busy Time

Time already unavailable for normal scheduling.

Examples:

- classes;
- meetings;
- appointments;
- imported Google Calendar events.

### Protected Rest

Protected Rest is a scheduling rule representing time the system should not automatically use for Workload scheduling.

**MVP default: 00:00–04:00 every day.**

Protected Rest is not a visible Calendar appointment.

### Available Scheduling Time

Time remaining after accounting for:

- Fixed/Busy Time;
- Protected Rest;
- relevant Calendar constraints.

---

## 2.5 Required Conceptual Distinctions

Always preserve:

| Concept | Must remain distinct from |
|---|---|
| Workload | Demand |
| Perceived Stress | Stress Source |
| Area | Activity Type |
| Activity Type | Demand |
| Current Stress | Personal Baseline Comparison |
| Empty Calendar Time | Available Scheduling Time |
| Available Scheduling Time | Protected Rest |
| Workload | Focus Block |
| Workload | Subtask |
| Focus Block | Completed Work |
| Progress | Remaining Time |
| Dominant Workload Area | Main Source of Strain |
| Acute Current Strain | Sustained Historical Strain |
| Manage-Demand Actions | Recover |
| System Fact | AI Interpretation |
| AI Interpretation | AI Recommendation |
| Proposed Change | Confirmed Change |
| Balance Remove | Deleting Historical Evidence |

---

# 3. Global Product Rules

## 3.1 Data Availability & Missing Data

The app must never substitute missing information with convenient assumptions.

Examples:

### No Check-In today

Today's subjective state is unknown.

Do not reuse yesterday's:

- Stress;
- Energy;
- Emotion;
- Perceived Control.

### Missing Remaining Time

Do not calculate precise time feasibility.

### No confirmed Stress Factor

Do not invent one.

### Insufficient history

Do not display Personal Baseline or Sustained Strain as though enough evidence exists.

Missing is a valid system state.

---

## 3.2 Confirmation & Persistent Changes

Persistent AI-generated changes require:

```text
AI proposes/extracts
↓
user reviews
↓
user edits if needed
↓
user confirms
↓
persistent mutation
```

This applies to:

- extracted Workloads;
- Workload updates;
- suggested Subtasks;
- persistent Stress Factors;
- Balance actions;
- Calendar scheduling changes.

System calculations and non-persistent AI explanations do not require confirmation.

---

## 3.3 System Facts vs AI Interpretation

### System Facts

Deterministically calculated from structured data.

Examples:

- Stress Score;
- Stress Category;
- baseline comparison;
- Energy Category;
- Control Category;
- Available Scheduling Time;
- deadline-window feasibility;
- Workload distribution;
- Demand distribution;
- mismatch evidence;
- Sustained Strain trigger evidence.

### AI Interpretation

Explains relationships between facts.

Example:

> Your plan appears strained mainly because the work due before Tuesday exceeds the time currently available, while your Energy is also Low.

### AI Recommendation

Suggests possible changes.

Example:

> Move your flexible reading task to Thursday.

These layers must remain separate.

---

## 3.4 Evidence Traceability & No Chained Assumptions

An interpretation should be traceable to known evidence.

Avoid chains such as:

> Academic is the largest Workload Area → therefore Academic is stressful → therefore the user is overloaded.

Instead:

> Academic is the dominant Workload Area.

Then examine other evidence before claiming it is a major contributor.

AI-generated interpretation must not become new evidence merely because it was previously generated.

---

## 3.5 Current State vs Historical State

Current state is live and recalculable.

Historical state represents what the system actually knew on a previous observed day.

Historical snapshots must not be reconstructed from current Workloads.

---

## 3.6 Recalculation, Freshness & Historical Stability

Meaningful confirmed changes may make current Analysis stale.

Examples:

- Check-In saved/retested;
- Workload created/edited/completed/reopened;
- Remaining Time changed;
- Demand changed;
- Focus Block moved;
- Protected Rest changed;
- confirmed Stress Dump information saved;
- Balance action applied.

Relevant deterministic facts and Analysis should then refresh.

Opening Map alone does not require new Analysis when the underlying state has not changed.

Past historical snapshots remain immutable.

---

## 3.7 User-Facing Language Rules

Prefer:

> You need about 4 more hours than you currently have available before Tuesday.

Instead of:

> Time deficit = 4h.

Prefer:

> Your recent pattern shows sustained strain.

Instead of:

> You have burnout.

Prefer:

> Academic makes up most of your current recorded workload.

Instead of:

> Academic is causing your stress.

The product should be:

- explanatory;
- non-diagnostic;
- evidence-based;
- understandable;
- non-alarmist.

---

# 4. Product Architecture & Navigation

## 4.1 Primary Product Areas

Primary product areas:

- Home;
- Map;
- AI Chatbot / Stress Dump;
- Workload;
- Balance.

Workload contains:

- Calendar;
- Workload Records.

Recovery is contextual rather than a separate primary analytics destination.

---

## 4.2 Overall User Journey

A typical journey may be:

```text
User feels overwhelmed
↓
Stress Dump and/or Daily Check-In
↓
Confirmed structured information
↓
System calculates facts
↓
Analysis evaluates Demand and Resources
↓
Home summarizes current state
↓
Map explains what is happening and why
↓
Restore Balance
↓
Candidate actions
↓
User reviews / edits / confirms
↓
Workload / Calendar changes
↓
Analysis refreshes
```

The user does not need to follow this exact sequence every time.

---

## 4.3 System Processing Flow

```text
RAW INPUT
↓
CONFIRMED STRUCTURED DATA
↓
DERIVED SYSTEM FACTS
↓
AI INTERPRETATION
↓
AI RECOMMENDATIONS
↓
USER CONFIRMATION
↓
PERSISTENT MUTATION
```

This boundary is fundamental.

---

## 4.4 AI Architecture

### Stress Dump AI

Responsible for:

- conversation;
- contextual understanding;
- candidate extraction;
- proposed structured updates.

### Analysis AI

Responsible for:

- interpreting deterministic facts;
- contextualizing confirmed information;
- explaining contributors and constraints;
- interpreting recent patterns.

### Balance AI

Responsible for:

- proposing candidate actions;
- explaining trade-offs;
- suggesting schedule/scope changes.

There is no separate Map AI.

Map consumes Analysis.

---

# 5. Daily Check-In & Personal State

## 5.1 Daily Check-In Input & Modal Flow

Questions:

1. How stressed do you feel right now?
2. How much control do you feel you have over your day?
3. How mentally demanding has your day been?
4. How capable do you feel of handling your current workload?
5. What best describes how you feel right now?
6. How much energy do you have right now?

Use a focused modal-card flow.

Intermediate action:

**Next**

Final action:

**Finish & Save**

---

## 5.2 Perceived Stress Scoring

Q1–Q4 use 1–5.

Q2 and Q4 are reverse-scored.

```text
Q2 reversed = 6 - Q2
Q4 reversed = 6 - Q4

Daily Perceived Stress Score
= Q1 + (6-Q2) + Q3 + (6-Q4)
```

Range:

**4–20**

---

## 5.3 Stress Interpretation Bands

| Score | Interpretation |
|---|---|
| 4–10 | Normal |
| 11–13 | Elevated |
| 14–16 | High |
| 17–20 | Very High |

These are application-defined prototype interpretation bands.

They are not clinical cut-offs.

---

## 5.4 Energy, Control & Emotion

### Perceived Control

Retain Q2 in its original direction.

| Score | Category |
|---|---|
| 1–2 | Low |
| 3 | Moderate |
| 4–5 | Good |

### Energy

| Score | Category |
|---|---|
| 1–2 | Low |
| 3 | Moderate |
| 4–5 | Good |

### Emotion

Emotion is used for:

- history;
- Calendar markers;
- visualization;
- AI context.

Emotion is not part of Stress Score.

---

## 5.5 Current State Snapshot

After Finish & Save, show a Current State Snapshot.

It may include:

- Current Stress;
- Energy;
- Perceived Control;
- Emotion;
- Personal Baseline comparison when available.

This is the user's saved current subjective state.

It should not independently calculate Demand–Resource Status.

---

## 5.6 Personal Baseline

Personal Baseline uses the user's **previous 30 completed Daily Check-In records, excluding today**.

It does not use 30 calendar days.

Missing days are ignored.

At least 30 prior completed records are required.

```text
Baseline Average
= mean of Stress Score from previous
30 completed Check-In records
```

Comparison:

| Difference | Interpretation |
|---|---|
| within ±2 | Typical for you |
| +3 to +5 | Higher than usual |
| +6 or more | Significantly higher |
| −3 or lower | Lower than usual |

Baseline Comparison and Stress Category remain separate.

---

## 5.7 Retest & Same-Day Record Behaviour

Only one official Check-In exists per calendar day.

If the user returns after completing today's Check-In:

show the saved snapshot first.

Actions:

- **Retest**
- **Back to home**

Retest reruns all six questions.

Saving the Retest replaces/updates today's official record.

It does not create another official daily Check-In.

---

## 5.8 Missing Check-In Behaviour

No Check-In today means subjective current state is unavailable.

Objective Workload/Calendar analysis may still continue.

Do not use yesterday as today's state.

---

## 5.9 Scientific Positioning

Daily Check-In is a prototype adaptation informed by perceived-stress/workload concepts.

The app must not present:

- Stress bands as validated clinical thresholds;
- Sustained Strain as burnout diagnosis;
- Daily Check-In as a medical assessment.

Scientific validation remains future work.

---

# 6. AI Chatbot / Stress Dump

## 6.1 Purpose & Conversation Flow

Stress Dump allows users to explain their situation naturally before forcing it into structured fields.

Input may be:

- text;
- voice where supported.

Flow:

```text
Conversation
↓
AI response
↓
Candidate extraction
↓
Review / edit
↓
Confirmation
↓
Structured save
↓
Analysis refresh
↓
Next action
```

---

## 6.2 Information Extraction

AI may detect:

### Stress Factor

Possible information:

- source;
- reason;
- effect;
- related Workload;
- Demand context;
- main concern.

### Possible Workload

Possible information:

- name;
- Area;
- Activity Type;
- deadline;
- flexibility;
- Remaining Time;
- Demand;
- suggested Subtasks.

### Existing Workload Update

AI may identify information that appears related to an existing Workload.

### Contextual Resource Concern

Example:

> My group members are not helping.

This may be stored contextually.

Do not convert it into a global Social Support score.

---

## 6.3 Conditional Extraction Review

Only show extraction categories actually detected.

If AI detects only:

- one Stress Factor;
- one Workload update;

do not display empty sections for every other possible schema.

If a required field is missing before a record can be saved, ask for it explicitly.

Optional unknown fields remain unknown.

---

## 6.4 Grouped Editing & Confirmation

The user should be able to review extracted information in logical groups.

Possible actions:

- edit;
- confirm;
- remove incorrect extraction;
- reject.

Avoid requiring one modal per extracted field.

Reuse familiar Workload editing patterns where appropriate.

---

## 6.5 Stress Factors, Workloads & Suggested Subtasks

AI may suggest new Workloads or Subtasks.

Suggested Subtasks remain proposals until confirmed.

For an existing Workload:

```text
AI identifies likely match
↓
user verifies relationship
↓
AI shows proposed update
↓
user reviews
↓
user confirms
↓
update
```

Never silently merge.

---

## 6.6 Confirmed Summary & Persistent Context

Confirmed structured information may persist beyond the raw chat session.

This can include:

- Stress Factors;
- Workload relationships;
- confirmed Workloads;
- Workload updates;
- contextual resource concerns;
- confirmed Subtasks.

Only confirmed information may enter structured analytical evidence.

---

## 6.7 24-Hour Conversation Lifecycle

The raw Stress Dump conversation is retained as **one session for 24 hours from session creation**.

It is not 24 hours per message.

During the valid window the user may:

- leave;
- reopen;
- continue.

After expiry:

- raw conversation may be removed;
- confirmed structured information persists.

Frontend MVP may check timestamps on load/access.

No background cron is required.

---

## 6.8 Post-Confirmation Analysis & Next Actions

After confirmation:

```text
confirmed structured information
↓
deterministic facts recalculate
↓
Analysis refreshes
↓
chatbot provides conclusion / next step
```

Possible actions:

- Understand My Load → Map;
- Restore Balance → Balance;
- Recovery when relevant.

Do not end with a generic `Done → Home`.

---

## 6.9 Failure & Rejected-Extraction Behaviour

If extraction fails:

- preserve valid raw conversation while session remains active;
- allow retry;
- do not fabricate extraction.

Rejected/unconfirmed extraction must not enter:

- Workload;
- Analysis;
- historical evidence.

---

# 7. Workload & Calendar

## 7.1 Workload Data Model

A Workload may contain:

```text
workload_id
name
area
activity_type
status
progress_percent
deadline
urgency
importance
flexibility
estimated_total_time
remaining_time
cognitive_demand
emotional_demand
physical_demand
scope_note?
subtasks[]
```

---

## 7.2 Workload Status & Lifecycle

Core statuses include:

- Active;
- Completed.

Completed Workloads:

- remain visible but de-emphasized;
- remain editable;
- are excluded from active Analysis;
- are excluded from current planning;
- are excluded from Balance;
- may be reopened.

Balance Remove has a separate 24-hour undo lifecycle described in Chapter 9.

---

## 7.3 Subtasks & Progress

Subtasks are nested under Workloads.

Users may:

- add;
- edit;
- delete;
- complete;
- uncomplete.

For MVP, Subtasks have equal weight.

```text
progress_percent
= completed_subtasks / total_subtasks × 100
```

Example:

5 Subtasks  
3 complete  
→ 60%

If no Subtasks exist, do not fabricate Subtask-derived progress.

---

## 7.4 Demand Profile

Demand dimensions:

- Cognitive;
- Emotional;
- Physical.

Values:

- Low;
- Moderate;
- High.

Demand may originate from:

- user input;
- AI suggestion;
- confirmed Stress Dump extraction.

Confirmed values are authoritative until another change is reviewed and confirmed.

---

## 7.5 Priority, Progress & Remaining Time

### Priority

Priority is a planning judgement influenced by:

- deadline;
- urgency;
- importance;
- flexibility;
- resources;
- feasibility.

Do not create a numeric Priority score.

### Progress

Progress describes Subtask completion.

### Remaining Time

Remaining Time describes estimated work still required.

These are separate.

Never infer:

> 60% complete → 40% of time remains.

Progress does not affect:

- Remaining Time;
- scheduling;
- feasibility;
- Demand;
- Balance;
- Demand–Resource Status.

---

## 7.6 Calendar Conceptual Model

Calendar contains:

```text
Fixed / Busy Time
+
Protected Rest scheduling rule
+
Planning / Focus Blocks
+
Available Scheduling Time
```

Calendar answers:

> What is happening or planned at this time/date?

Map answers:

> What does the pattern mean?

---

## 7.7 Planning / Focus Blocks

A Focus Block is a global Calendar object.

It may optionally reference:

`planned_workload_id`

It is not structurally owned by a Workload.

An elapsed Focus Block does not automatically:

- complete work;
- complete a Subtask;
- increase progress;
- reduce Remaining Time.

Completing a Workload does not automatically delete unrelated Focus Blocks.

If work finishes early, remaining scheduled time stays available for reassignment.

---

## 7.8 Protected Rest

### Default

**00:00–04:00**

This replaces the older single 12:00 AM boundary interpretation.

Protected Rest:

- reduces Available Scheduling Time;
- is not rendered as a visible Calendar block;
- should not receive automatically proposed Focus Blocks.

If the preference is missing, use:

**00:00–04:00**

Do not assume 24-hour availability.

After 04:00 does not mean the system recommends working.

It only means the hard-protected default window has ended.

Actual availability still depends on Calendar constraints.

MVP does not automatically protect:

- lunch;
- generic breaks;
- other rest periods.

Later manual scheduling inside Protected Rest may warn the user rather than permanently prohibit the choice.

---

## 7.9 Time Feasibility

Time feasibility must be **deadline-window-aware**.

For every relevant deadline:

```text
work required before deadline
vs
usable scheduling time before deadline
```

Later availability cannot rescue an earlier shortfall.

### Availability definitions

**Total Available Scheduling Time**

Free usable time after Fixed/Busy and Protected Rest.

**Allocated Focus Time**

Available time already assigned to Focus Blocks.

**Unallocated Available Time**

```text
Total Available Scheduling Time
− Allocated Focus Time
```

### Focus Block credit

A Focus Block counts toward Workload planning only if it is:

- future;
- linked to the Workload;
- before the relevant deadline;
- within usable scheduling time.

Credit is capped by Remaining Time.

Avoid double counting scheduled Workload time and unscheduled required work.

### Missing Remaining Time

If Remaining Time is unknown:

- show what is known;
- do not claim precise feasibility.

---

## 7.10 Google Calendar Integration

MVP integration is one-way:

```text
Google Calendar Event
→ Fixed / Busy
```

Imported events affect:

- availability;
- feasibility.

No writeback is required for MVP.

---

# 8. Analysis Framework

## 8.1 Demand–Resource Relationships

The app should reason about relationships such as:

```text
Time Requirement ↔ Available Time
Cognitive Demand ↔ Energy
Emotional Demand ↔ Perceived Control / contextual support
Physical Demand ↔ Energy / context
```

Do not collapse these into one hidden numeric formula.

---

## 8.2 Multi-Workload Demand Analysis

The system should evaluate the user's active Workloads collectively.

Relevant information may include:

- number of active Workloads;
- Workload Areas;
- Demand distribution;
- deadlines;
- Remaining Time;
- simultaneous High-Demand Workloads;
- scheduling conflicts.

Largest Workload Area is descriptive only.

It is not automatically the main source of strain.

---

## 8.3 Manageable / Strained / Overloaded

### Manageable

Current demands can reasonably be handled without meaningful changes.

Manageable does not mean easy or stress-free.

### Strained

Meaningful Demand–Resource problems exist, but realistic changes could restore manageability.

### Overloaded

Current demands cannot reasonably be met without significant adjustment.

Overloaded may arise from:

- deadline-window infeasibility;
- combined severe Demand–Resource mismatches.

Examples of potentially meaningful combined evidence:

- multiple High Cognitive Demand Workloads + Low Energy;
- High Emotional Demand + Low Control + contextual support concern.

Do not classify Overloaded from one weak signal.

Do not infer:

- High Stress = Overloaded;
- Low Energy = Overloaded.

---

## 8.4 Main Constraints & Contributors

### Constraint

Something limiting the user's ability to handle current demands.

Examples:

- insufficient time before deadline;
- Low Energy;
- Low Control;
- inflexible commitment.

### Contributor

Something meaningfully contributing to current strain.

A contributor should be evidence-backed.

Possible evidence:

- High Demand;
- deadline pressure;
- repeated Stress Dump mentions;
- limited scheduling time;
- repeated historical appearance.

Do not infer causation from size alone.

---

## 8.5 Stress–Load Mismatch Detection

Mismatch is deterministic only for strong cases.

### High / Very High Stress + Manageable

Interpretation:

> Your recorded workload currently looks manageable, but your Stress is high. Something important may not yet be captured.

Stress Dump is a useful next action.

### Normal Stress + Overloaded

Interpretation:

> You may feel okay right now, but your recorded plan appears difficult to sustain without adjustment.

Do not tell the user they should feel stressed.

### Missing Check-In

No current mismatch.

Never substitute yesterday's Check-In.

---

## 8.6 Historical Analysis

### Current Day

Live and recalculable.

### Historical Day

At local-calendar-date rollover, preserve the previous observed day's latest valid Analysis exactly once.

Historical snapshot may include:

```text
date
demand_resource_status
stress?
energy?
control?
emotion?
time_feasibility
mismatch?
supporting_signals[]
workload_or_stress_factor_refs[]
baseline_comparison?
```

A day can have a valid objective Demand–Resource Status without a Check-In.

Missing subjective values remain missing.

Historical snapshots:

- are immutable;
- are not reconstructed from today's Workloads;
- are not rewritten by later Balance actions.

If the app was inactive for several days:

**do not fabricate skipped daily snapshots.**

Use local calendar semantics to avoid date shifting.

---

## 8.7 Sustained Strain

Sustained Strain is a non-diagnostic historical warning.

It requires:

```text
(
≥3 consecutive Strained/Overloaded calendar days
OR
≥4 Strained/Overloaded days in latest rolling 7 days
)
AND
at least one same supporting signal
occurring on ≥3 distinct calendar days
within the same rolling 7-day window
```

Possible repeated supporting signals:

- Elevated / High / Very High Stress;
- Low Energy;
- Low Control;
- deadline-window shortfalls;
- same Workload;
- same Stress Factor;
- repeated high Demand–Resource mismatch;
- elevated Stress relative to baseline when available.

Important rules:

- the same signal must repeat on ≥3 distinct days;
- three different signals on three days do not qualify;
- multiple occurrences on one day count as one day;
- 3-consecutive searches within the latest relevant rolling 7-day period;
- a missing valid daily Demand–Resource Status breaks the consecutive sequence;
- a missing Check-In alone does not break the sequence if objective status exists;
- 4-of-7 may use nonconsecutive days;
- subjective Check-In is not required if objective evidence supports the pattern.

One difficult day never triggers Sustained Strain.

A recent qualifying pattern may remain active even if today improves.

Example:

> Recent strain is easing, but the past week still shows a sustained pattern.

Never convert Sustained Strain into:

- burnout probability;
- burnout percentage;
- burnout diagnosis.

---

# 9. Restore Balance

## 9.1 Balance Activation & Decision Framework

Balance asks:

> Given what the app currently understands, what could change to make the plan more sustainable?

Balance AI runs only after an explicit user trigger.

Examples:

- Restore Balance CTA;
- relevant AI Chat action;
- explicit Balance refresh/request.

Analysis refresh alone does not run Balance AI.

Relevant inputs include:

- importance;
- urgency;
- deadline;
- flexibility;
- Remaining Time;
- Demand;
- Available Time;
- Energy;
- Control;
- contextual resource concerns;
- current Stress when available;
- historical patterns;
- confirmed Stress Dump context.

---

## 9.2 Keep

Keep means:

- Workload unchanged;
- schedule unchanged.

If the schedule changes, it is not Keep.

---

## 9.3 Move / Delay

Move / Delay changes **when work is handled**.

Where relevant, propose:

- exact date;
- start time;
- end time.

This should create or modify Focus Blocks.

A fixed deadline does not change simply because work is rescheduled.

Move / Delay does not automatically change:

- Remaining Time;
- progress;
- Demand.

---

## 9.4 Reduce

Reduce means reducing scope or expected effort while keeping the commitment.

The proposed reduction must be concrete.

Example:

> Build the core prototype flow instead of all optional screens.

Reduce does not automatically lower:

- Cognitive Demand;
- Emotional Demand;
- Physical Demand.

Remaining Time changes only if a **specific revised Remaining Time estimate** is proposed and the user confirms it.

Do not blindly subtract estimated “saved hours.”

Progress does not automatically change.

---

## 9.5 Remove

Remove means dropping the Workload from the active plan.

After confirmation:

- hide immediately from visible Workload Records;
- retain internally for 24 hours;
- allow Undo during that period.

After 24 hours:

- delete the live Workload record;
- preserve historical snapshots and previously stored historical text.

Expiry should be validated dynamically on:

- access;
- Undo;
- relevant state loading.

No background cron is required.

---

## 9.6 Reconsider

Reconsider is decision support.

It must state:

1. what should be reconsidered;
2. why;
3. what concrete decision/change could result.

Examples:

- whether the commitment still matters;
- whether it must happen now;
- whether perfection is necessary;
- whether scope can be renegotiated.

Reconsider is not Remove.

It does not imply changing a deadline by default.

---

## 9.7 Recover

Recover supports the resource side.

Examples:

- sleep;
- break;
- walk;
- exercise;
- social recovery;
- downtime;
- Tree Hole;
- Colour Reflection.

Recover may coexist with another Balance action.

Recover does not:

- create a Recovery Score;
- create a Recovery State;
- modify Workload progress;
- modify Workload Demand.

---

## 9.8 Decision-Specific Plan Details & Editing

Recommendation editing should match the action.

### Move / Delay

Edit:

- date;
- start;
- end;
- affected Focus Blocks.

### Reduce

Edit:

- scope;
- expected output;
- revised Remaining Time only when explicitly proposed.

### Remove

Confirm the Workload being dropped.

### Reconsider

Edit the concrete decision being reconsidered.

Avoid one generic editing interface for every recommendation type.

---

## 9.9 Accept, Edit, Exclude & Apply

Each recommendation is independent.

The user may:

- select/accept;
- edit then accept;
- dismiss/exclude from the proposed plan;
- leave unapplied.

Final CTA:

**Apply Selected Actions**

Only selected confirmed recommendations mutate state.

Avoid using “Remove” to mean “dismiss recommendation,” because Remove is already a Balance action.

---

## 9.10 Recommendation Freshness & Regeneration

A Balance plan represents the state at the time it was generated.

Relevant state changes may make it stale.

After Balance actions are applied:

```text
persistent changes
↓
deterministic facts refresh
↓
Analysis refreshes
↓
existing Balance plan becomes stale
```

Balance AI does not automatically regenerate.

A new plan requires another explicit trigger.

---

## 9.11 Balance Undo Window

Remove uses a 24-hour undo buffer.

Undo within the valid window:

- restores the Workload;
- recalculates relevant facts;
- refreshes Analysis.

Expired Remove cannot be restored through the undo buffer.

Historical evidence remains stable in either case.

---

# 10. Page UI/UX Specification

## 10.1 Global UX Principles

The existing prototype visual identity should remain the base.

Preserve where non-conflicting:

- glassmorphism;
- gradients/pastels;
- cartoon/emoji personality;
- current typography;
- current icon language;
- floating navigation/FAB patterns;
- existing card language;
- spacing/radius conventions.

UX refinement should focus on:

- hierarchy;
- arrangement;
- information density;
- progressive disclosure;
- CTA priority;
- interaction clarity;
- missing/empty states.

Do not redesign merely because another design is possible.

---

## 10.2 Home

Home is a current-state and attention page.

It is not the full analytics dashboard.

Final hierarchy:

1. Greeting/date
2. Check-In
3. Daily State & Load Insight
4. contextual Recovery

### Check-In

Before today's Check-In:

→ clear invitation to complete it.

After Check-In:

→ show current saved state / entry to snapshot.

### Daily State & Load Insight

Primary:

**Demand–Resource Status**

Secondary:

**Current Stress**, when today's Check-In exists.

May also show:

- Personal Baseline comparison;
- top 1–2 contributors;
- short interpretation;
- relevant Energy/Control information.

CTA:

**Understand My Load → Map**

Sustained Strain integrates here conditionally.

Do not create a permanent separate burnout-risk panel.

### Recovery

Recovery appears contextually when useful.

Home should not duplicate the full Balance or Map experience.

Removed from finalized Home:

- Today's Plan / Important Workloads section;
- duplicate Stress Dump entry.

---

## 10.3 Map

Map is the primary understanding/explanation screen.

### Overall Analysis Summary

Lead with:

- Demand–Resource Status;
- short interpretation;
- recent pattern when relevant.

Use **See Why** for progressive disclosure.

Possible evidence groups:

- Time;
- Demand;
- Resources;
- Main Contributor;
- Pattern.

### Stress–Load Mismatch

Show only when strong mismatch exists.

### Workload Area Distribution

Show distribution by:

- Academic;
- Personal;
- Social;
- Self-care.

Largest Area is not automatically the main contributor.

### Demand Profile

Show Cognitive, Emotional and Physical Demand separately.

Prefer counts/distributions.

### Resources

Show:

- Energy;
- Perceived Control;
- Available Time.

Social Support appears contextually, not as a permanent metric.

### Time Feasibility

Use concrete deadline-window explanations.

### Restore Balance

Provide CTA when changing the plan may be useful.

Map consumes shared Analysis.

It does not run separate Map AI.

---

## 10.4 AI Chatbot

### Conversation

Natural conversational Stress Dump.

### Conditional Extraction Review

Only detected categories appear.

### Grouped Editing

Allow related fields to be reviewed together.

### Confirmation

Persistent structured changes require confirmation.

### Analysis & Next Actions

After confirmation:

- refresh Analysis;
- provide short conclusion;
- provide contextual next actions.

---

## 10.5 Workload

Workload contains:

- Calendar Tab;
- Workload Records Tab.

### Calendar Tab

Calendar is a time/date inspection surface.

### Month View

May show:

- Fixed/Busy events;
- Focus Blocks;
- Emotion marker when recorded.

Selecting a date moves into Week context.

### Week View

Displays time-based scheduling.

Clicking a date/day header opens Day.

### Day View

Shows detailed schedule for one date.

### View Navigation

Top-right selector allows unrestricted switching:

- Month;
- Week;
- Day.

### Time-Block Details

Focus Blocks are clickable.

Details may show:

- date;
- start/end;
- duration;
- linked Workload;
- edit actions where appropriate.

Protected Rest is not rendered as a visible block.

### Workload Records Tab

Shows accepted Workload records.

### Workload Cards

Collapsed cards should prioritize useful scanning information rather than every stored field.

Possible information:

- name;
- Area;
- deadline;
- progress;
- Remaining Time;
- Demand tags;
- relevant status.

### Subtasks

Clearly nested beneath their Workload.

### Completed Workloads

Remain accessible but visually de-emphasized.

---

## 10.6 Balance

Balance is a proposal/review workspace.

Recommended hierarchy:

1. situation summary;
2. constraints/contributors;
3. proposed actions;
4. reasons/trade-offs;
5. proposed schedule/scope effect;
6. decision-specific editing;
7. Apply Selected Actions.

### Recovery Area

Recovery suggestions remain visually distinct from Demand-management actions.

### Decision Sections

Recommendations may be grouped by action type where useful.

### Recommendation Cards

Each recommendation should make clear:

- action;
- affected Workload;
- reason;
- proposed change;
- expected trade-off;
- selected/dismissed state.

### Decision-Specific Editing

Use fields appropriate to each action.

### Apply Selected Actions

Applies only selected confirmed recommendations.

---

# 11. Data Architecture & Processing

## 11.1 Data Layers

The system must preserve:

```text
RAW INPUT
↓
CONFIRMED STRUCTURED DATA
↓
DERIVED SYSTEM FACTS
↓
AI INTERPRETATION
↓
AI RECOMMENDATION
↓
USER CONFIRMATION
↓
PERSISTENT MUTATION
```

---

## 11.2 User & Preferences

Conceptual data:

```text
user_id
protected_rest_rules
temporary_planning_preference?
```

Default Protected Rest:

```text
00:00–04:00
```

Temporary planning preferences do not automatically become permanent preferences.

---

## 11.3 Daily Check-In

```text
checkin_id
date
created_at
updated_at

q1
q2
q3
q4
emotion
energy_score

stress_score
stress_category

perceived_control
control_category
energy_category

personal_baseline?
baseline_comparison?
```

One official record per local calendar date.

---

## 11.4 Stress Dump

```text
dump_session_id
session_created_at
raw_chat_messages[]
confirmed_summary?

stress_factors[]
resource_concerns[]
confirmed_workload_updates[]
confirmed_subtasks[]
```

Raw session expires 24 hours from session creation.

Confirmed structured information persists.

---

## 11.5 Workload & Subtasks

### Workload

```text
workload_id
name
area
activity_type
status

deadline
urgency
importance
flexibility

estimated_total_time
remaining_time
progress_percent

cognitive_demand
emotional_demand
physical_demand

scope_note?
subtasks[]
```

### Subtask

```text
subtask_id
workload_id
name
is_completed
```

Progress:

```text
completed_subtasks / total_subtasks × 100
```

when Subtasks exist.

---

## 11.6 Calendar & Planning Blocks

### Planning Block

```text
planning_block_id
start_datetime
end_datetime
planned_workload_id?
```

Planning Blocks are global Calendar objects.

Derived Calendar data may include:

```text
fixed_busy_time
protected_rest_time
total_available_scheduling_time
allocated_focus_time
unallocated_available_time
deadline_window_feasibility
```

---

## 11.7 Derived Analysis Data

System-derived facts may include:

- Stress Category;
- baseline comparison;
- Energy Category;
- Control Category;
- availability;
- feasibility;
- Workload distribution;
- Demand distribution;
- mismatch evidence;
- Sustained Strain trigger evidence.

Conceptual Analysis result:

```text
demand_resource_status
status_evidence[]
main_constraints[]
main_contributors[]
mismatch_insight?
historical_pattern_insights[]
sustained_strain_explanation?
overall_interpretation
missing_data_notes[]
recommended_next_step
analysis_updated_at
analysis_stale
```

---

## 11.8 Historical Snapshots

```text
date
demand_resource_status
stress?
energy?
control?
emotion?
time_feasibility
mismatch?
supporting_signals[]
workload_or_stress_factor_refs[]
baseline_comparison?
```

Historical snapshots are immutable after rollover.

No skipped-day fabrication.

---

## 11.9 Balance Proposal & Undo Data

A Balance plan may conceptually contain:

```text
balance_plan_id
created_at
source_trigger
balance_summary
actions[]
recovery_suggestions[]
stale
```

Each action may contain only relevant fields:

```text
action_id
action_type
workload_id?
reason
proposed_change
schedule_changes?
scope_changes?
revised_remaining_time?
expected_tradeoff
selected
edited
dismissed
```

Remove additionally needs enough information to support its 24-hour undo lifecycle.

---

# 12. State Transitions & Recalculation

## 12.1 Check-In Transitions

### Finish & Save

Changes:

- today's official Check-In.

Then:

- subjective facts recalculate;
- Analysis refreshes;
- Home/Map consume refreshed Analysis.

Must not create a second official record.

### Retest

Replaces today's official record.

Same downstream recalculation.

---

## 12.2 Workload & Subtask Transitions

### Create/Edit Workload

Relevant feasibility and Analysis refresh.

### Complete Workload

Exclude from:

- active Analysis;
- active planning;
- Balance.

### Reopen Workload

Return to active calculations.

### Complete Subtask

Update Subtask and progress.

Do not automatically update:

- Remaining Time;
- Demand;
- feasibility solely because progress changed.

---

## 12.3 Calendar Transitions

### Add / Move Focus Block

Update Calendar allocation.

Then:

- availability/feasibility refresh;
- Analysis refreshes where relevant.

Do not update Workload progress.

### Change Protected Rest

Recalculate:

- Total Available Scheduling Time;
- feasibility;
- Analysis where relevant.

Do not create a visible rest appointment.

---

## 12.4 Balance Application & Undo

### Apply Selected Actions

Only selected confirmed actions mutate persistent state.

Then:

- relevant facts recalculate;
- Analysis refreshes;
- existing Balance plan becomes stale.

### Undo Remove

If still within 24 hours:

- restore Workload;
- recalculate;
- refresh Analysis.

---

## 12.5 Analysis Refresh Triggers

Meaningful triggers include:

- Check-In save/retest;
- Workload create/edit/complete/reopen;
- Remaining Time change;
- Demand change;
- Focus Block change;
- Calendar Fixed/Busy change;
- Protected Rest change;
- confirmed Stress Dump information;
- Balance Apply/Undo.

Opening Map alone:

→ no recalculation if Analysis is already current.

---

## 12.6 Balance AI Activation

Balance AI runs only after explicit user intent.

Analysis refresh does not activate Balance AI.

---

## 12.7 Stale Analysis & Recommendation Invalidation

Current Analysis may be marked stale when relevant confirmed source state changes before recalculation finishes.

Balance recommendations become stale when the underlying situation materially changes.

Stale does not mean deleted.

A new Balance plan requires explicit regeneration.

---

# 13. Edge Cases & Failure States

## 13.1 Missing or Incomplete Data

### No Check-In

Subjective current state unknown.

### No Workloads

Do not claim Workload caused Stress.

### Missing Remaining Time

No precise feasibility.

### Fewer than 30 prior completed Check-Ins

No Personal Baseline comparison.

### No Stress Dump context

Do not invent Stress Source.

### Insufficient history

No Sustained Strain.

---

## 13.2 Stress–Load Mismatch Cases

### High / Very High Stress + Manageable

Mismatch.

Suggest that something may be uncaptured.

### Normal Stress + Overloaded

Mismatch.

Explain sustainability problem without claiming the user feels stressed.

### Missing Check-In

No mismatch.

---

## 13.3 Scheduling Edge Cases

### Earlier deadline shortfall

Later availability cannot rescue it.

### Overlapping Focus Blocks

Must not double-count available/allocated time.

### Focus Block outside usable availability

Must not receive valid feasibility credit.

### Focus time exceeds Remaining Time

Credit capped by Remaining Time.

### Missing Protected Rest preference

Use 00:00–04:00.

### Manual future scheduling inside Protected Rest

May warn rather than permanently prohibit if manual scheduling is supported.

---

## 13.4 Subtask & Progress Edge Cases

### No Subtasks

Do not fabricate Subtask progress.

### Progress changes

Do not infer Remaining Time change.

### Workload completed

Exclude from active Analysis regardless of old progress value.

---

## 13.5 AI Failure

### Analysis AI fails

Keep deterministic facts available.

Explain that interpretation is temporarily unavailable.

### Stress Dump extraction fails

Preserve valid raw conversation.

Allow retry.

### Balance AI fails

Apply nothing.

Keep current Analysis.

---

## 13.6 Historical References

Historical days must not be rewritten using current data.

Missing Check-In does not mean Normal.

Missing valid daily status breaks the 3-consecutive Sustained Strain sequence.

Do not fabricate historical days when the app was not used.

---

# 14. Technical & MVP Architecture

## 14.1 Frontend-First Architecture

The current prototype is frontend-first.

Acceptable for MVP:

- local/mock persistence;
- deterministic frontend calculations;
- mock or staged AI responses where needed;
- modular services/state.

Not required yet:

- production backend;
- production database;
- production authentication;
- full deployment architecture.

Real AI/API integration should follow stable deterministic behaviour.

---

## 14.2 Service Responsibilities

Conceptual services:

### CheckInService

- daily record;
- scoring;
- baseline;
- same-day Retest.

### WorkloadService

- Workload CRUD;
- status;
- Subtasks;
- progress;
- Remaining Time;
- Demand.

### CalendarService

- Fixed/Busy;
- Protected Rest;
- Focus Blocks;
- availability;
- deadline-window feasibility.

### StressDumpService

- raw session lifecycle;
- extraction proposals;
- confirmation;
- persistent context.

### AnalysisService

- deterministic facts;
- shared Analysis;
- mismatch;
- historical pattern evaluation.

### BalanceService

- explicit Balance generation;
- candidate actions;
- selected-action application;
- stale plan state.

### HistoryService

- local date rollover;
- immutable daily snapshots;
- Sustained Strain evidence.

---

## 14.3 MVP Product Loop

```text
INPUT
Daily Check-In
Workload
Stress Dump
Calendar / Rest Preferences

↓ CONFIRMATION WHERE REQUIRED

STRUCTURED STATE

↓ SYSTEM CALCULATION

FACTS
Stress
Demand
Resources
Schedule Feasibility
History

↓ AI INTERPRETATION

ANALYSIS
Manageable / Strained / Overloaded
Contributors
Mismatch
Patterns

↓ UNDERSTANDING

HOME + MAP

↓ EXPLICIT USER ACTION

BALANCE

↓ USER REVIEW / CONFIRMATION

PERSISTENT CHANGE

↓ RECALCULATION

UPDATED ANALYSIS
```

---

## 14.4 Demo Scenario

A useful prototype demonstration should show the complete relationship between features rather than isolated screens.

Example:

1. User has several active Workloads.
2. Calendar contains Fixed/Busy commitments.
3. User completes today's Check-In.
4. Stress is High and Energy is Low.
5. One Workload has a near deadline and significant Remaining Time.
6. System calculates deadline-window feasibility.
7. Analysis explains current Demand–Resource Status.
8. Home summarizes the situation.
9. Map shows evidence.
10. User opens Restore Balance.
11. Balance proposes concrete Move / Reduce / Recover actions.
12. User edits/selects actions.
13. Apply Selected Actions updates Workload/Calendar.
14. Analysis refreshes.
15. Balance does not automatically generate another plan.

The demo should make the product's reasoning understandable.

---

## 14.5 Success Criteria

The MVP succeeds when a user can understand:

- what they are carrying;
- what those Workloads demand;
- how they currently feel;
- what resources are available;
- whether their schedule is realistic;
- what is contributing to strain;
- what could change;
- why a recommendation was made.

The prototype should also demonstrate that:

- AI does not silently mutate state;
- unknown data stays unknown;
- historical evidence is stable;
- Workload and Calendar remain distinct;
- recommendations remain under user control.

---

# 15. Guardrails, TBD & Future Work

## 15.1 Forbidden Metrics & Logic

Do not introduce:

```text
workload_stress_score
overall_capacity_score
capacity_percentage
mandatory_capacity_status
global_social_support_score
recovery_state_score
burnout_percentage
burnout_probability
burnout_diagnosis
manual_time_pressure_rating
overall_demand_score
numeric_priority_score
physical_condition_score
```

Do not implement:

```text
High Stress = Overloaded
Low Energy = Overloaded
Largest Workload Area = Main Stress Source
Empty Calendar = Available Scheduling Time
Focus Block elapsed = Work completed
Progress = Remaining Time
Progress reduces Remaining Time
Reduce automatically lowers Demand
Move automatically changes deadline
Analysis refresh automatically reruns Balance
Reconsider = Remove
Focus Block structurally belongs to Workload
```

---

## 15.2 Coding-Agent Guardrails

When an AI coding agent uses this plan:

### Source priority

1. latest Humanreadable Plan;
2. targeted build/implementation prompt;
3. existing non-conflicting prototype behaviour;
4. AI assumptions.

### Binding rules

The coding agent must:

- respect explicit MUST/MUST NOT behaviour;
- keep unknown values unknown;
- avoid inventing scores;
- avoid inventing state transitions;
- avoid resolving TBD items;
- preserve confirmation boundaries;
- identify genuine conflicts before changing behaviour.

### Logic-focused work

When working on logic:

- preserve established visual style;
- avoid unnecessary screen redesign;
- implement state, calculations, persistence and feature contracts.

### UI/UX-focused work

When working on UX:

- preserve product logic;
- preserve calculations;
- preserve state ownership;
- preserve persistence rules;
- improve hierarchy, arrangement, presentation, progressive disclosure and interaction flow.

### Existing prototype elements

If an existing element is:

- useful;
- non-conflicting;
- non-duplicative;
- not explicitly removed;

it may remain.

Do not rebuild working components simply because another implementation is possible.

---

## 15.3 Explicit TBDs

### NASA-TLX

Optional detailed assessment.

Exact MVP implementation remains unresolved.

Do not invent:

- custom official NASA-TLX score;
- weighting method;
- interpretation thresholds.

### Scientific Validation

The Daily Check-In adaptation and prototype interpretation bands require future validation.

### Production AI

Exact production:

- model;
- prompting architecture;
- API;
- cost controls;
- fallback strategy

remain implementation-stage decisions.

These do not change the conceptual AI boundaries defined in this plan.

---

## 15.4 Future Work

Possible future work includes:

- scientific validation;
- optional NASA-TLX implementation;
- configurable Protected Rest/sleep schedules;
- richer personal scheduling preferences;
- production AI/LLM integration;
- Google Calendar one-way import;
- production backend/database;
- authentication;
- deployment;
- longer-term analytics;
- usability testing;
- dedicated UI/UX refinement;
- accessibility refinement;
- more sophisticated scheduling support.

Future work must not be silently implemented as if it were already an MVP requirement.

---

# Final Product Interpretation

The prototype should communicate:

> Here is what your current workload requires, here are the resources and time you currently have, here is how stressed you feel, and here are the patterns we can observe. Based on those signals, your current situation appears Manageable, Strained, or Overloaded. Here are possible ways to restore balance. You decide what changes to make.

The product must not reduce the user to one artificial score.

It must not simply maximize the amount of work scheduled.

It must not hide consequences in order to satisfy a preference.

It should:

- make constraints visible;
- explain trade-offs;
- acknowledge uncertainty;
- support Recovery when useful;
- preserve user autonomy;
- help the user create a sustainable plan.

**Beating the Burnout is a decision-support system, not a burnout diagnosis system and not a productivity maximizer.**

Its purpose is to help users understand the relationship between **what they are carrying, what it demands, what resources they have, how they feel, and what they can realistically change.**