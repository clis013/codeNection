# Beating the Burnout — Antigravity Prototype Build Prompt

## Purpose

Use this file when building, modifying, auditing, or refining the existing **Beating the Burnout** frontend prototype.

The **Humanreadable Plan** is the product source of truth.

This file exists to tell an AI coding agent **how to interpret and implement that plan without inventing product behavior**.

The prototype already has an established visual style and useful UI components.

**Do not redesign the app from scratch.**

---

# 0. Instructions for AI Coding Agents

These rules are binding.

## 0.1 Source-of-Truth Priority

Use this priority:

1. latest Humanreadable Plan;
2. this Antigravity implementation contract;
3. existing prototype behavior/design where non-conflicting;
4. your own assumptions only where explicitly allowed.

If this prompt summarizes a product rule, it must be interpreted consistently with the Humanreadable Plan.

If you discover an actual contradiction between these sources:

**identify the conflict before changing product behavior.**

Do not silently choose whichever interpretation is easier to implement.

---

## 0.2 Do Not Invent Product Logic

Do not invent:

- scoring systems;
- thresholds;
- fallback values;
- data relationships;
- automatic state transitions;
- persistent fields;
- AI outputs;
- pages;
- health metrics;
- recommendation rules;
- scheduling assumptions

unless explicitly required.

Unknown data stays unknown unless a fallback is explicitly defined.

Do not make the UI appear “complete” by fabricating data.

---

## 0.3 MUST / MUST NOT

Treat `MUST`, `MUST NOT`, `DO NOT`, and explicit finalized rules as binding implementation requirements.

Do not replace them with a simpler approximation without identifying the discrepancy.

---

## 0.4 Do Not Resolve TBDs

If the Humanreadable Plan marks something TBD/Future:

- do not implement arbitrary production logic for it;
- do not create fake deterministic rules;
- do not silently treat one possible approach as confirmed.

Use the simplest non-conflicting placeholder only when needed for prototype continuity.

---

## 0.5 Preserve Existing Visual Identity

If an existing component, layout, card, icon, animation, spacing pattern, interaction, or visual treatment:

- is not explicitly removed;
- does not conflict with required behavior;
- remains useful;
- does not duplicate another finalized responsibility;

**keep it.**

Preserve existing:

- glassmorphism;
- gradients/pastels;
- cartoon/emoji visual personality;
- typography;
- icons;
- cards;
- spacing language;
- border radius;
- floating navigation/FAB patterns;
- overall visual identity.

Reuse existing components whenever practical.

---

## 0.6 Scope Boundary for Parallel Work

### If instructed to perform LOGIC / INTEGRATION work

You may modify:

- state;
- calculations;
- data ownership;
- feature integration;
- persistence;
- missing states;
- required UI needed to expose corrected behavior.

You MUST NOT redesign established visual styling.

### If instructed to perform UI / UX work

You may modify:

- information hierarchy;
- arrangement;
- density;
- progressive disclosure;
- CTA placement;
- interaction clarity;
- responsive presentation;
- component composition.

You MUST NOT change:

- scoring;
- product meaning;
- data ownership;
- state-transition rules;
- analysis logic;
- Balance semantics;
- persistence rules;
- cross-feature contracts.

A UI-only task must not “simplify” the implementation by changing product logic.

---

# 1. Required Architecture Boundary

Preserve this pipeline:

```text
RAW USER INPUT
↓
CONFIRMED STRUCTURED DATA
↓
DETERMINISTIC SYSTEM FACTS
↓
AI INTERPRETATION
↓
AI RECOMMENDATIONS
↓
USER REVIEW / CONFIRMATION
↓
PERSISTENT MUTATION
```

These layers MUST NOT be collapsed.

Examples:

- Stress Dump text is not automatically a system fact.
- AI extraction is not confirmed data.
- Demand–Resource Status is not a Workload field.
- Balance recommendation is not a Calendar event.
- Proposed Focus Block is not accepted schedule until confirmation.

---

# 2. Cross-Feature Ownership Contract

## 2.1 Check-In

Owns subjective daily input:

- Stress inputs;
- Emotion;
- Energy;
- Perceived Control.

One official record per date.

---

## 2.2 Workload

Owns:

- Workload identity;
- Area;
- Activity Type;
- deadline;
- urgency;
- importance;
- flexibility;
- Demand;
- Remaining Time;
- progress;
- Subtasks;
- active/completed state.

---

## 2.3 Calendar

Owns:

- Fixed/Busy events;
- Focus Blocks;
- Protected Rest scheduling rules;
- scheduling availability.

Focus Blocks may reference Workloads but are independent objects.

---

## 2.4 Stress Dump

Owns:

- raw conversational session;
- candidate extraction;
- confirmed contextual information.

It proposes structured changes.

It MUST NOT silently mutate persistent records.

---

## 2.5 Analysis

Consumes confirmed structured state.

Owns shared:

- deterministic facts;
- Demand–Resource interpretation;
- mismatch;
- historical pattern interpretation;
- Sustained Strain interpretation.

Home and Map consume this shared Analysis.

---

## 2.6 Home

Home is a consumer/presentation surface.

Home MUST NOT independently calculate another Demand–Resource Status.

---

## 2.7 Map

Map is an explanation/presentation layer.

Map MUST NOT run an independent “Map AI.”

---

## 2.8 Balance

Balance consumes current Analysis.

It proposes candidate actions.

Persistent mutation occurs only after confirmation.

After Balance mutation:

```text
Workload / Calendar
→ deterministic facts
→ Analysis
```

Analysis refresh MUST NOT automatically regenerate Balance.

---

# 3. Main App Structure

Primary areas:

- Home
- Map
- AI Chatbot / Stress Dump
- Workload
- Balance

Workload contains:

- Calendar
- Workload Records

Do not add unnecessary primary pages.

Recovery is contextual.

---

# 4. Core Concept Contracts

## Workload ≠ Demand

Workload = commitment.

Demand = what that commitment requires.

Demand dimensions:

- Cognitive;
- Emotional;
- Physical.

No Overall Demand Score.

---

## Perceived Stress ≠ Stress Source

Perceived Stress comes from Daily Check-In.

Stress Source comes from confirmed context such as Stress Dump.

---

## Capacity Is Conceptual Only

Resources:

- Energy;
- Perceived Control;
- Available Time;
- contextual Social Support.

Do not calculate:

- Capacity Score;
- Capacity Percentage;
- mandatory Capacity Status.

---

## Workload ≠ Focus Block ≠ Subtask

These are three different objects.

Focus Block allocation does not mean work is completed.

Subtask completion may update progress.

Neither automatically updates Remaining Time.

---

## Progress ≠ Remaining Time

Progress is informational.

Remaining Time is a separate planning estimate.

Never derive one from the other.

---

# 5. Daily Check-In Contract

Questions:

1. current Stress;
2. Control;
3. Mental Demand;
4. Capability;
5. Emotion;
6. Energy.

Q1–Q4 use 1–5.

```text
Q2_reversed = 6 - Q2
Q4_reversed = 6 - Q4

stress_score
= Q1 + Q2_reversed + Q3 + Q4_reversed
```

Range:

`4–20`

Bands:

```text
4–10  Normal
11–13 Elevated
14–16 High
17–20 Very High
```

These are prototype interpretation bands, not clinical cut-offs.

Control:

```text
1–2 Low
3 Moderate
4–5 Good
```

Energy:

```text
1–2 Low
3 Moderate
4–5 Good
```

Emotion remains separate.

---

## 5.1 Check-In Interaction

Use modal-card flow.

Buttons:

- `Next`
- `Finish & Save`

After Finish & Save:

→ save official daily record  
→ recalculate  
→ show Current State Snapshot.

---

## 5.2 One Official Record Per Day

If today's record already exists:

→ show snapshot  
→ `Retest` or `Back to home`.

Retest replaces/updates today's official record.

MUST NOT create multiple official records for one date.

---

## 5.3 Personal Baseline

```text
Personal Baseline
= average Stress Score from previous
30 COMPLETED Check-In records
excluding today
```

This is **30 records, not 30 calendar days**.

Comparison available only when 30 prior completed records exist.

```text
±2      Typical
+3–+5   Higher than usual
+6+     Significantly higher
−3+     Lower than usual
```

---

## 5.4 Missing Today

No Check-In today:

MUST NOT claim current:

- Stress;
- Emotion;
- Energy;
- Control.

MUST NOT reuse yesterday.

Objective Workload/time Analysis may continue.

---

# 6. Stress Dump Contract

Flow:

```text
introduction
→ user dump
→ AI response
→ candidate extraction
→ grouped review/edit
→ confirmation
→ persistent structured save
→ deterministic recalculation
→ Analysis refresh
→ chatbot conclusion / next action
```

Possible extraction:

- Stress Factor;
- Possible Workload;
- Existing Workload update;
- Contextual Resource Concern;
- suggested Subtasks.

Only detected categories should appear.

---

## 6.1 Required Missing Fields

If a detected record requires a field before it can be persisted:

→ ask for that field.

Do not guess.

Optional unknown fields stay null/unknown.

---

## 6.2 Existing Workload Matching

```text
AI identifies likely existing Workload
→ user verifies
→ proposed update
→ user confirms
→ update
```

No silent merge.

---

## 6.3 Persistence Boundary

Unconfirmed/rejected extraction:

MUST NOT enter:

- Workload state;
- Analysis evidence;
- historical evidence.

---

## 6.4 Raw Session Lifecycle

Raw conversation expires **24 hours from session creation**.

NOT 24 hours from each message.

During valid window:

- leave;
- reopen;
- continue.

After expiry:

- raw chat may disappear;
- confirmed structured data persists.

Frontend implementation may validate timestamp on access/load.

No cron required.

---

## 6.5 Stress Dump AI Boundary

Stress Dump AI:

- converses;
- extracts;
- proposes structured changes.

It does NOT own final Demand–Resource Status.

After confirmation:

```text
confirmed data
→ system facts
→ Analysis
```

Next actions may include:

- Understand My Load → Map;
- Restore Balance → Balance;
- Recovery.

No generic `Done → Home`.

---

# 7. Workload Contract

Core fields:

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

# 8. Subtask / Progress Contract

Users may:

- add;
- edit;
- delete;
- complete;
- uncomplete Subtasks.

AI-suggested Subtasks require confirmation.

When Subtasks exist:

```text
progress_percent
= completed_subtasks / total_subtasks × 100
```

Equal weight.

If no Subtasks exist:

MUST NOT fabricate Subtask-based progress.

Progress MUST NOT affect:

- Remaining Time;
- Priority;
- Demand;
- scheduling;
- feasibility;
- Balance;
- Demand–Resource Status.

---

## 8.1 Completed Workload

Completed:

- visible but de-emphasized in Workload Records;
- editable;
- excluded from active Analysis;
- excluded from planning;
- excluded from Balance;
- may reopen to Active.

---

# 9. Calendar Contract

Views:

- Month;
- Week;
- Day.

Top-right selector can switch freely.

Month date click:

→ Week containing date.

Week day/date header click:

→ Day.

Focus Blocks are clickable for details/editing.

---

## 9.1 Protected Rest — FINAL RULE

Default Protected Rest:

**00:00–04:00 every day**

If no stored preference exists:

→ fallback to **00:00–04:00**.

MUST NOT assume 24-hour availability.

Protected Rest:

- reduces Available Scheduling Time;
- is NOT rendered as a visible Calendar block;
- is NOT a Fixed/Busy event;
- should not receive automatic Focus Block proposals.

Time after 04:00:

MUST NOT be described as “recommended work time.”

It is merely outside the default hard-protected period.

Actual availability still depends on Calendar constraints.

MVP does not automatically protect lunch or generic breaks.

Manual user choice may later warn rather than permanently prohibit protected-time scheduling.

---

## 9.2 Focus Block Contract

Focus Block is global Calendar state.

```text
planning_block_id
start_datetime
end_datetime
planned_workload_id?
```

`planned_workload_id` is optional.

Focus Block MUST NOT be structurally owned by Workload.

Elapsed Focus Block MUST NOT:

- complete Subtask;
- increase progress;
- reduce Remaining Time;
- complete Workload.

Completing Workload MUST NOT automatically delete unrelated Focus Blocks.

---

## 9.3 Google Calendar

MVP:

```text
Google event
→ Fixed / Busy
```

One-way import only.

No app Focus Block writeback required.

---

# 10. Time Feasibility Contract

Feasibility is deadline-window-aware.

For each relevant deadline:

```text
required work before deadline
vs
usable scheduling time before deadline
```

Later time MUST NOT rescue earlier shortfall.

---

## 10.1 Availability Definitions

```text
Total Available Scheduling Time
= usable free time after Fixed/Busy
  and Protected Rest

Allocated Focus Time
= usable available time already
  assigned to Focus Blocks

Unallocated Available Time
= Total Available Scheduling Time
  - Allocated Focus Time
```

---

## 10.2 Focus Block Credit

Credit a Focus Block toward a Workload only if:

- future;
- linked to that Workload;
- before relevant deadline;
- inside usable scheduling time.

Credit MUST be capped by Remaining Time.

Prevent overlapping/double counting.

Focus allocation does NOT mutate Remaining Time.

---

## 10.3 Missing Remaining Time

If missing:

- no precise feasibility claim;
- indicate estimate is required.

---

# 11. Deterministic Facts vs AI Interpretation

## Deterministic System Facts

System code calculates:

- Stress score/category;
- baseline comparison;
- Energy category;
- Control category;
- Remaining Time;
- Calendar availability;
- allocated/unallocated Focus Time;
- deadline-window feasibility;
- Workload distributions;
- Demand distributions;
- obvious conflicts;
- strong mismatch enum/evidence;
- Sustained Strain trigger evidence.

Do not ask LLM to perform deterministic arithmetic.

---

## Analysis AI

Receives:

- deterministic facts;
- confirmed Stress Dump context;
- historical snapshots.

May return:

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
```

---

# 12. Demand–Resource Status Contract

Statuses:

- Manageable;
- Strained;
- Overloaded.

### Manageable

Current demands can reasonably be handled without meaningful change.

### Strained

Meaningful problems exist but realistic adjustment could restore manageability.

### Overloaded

Current demands cannot reasonably be met without significant adjustment.

Overloaded may result from:

- deadline-window infeasibility;
- multiple severe Demand–Resource constraints together.

MUST NOT infer:

```text
High Stress = Overloaded
Low Energy = Overloaded
one High-Demand Workload = Overloaded
```

No hidden weighted score.

---

# 13. Stress–Load Mismatch Contract

Strong deterministic cases only.

## Case 1

```text
Stress = High or Very High
AND
Demand–Resource Status = Manageable
```

→ mismatch.

Interpretation:

Recorded load may not fully explain current Stress.

Stress Dump may be suggested.

## Case 2

```text
Stress = Normal
AND
Demand–Resource Status = Overloaded
```

→ mismatch.

Interpretation:

Plan may be difficult to sustain despite low current Stress.

## No Check-In Today

→ no current mismatch.

Never substitute yesterday.

---

# 14. Historical Snapshot Contract

Current day:

- live;
- recalculable.

Past observed days:

- immutable after rollover.

At local-date rollover:

1. identify previous observed day;
2. freeze its latest valid Analysis exactly once;
3. preserve actual previous-day structured state;
4. begin new live day.

MUST NOT:

- use browser-close as history boundary;
- reconstruct yesterday from today's Workloads;
- infer historical status from Check-In alone;
- fabricate skipped inactive days;
- duplicate same-date snapshots.

A day may have objective Demand–Resource Status without Check-In.

---

# 15. Sustained Strain Contract

Use latest relevant rolling 7-day window.

Trigger only when:

```text
(
≥3 consecutive Strained/Overloaded calendar days
OR
≥4 Strained/Overloaded days in latest rolling 7 days
)
AND
at least one SAME supporting signal
appears on ≥3 DISTINCT calendar days
within the same rolling window
```

Supporting signals may include:

- Elevated/High/Very High Stress;
- Low Energy;
- Low Control;
- deadline-window shortfall;
- same Workload;
- same Stress Factor;
- repeated high Demand–Resource mismatch;
- elevated Stress relative to baseline.

Rules:

- three different signals across three days do NOT qualify;
- multiple occurrences same day count once;
- missing valid daily status breaks consecutive sequence;
- missing Check-In does NOT break sequence if objective valid status exists;
- 4-of-7 may be nonconsecutive;
- subjective Check-In evidence is not mandatory if objective repeated evidence exists.

A qualifying recent strain run may remain relevant even if today improves.

Do not call this burnout.

Do not calculate Burnout Risk %.

---

# 16. Home Contract

Final hierarchy:

1. Greeting/date
2. Daily Check-In
3. Daily State & Load Insight
4. contextual Recovery

Daily State & Load Insight:

Primary:

- Demand–Resource Status.

Secondary when available:

- current Stress.

Also:

- baseline Comparison when useful;
- top 1–2 contributors;
- short interpretation;
- relevant Energy/Control evidence.

CTA:

**Understand My Load → Map**

Sustained Strain integrates into this component.

Remove:

- standalone Today's Plan / Important Workloads;
- duplicate Stress Dump entry.

Home MUST NOT independently calculate Analysis.

---

# 17. Map Contract

Map = explanation layer.

Final hierarchy:

### A. Overall Analysis Summary

- status;
- interpretation;
- recent pattern;
- See Why.

### B. Conditional Stress–Load Mismatch

Only when strong mismatch exists.

### C. Workload Area Distribution

Dominant Area ≠ main Stress source.

### D. Demand Profile

Counts/distributions.

No Overall Demand %.

### E. Resources

- Energy;
- Control;
- Available Time.

Contextual Social Support only when relevant.

### F. Time Feasibility

Deadline-specific evidence.

### G. Restore Balance

Explicit trigger.

Map MUST NOT run independent AI.

Map MUST NOT label previous subjective state as “Today.”

---

# 18. Balance Activation Contract

Balance AI runs only on explicit trigger.

Valid triggers include:

- Restore Balance CTA;
- AI Chat next action;
- explicit Generate/Refresh plan action.

MUST NOT automatically run because:

- Check-In saved;
- Workload edited;
- Focus Block changed;
- Analysis refreshed;
- Balance actions applied.

After Apply:

→ Analysis refreshes  
→ Balance does not automatically regenerate.

---

# 19. Balance Recommendation State

Every recommendation independently supports:

- selected/accepted;
- edited then accepted;
- dismissed;
- left unapplied.

Final action:

**Apply Selected Actions**

Only selected confirmed recommendations mutate state.

Do not use ambiguous `Remove` wording for dismissing a recommendation when it could be confused with **Remove Workload**.

---

# 20. Balance Action Contracts

## 20.1 Keep

### Trigger

User applies Keep.

### Expected

No Workload or schedule change.

### MUST NOT

- move Focus Blocks;
- change deadline;
- change Remaining Time;
- change Demand;
- change progress.

---

## 20.2 Move / Delay

### Trigger

User confirms Move / Delay.

### Expected

Create/update relevant Focus Blocks.

Use concrete date/start/end when relevant.

### Unchanged unless separately proposed

- fixed deadline;
- Remaining Time;
- progress;
- Demand.

### MUST NOT

Treat moving scheduled work as automatically changing the external deadline.

---

## 20.3 Reduce

### Trigger

User confirms concrete scope reduction.

### Expected

Apply confirmed scope change.

If AI explicitly proposes a revised Remaining Time and user confirms it:

→ update Remaining Time to that confirmed revised estimate.

### MUST NOT

- blindly subtract “saved hours”;
- automatically lower Demand;
- automatically change progress.

---

## 20.4 Remove

### Trigger

User confirms Remove Workload.

### Expected

- hide immediately;
- retain undo buffer 24h;
- allow Undo during valid window.

### Expiry

On relevant access/undo/load:

- validate current timestamp;
- if expired, delete live retained Workload.

### MUST NOT

- require background cron;
- rewrite historical snapshots;
- show expired item as restorable.

---

## 20.5 Reconsider

### Expected

Always state:

1. what to reconsider;
2. why;
3. concrete resulting decision/change.

### MUST NOT

Treat Reconsider as another name for Remove.

Do not assume Reconsider means deadline change.

---

## 20.6 Recover

Contextual resource-support recommendation.

May coexist with another action.

MUST NOT:

- create Recovery Score;
- create mandatory Recovery State;
- mutate Workload progress;
- mutate Workload Demand.

---

# 21. Balance Apply Contract

```text
selected confirmed recommendations
→ persistent Workload / Calendar mutations
→ deterministic facts recalculate
→ Analysis refreshes
→ Home / Map consume refreshed Analysis
→ existing Balance plan becomes stale
```

MUST NOT automatically rerun Balance AI.

---

# 22. Missing Data Contract

## No Check-In Today

No current subjective state.

## No Workloads

Do not claim Workload caused Stress.

## Missing Remaining Time

No precise feasibility.

## No Stress Dump Context

Do not invent main Stress Source.

## <30 Previous Completed Check-Ins

No Personal Baseline Comparison.

## Insufficient Historical Evidence

No Sustained Strain.

Unknown means unknown.

---

# 23. AI Failure Contract

## Analysis AI fails

Still show deterministic facts.

State that interpretation is unavailable.

## Stress Dump extraction fails

Preserve raw input where session is valid.

Allow retry.

Do not fabricate extraction.

## Balance AI fails

Keep current Analysis.

Apply nothing.

---

# 24. Recalculation Contract

| Trigger | Recalculate |
|---|---|
| Finish & Save Check-In | subjective facts + Analysis |
| Retest | subjective facts + Analysis |
| Create Workload | feasibility + Analysis |
| Edit planning-relevant Workload | feasibility + Analysis |
| Complete/Reopen Workload | feasibility + Analysis |
| Change Remaining Time | feasibility + Analysis |
| Change Demand | Analysis |
| Add/Move Focus Block | availability + feasibility + Analysis |
| Change Protected Rest | availability + feasibility + Analysis |
| Google Calendar import/update | availability + feasibility + Analysis |
| Confirm Stress Dump data | relevant facts + Analysis |
| Apply Balance | relevant facts + Analysis |
| Undo Balance Remove | relevant facts + Analysis |
| Open Map only | no rerun if source state unchanged |

### Subtask exception

If only Subtask completion changes:

→ update progress.

Do not alter planning solely because progress changed.

---

# 25. Core Data Shapes

Names may adapt to existing codebase.

Conceptual meaning must remain.

## Check-In

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

## Workload

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

## Subtask

```text
subtask_id
workload_id
name
is_completed
```

## Focus Block

```text
planning_block_id
start_datetime
end_datetime
planned_workload_id?
```

## Historical Daily Snapshot

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

## Analysis Result

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

## Balance Plan

```text
balance_plan_id
created_at
source_trigger
balance_summary

actions[]
    action_id
    action_type
    workload_id?
    reason
    proposed_change
    suggested_result
    schedule_changes[]
    scope_changes[]
    expected_tradeoff
    selected
    edited
    dismissed
    fields_that_would_change[]

recovery_suggestions[]
```

Do not require irrelevant fields for every action.

---

# 26. Forbidden Metrics / Equivalences

Do not create visible or hidden:

```text
Workload Stress Score
Overall Capacity Score
Capacity Percentage
mandatory Capacity Status
global Social Support Score
Recovery Score
Recovery State Score
Burnout Percentage
Burnout Probability
Burnout Diagnosis
manual Time Pressure rating
Overall Demand Score
Numeric Priority Score
Physical Condition Score
```

Do not implement these false equivalences:

```text
High Stress = Overloaded
Low Energy = Overloaded
Largest Workload Area = Main Strain Source
Empty Calendar = Full Availability
Elapsed Focus Block = Completed Work
Progress = Remaining Time
Progress automatically reduces Remaining Time
Reduce = Lower Demand
Analysis refresh = Balance regeneration
Reconsider = Remove
Focus Block = Workload child
```

Audit **actual rendered user-facing strings**, not only variable names/comments.

---

# 27. Acceptance Tests

Before claiming implementation is correct, verify the relevant scenarios.

## A — Baseline

Given 29 prior completed Check-Ins:

→ no baseline comparison.

Given 30:

→ comparison available.

Missing calendar days do not matter.

---

## B — High Stress + Manageable

→ strong mismatch  
→ Stress Dump may be suggested.

---

## C — Normal Stress + Overloaded

→ strong mismatch  
→ do not claim user feels stressed.

---

## D — No Check-In Today

→ no current subjective values  
→ no current mismatch  
→ objective Analysis still works.

---

## E — Deadline Feasible

```text
3h due tomorrow
5h available before deadline
```

→ feasible.

---

## F — Earlier Deadline Shortfall

```text
A: 5h due Tuesday
B: 4h due Friday
3h available before Tuesday
10h available later
```

→ Tuesday remains short by 2h.

Later availability MUST NOT rescue it.

---

## G — Focus Allocation

```text
Remaining Time = 5h
valid future matching Focus Blocks = 2h
Total Available = 10h
```

Expected:

```text
Allocated = 2h
Unallocated = 8h
Unscheduled required = 3h
```

Remaining Time remains 5h until independently updated.

---

## H — Protected Rest

Default:

`00:00–04:00`

Expected:

- excluded from automatic scheduling availability;
- no visible rest block;
- no automatic Focus Block inside;
- after 04:00 not described as recommended work time.

---

## I — Missing Remaining Time

→ no exact feasibility.

---

## J — Low Energy Alone

→ not automatically Overloaded  
→ not automatically Sustained Strain.

---

## K — Sustained Strain Positive

3 consecutive Strained/Overloaded days + same signal on 3 distinct days:

→ Sustained Strain.

---

## L — Sustained Strain Negative

3 consecutive Strained/Overloaded days but no same repeated signal:

→ no Sustained Strain.

---

## M — 4 of 7

4 Strained/Overloaded days + repeated same signal:

→ Sustained Strain.

---

## N — Missing Historical Check-In

Objective valid status exists:

→ missing Check-In alone does not break strain sequence.

No valid daily status:

→ breaks consecutive sequence.

---

## O — Historical Stability

Freeze yesterday.

Edit today's Workload.

→ yesterday unchanged.

---

## P — Keep

→ zero mutation.

---

## Q — Move / Delay

→ Focus Blocks change  
→ fixed deadline unchanged  
→ progress unchanged  
→ Remaining Time unchanged  
→ Demand unchanged.

---

## R — Reduce

→ concrete scope change  
→ Remaining Time only changes if revised estimate confirmed  
→ progress/Demand unchanged automatically.

---

## S — Remove

→ hidden immediately  
→ Undo <24h works  
→ Undo after expiry unavailable  
→ historical snapshot remains.

---

## T — Reconsider

→ contains what/why/resulting decision  
→ not silently Remove.

---

## U — Apply Balance

→ selected actions apply  
→ Analysis refreshes  
→ Balance does not regenerate automatically.

---

# 28. Existing Prototype Modification Strategy

Before modifying a screen:

1. inspect current implementation;
2. identify what already satisfies the specification;
3. preserve it;
4. identify only missing/conflicting behavior;
5. modify minimum necessary structure;
6. preserve useful styling/components;
7. verify cross-feature consequences;
8. run relevant acceptance scenarios.

Do not aggressively simplify the prototype because a component is not mentioned.

---

# 29. Implementation Workflow for Antigravity

For substantial changes, use this workflow.

## Step 1 — Audit Before Editing

Report:

- relevant files/components;
- current behavior;
- conflicts with Humanreadable Plan;
- missing behavior;
- behavior already correct.

Do not start by proposing unrelated architecture.

---

## Step 2 — Classify the Task

State whether the requested work is primarily:

- Logic / State / Integration;
- UX / UI;
- mixed;
- cleanup/audit.

Respect the corresponding scope boundary.

---

## Step 3 — Identify Contracts Affected

Before editing, identify:

- source data;
- owner;
- derived facts;
- dependent screens;
- recalculation requirements;
- persistent mutations;
- MUST NOT effects.

---

## Step 4 — Implement Minimum Necessary Change

Do not rebuild working features unnecessarily.

---

## Step 5 — Verify Behavior

Test the relevant acceptance scenarios.

Do not only verify that the project compiles.

---

## Step 6 — Report Precisely

Final report should include:

1. files changed;
2. behavior changed;
3. behavior deliberately preserved;
4. acceptance scenarios verified;
5. remaining limitations;
6. any genuine conflict/blocker.

Do not claim “fully aligned” based only on visual similarity or successful build.

---

# 30. Parallel Team Workflow

The Humanreadable Plan is shared by both prototype branches.

## Logic-focused branch

Instruction example:

> Implement or repair product logic, state behavior, persistence, calculations, and cross-feature integration according to the Humanreadable Plan and this implementation contract. Preserve the established visual identity and avoid unnecessary UI redesign.

## UX-focused branch

Instruction example:

> Refine the existing UI/UX according to the Humanreadable Plan. Focus on hierarchy, arrangement, progressive disclosure, CTA placement, information density, screen states, and interaction clarity. Treat all product logic, calculations, data ownership, state transitions, persistence rules, and cross-feature contracts as fixed constraints. Do not alter them.

When branches are later compared/merged, product meaning must remain identical.

---

# 31. Final Implementation Goal

The finished prototype should demonstrate:

```text
User records how they feel
+
User records what they need to handle
+
Calendar provides real scheduling constraints
+
Stress Dump adds confirmed context

        ↓

System calculates deterministic facts

        ↓

Analysis interprets whether the plan is
Manageable / Strained / Overloaded

        ↓

Home summarizes what deserves attention

        ↓

Map explains why

        ↓

User explicitly requests Balance

        ↓

Balance proposes editable candidate changes

        ↓

User selects / edits / confirms

        ↓

Workload / Calendar update

        ↓

Analysis refreshes
```

The finished prototype should feel like an evolution of the existing app, not a different product.

**User-confirmed data and decisions are authoritative.**

AI assists with:

- extraction;
- interpretation;
- explanation;
- planning proposals.

AI must not silently control the user's Workload, Calendar, or persistent product state.