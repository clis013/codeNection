# Restore — Nicole Canonical Demo Scenario (Stage 4B Compatible)

**Purpose:** Canonical deterministic demo and integration-test fixture for the Restore prototype as implemented through **Stage 4B**.

This document supersedes the earlier `restore-demo-scenario.md` wherever the earlier file conflicts with the current Restore architecture.

---

# 0. Current Implementation Boundary

This fixture is designed for the system as it exists after Stage 4B.

Currently implemented and relevant:

- Daily Check-In raw answers and derived perceived-stress score
- Workload records and deterministic workload facts
- Demand/resource `AnalysisInput`
- shared mock `AnalysisResult`
- Calendar foundation
- `FixedBusyEvent`
- `ProtectedTime`
- `FocusBlock`
- `CandidateTimeWindow`
- `TimeResourceFacts`
- Stage 4B deterministic candidate schedule generation:
  - `DeadlineFirst`
  - `BalancedForward`
  - `SustainabilityAware`

Not yet part of the Stage 4B integration test:

- Stage 4C plan ranking / hierarchical evaluation
- Balance AI
- automatic recommendation selection
- full Stress Dump LLM extraction
- real Google Calendar integration
- final Remove / Reconsider / Recover application logic
- historical `Sustained Strain` logic

Therefore this demo fixture must not require those later-stage features to prove Stage 4B works.

---

# 1. Demo Purpose

Nicole is a university student entering another demanding week after a difficult previous week.

Her instinct is:

> “I should finish the OS quiz first because it has the nearest deadline.”

Restore should reveal why nearest-deadline-only planning is incomplete when several workloads compete for the same future time.

The Stage 4B demo should prove that Restore can:

1. store a coherent current Check-In;
2. store several competing workloads;
3. derive factual workload and calendar context;
4. calculate Candidate Time from fixed events and protected time;
5. generate multiple valid candidate schedules;
6. show meaningful behavioral differences between:
   - DeadlineFirst,
   - BalancedForward,
   - SustainabilityAware;
7. avoid inventing capacity, stress, or future energy values.

The demo must not hardcode a desired psychological conclusion merely to make the story work.

---

# 2. Demo User

**Name:** Nicole

**Context:** University student currently in semester.

**Current situation:**

- Operating System quiz is approaching.
- Web Programming group assignment is due soon after.
- FCG test follows several days later.
- Nicole also has Tech Carnival committee commitments.
- Some group-assignment work has expanded because teammates have not completed their parts.
- She remains exhausted after a difficult previous week.

The prototype does not require Nicole's university, age, degree, year, or committee title for this fixture.

---

# 3. Canonical Demo Anchor

For deterministic testing, use:

**Local demo datetime:** `2026-09-08T22:15:00+08:00`

**Timezone:** Asia/Kuala_Lumpur / UTC+08:00

This is a **canonical fixture decision for reproducibility**, not a claim that this exact timestamp was previously user-confirmed.

All relative dates in this file use this anchor.

The default scheduling horizon for the Stage 4B demo is:

**Start:** `2026-09-08T22:15:00+08:00`  
**End:** `2026-09-15T22:15:00+08:00`

This matches the current 7-day Candidate Time concept.

---

# 4. Daily Check-In

Use this exact current Check-In:

| Field | Raw value |
|---|---:|
| Q1 — perceived stress | 5 |
| Q2 — control | 2 |
| Q3 — mental demand | 5 |
| Q4 — capability | 2 |
| Q5 — emotion | Exhausted |
| Q6 — energy | 1 |

## Derived values

Perceived-stress score:

`Q1 + (6-Q2) + Q3 + (6-Q4)`

`5 + (6-2) + 5 + (6-2) = 18`

Derived category:

**Very High**

Other factual current-state values:

- Energy: **Low**
- Control: **Low**

Important:

- Q2 and Q4 are reverse-scored only inside the perceived-stress calculation.
- Q2's raw direction still represents Control.
- Emotion does not enter the score.
- A score of 18 does **not** automatically mean `Overloaded`.

## Baseline

Do **not** show a personal 30-check-in baseline in this fixture.

The current baseline rule requires at least 30 prior completed Check-Ins excluding today. The previous scenario did not contain 30 reproducible raw historical records.

Therefore:

- `baselineDiff` should remain unavailable / undefined for this fixture;
- the UI must not show “Significantly higher than usual” from fabricated history.

Historical baseline testing can be added later with a complete 30-record fixture.

---

# 5. Stress Dump Narrative

The canonical narrative text is:

> I thought I would feel better after finally submitting the OOP assignment last week but honestly I'm still so tired.
>
> Now I have an OS quiz coming up and the Web Programming group assignment is also due soon. I feel like I should just focus on OS first because it's the closest deadline, but I'm worried that if I do that I'm going to have no time left for the assignment.
>
> The group assignment is also stressing me out because some parts from my group still aren't done and I feel like I'm slowly taking over more and more of it.
>
> Then there's club stuff too. I'm helping with the Tech Carnival and suddenly there are things I need to prepare for sponsorship and the event. I know I said yes to some of it earlier but right now I really don't know why I'm doing so much.
>
> And I have an FCG test after all of this too. I haven't even started properly.
>
> I just finished such a horrible week and I feel like I'm already going straight into another one. I don't even know what I should do first anymore.

## Stage 4B usage

The current Stress Dump extraction pipeline is not yet the production LLM pipeline.

For the Stage 4B integration test:

- this text is narrative/demo context;
- structured workloads below are seeded directly;
- do not pretend the current extraction implementation produced every structured field perfectly.

Later, Stage 6 can use the same text to test:
- workload matching;
- missing workload discovery;
- clarification;
- structured confirmation;
- StressFactor extraction.

---

# 6. Canonical Active Workloads

The Stage 4B fixture uses these exact structured workloads.

## W1 — Operating System Quiz 1

- id: `os-quiz-1`
- area: Academic
- workloadType: `ExamPrep`
- activityType: `DeepFocus`
- timingType: `Deadline`
- deadline: `2026-09-10T08:00:00+08:00`
- remainingTimeHours: `5`
- importance: `High`
- userPriority: `High`
- timeFlexibility: `Moderate`
- effortFlexibility: `Low`
- demandProfile:
  - cognitive: `High`
  - emotional: `Moderate`
  - physical: `Low`
- schedulingCharacteristics:
  - splittable: `true`
  - spacingPreferred: `true`
  - preferredBlockMinutes: `90`
  - minimumBlockMinutes: `30`
  - source: `workload-default`

Interpretation:
The quiz is close and important, but Nicole does not need all five hours in one continuous block.

---

## W2 — Web Programming Group Assignment

- id: `web-programming-group`
- area: Academic
- workloadType: `Assignment`
- activityType: `DeepFocus`
- timingType: `Deadline`
- deadline: `2026-09-11T23:59:00+08:00`
- remainingTimeHours: `18`
- importance: `High`
- userPriority: `High`
- timeFlexibility: `Moderate`
- effortFlexibility: `Moderate`
- demandProfile:
  - cognitive: `High`
  - emotional: `Moderate`
  - physical: `Low`
- schedulingCharacteristics:
  - splittable: `true`
  - spacingPreferred: `true`
  - preferredBlockMinutes: `90`
  - minimumBlockMinutes: `30`
  - source: `user`

Why 18h:
The demo assumes Nicole confirms that the existing 12h estimate is no longer accurate because she now expects to help with integration and report work.

This is a canonical fixture value for testing.

It does not mean Balance has already reduced/delegated the workload.

---

## W3 — Tech Carnival Sponsorship Preparation

- id: `tech-carnival-sponsorship`
- area: Social
- workloadType: `Project`
- activityType: `Communication`
- timingType: `Deadline`
- deadline: `2026-09-10T18:00:00+08:00`
- remainingTimeHours: `6`
- importance: `High`
- userPriority: `Moderate`
- timeFlexibility: `Moderate`
- effortFlexibility: `Moderate`
- demandProfile:
  - cognitive: `Moderate`
  - emotional: `High`
  - physical: `Low`
- schedulingCharacteristics:
  - splittable: `true`
  - spacingPreferred: `false`
  - preferredBlockMinutes: `60`
  - minimumBlockMinutes: `30`
  - source: `user`

This represents the missing club workload Nicole discovers/clarifies in the demo story.

---

## W4 — FCG Test 1

- id: `fcg-test-1`
- area: Academic
- workloadType: `ExamPrep`
- activityType: `DeepFocus`
- timingType: `Deadline`
- deadline: `2026-09-14T14:00:00+08:00`
- remainingTimeHours: `8`
- importance: `High`
- userPriority: `Moderate`
- timeFlexibility: `High`
- effortFlexibility: `Low`
- demandProfile:
  - cognitive: `High`
  - emotional: `Moderate`
  - physical: `Low`
- schedulingCharacteristics:
  - splittable: `true`
  - spacingPreferred: `true`
  - preferredBlockMinutes: `90`
  - minimumBlockMinutes: `30`
  - source: `workload-default`

The important demo behavior is that BalancedForward should be capable of beginning FCG preparation before every earlier workload is completely finished if postponing it would create a future bottleneck.

---

## W5 — Philosophy Reflection

- id: `philosophy-reflection`
- area: Academic
- workloadType: `Assignment`
- activityType: `Creative`
- timingType: `Deadline`
- deadline: `2026-09-18T23:59:00+08:00`
- remainingTimeHours: `2`
- importance: `Moderate`
- userPriority: `Low`
- timeFlexibility: `High`
- effortFlexibility: `Moderate`
- demandProfile:
  - cognitive: `Moderate`
  - emotional: `Low`
  - physical: `Low`
- schedulingCharacteristics:
  - splittable: `true`
  - spacingPreferred: `false`
  - preferredBlockMinutes: `60`
  - minimumBlockMinutes: `30`
  - source: `workload-default`

Its deadline lies outside the default 7-day horizon.

Stage 4B may include the workload in the workload list, but must not fabricate post-horizon scheduling opportunity.

---

# 7. Optional Future Balance Workloads

The following workloads are part of the broader final demo narrative but are **not required for the Stage 4B scheduler fixture**:

## Optional Tech Carnival Promo Post
Purpose later: demonstrate **Remove**.

## Tech Carnival Booth Decoration Planning
Purpose later: demonstrate **Reconsider**.

Do not add arbitrary exact scheduling fields merely to force these actions into Stage 4B.

They should be finalized when the corresponding Balance action logic is implemented.

---

# 8. Calendar — Fixed Busy Events

Stage 3 owns calendar subtraction.

Use the following `FixedBusyEvent` records.

## Tuesday 8 Sep
- `08:00–10:00` Operating System class

This event occurred before the 22:15 demo anchor and therefore does not affect the future scheduling horizon.

## Wednesday 9 Sep
- `11:00–13:00` Web Programming class
- `14:00–17:00` Object Oriented Programming class
- `19:00–21:00` Tech Carnival committee prep meeting

## Thursday 10 Sep
- `08:00–10:00` Operating System class
- `19:30–21:30` Tech Carnival logistics meeting

## Friday 11 Sep
- `10:00–12:00` Philosophy class

## Saturday 12 Sep
- `09:00–13:00` Tech Carnival event preparation

## Monday 14 Sep
- `08:00–10:00` English Communication
- `11:00–13:00` Web Programming
- `14:00–17:00` FCG

## Tuesday 15 Sep
- `08:00–10:00` Operating System

### Calendar source

For this demo fixture:

`calendarDataSource = "mock"`

The analysis/UI should therefore preserve the limitation that time-resource facts are based on mock calendar data.

---

# 9. Protected Time

Use the current prototype's invisible default protected rest:

**Daily `00:00–04:00`**

This is a `ProtectedTime` rule, not a calendar appointment.

Important:

- Candidate Time must exclude it.
- The UI should not display it as a normal class/meeting.
- `04:00` becoming mathematically unoccupied does not mean Restore is recommending the user work at 04:00.
- Stage 4B is not yet a complete human-sustainability evaluator.

Do not re-add:
- sleep appointments,
- lunch,
- dinner,
- commute

as fixed calendar events.

---

# 10. Existing Focus Blocks

For the canonical Stage 4B demo:

**No existing confirmed FocusBlocks.**

Therefore:

- `plannedHours = 0` for every workload;
- `unscheduledEffortHours = remainingTimeHours`.

Nicole's narrative intention to “do OS first” is a preference/thought, not an already-saved FocusBlock.

---

# 11. Candidate Time

Candidate Time must be calculated by the Stage 3 engine from:

`planning horizon`
minus
`FixedBusyEvent`
minus
`ProtectedTime`
minus
`confirmed FocusBlock`

The demo must not seed `candidateTimeHours` manually.

The scheduler receives the resulting `CandidateTimeWindow[]` as the authoritative scheduling boundary.

Minimum scheduler candidate window:

**30 minutes**

Shorter free gaps may exist as calendar free time but are not valid candidate scheduling windows.

---

# 12. Current Analysis Contract

The fixture provides:

- a completed Daily Check-In;
- multiple active workloads;
- mock Calendar data;
- deterministic workload facts;
- deterministic time-resource facts.

These facts should be passed through the existing:

`buildAnalysisInput()`
→ current Analysis Provider
→ `AnalysisResult`

## Do not seed these as raw values

Do not hardcode:

- `Manageable`
- `Strained`
- `Overloaded`
- `InsufficientData`
- confidence
- evidence
- recoveryNeed
- mismatch

They must come from the current Analysis Provider.

## Expected psychological facts

The following are factual from the Check-In:

- perceived stress: Very High
- energy: Low
- control: Low

These facts alone do not establish `Overloaded`.

## Mismatch

If the current provider derives `Overloaded`, no mismatch is expected because Very High stress + Overloaded is aligned.

If the provider derives `Manageable`, the existing mismatch rule may legitimately detect `HighStressManageableLoad`.

Do not suppress a mismatch merely because the demo story expected something else.

---

# 13. Historical State

The previous scenario used `Sustained Strain`.

That is **not part of the current Stage 2–4B app contract**.

Therefore this Stage 4B-compatible fixture does not require:

- historical daily analysis snapshots;
- `Sustained Strain`;
- rolling 7-day classification logic;
- historical repeated-contributor logic.

Nicole's previous difficult week remains **narrative context only** at this stage.

When historical snapshot logic is intentionally implemented later, a separate reproducible historical fixture should be added rather than fabricating status history now.

---

# 14. Stage 4B Scheduler Expectations

Generate three candidate schedules from the same workload and Candidate Time inputs:

1. `DeadlineFirst`
2. `BalancedForward`
3. `SustainabilityAware`

No candidate is automatically “the winner” in Stage 4B.

Stage 4C ranking is not yet implemented.

---

# 15. DeadlineFirst Expected Behavior

DeadlineFirst should protect workloads with the greatest deadline feasibility pressure.

It must consider more than chronological deadline order.

Conceptually it considers:

- unscheduled required effort;
- remaining Candidate Time before the workload cutoff;
- urgency/cutoff proximity;
- competition for scheduling opportunity.

The expected tendency is:

- strong early protection for OS;
- strong protection for Sponsorship and Web Programming as their cutoffs approach;
- less early protection for FCG unless postponing it creates a serious feasibility problem.

The exact generated blocks are outputs, not fixture inputs.

---

# 16. BalancedForward Expected Behavior

BalancedForward should challenge Nicole's simplistic:

> “Finish OS first, then think about everything else.”

It should protect the OS quiz while also starting other upcoming workloads early enough to reduce future bottleneck risk.

Expected qualitative behavior:

- OS still receives meaningful early time;
- Web Programming begins before OS is completely finished;
- Sponsorship receives enough time before Thursday evening;
- FCG can receive early progress before all nearer deadlines are completely cleared if future opportunity would otherwise become compressed.

BalancedForward is **not** defined as equal daily allocation.

Any internal quota implementation is only a heuristic.

---

# 17. SustainabilityAware Expected Behavior

SustainabilityAware uses the same hard validity and factual feasibility constraints.

Current resource context:

- energyLevel = 1
- controlLevel = 2
- stressCategory = Very High

These values are **current/recent state**, not predictions of future energy.

The strategy may use them as a soft near-term preference only after protecting feasibility.

It must not:

- modify factual feasibility margins;
- claim Nicole will have more energy tomorrow;
- postpone a highly constrained cognitive workload merely because current energy is low.

Even without subjective resource data, SustainabilityAware must still be capable of using:

- spacing;
- demand distribution;
- open-time preservation;
- lower fragmentation.

---

# 18. Hard Scheduling Rules for This Fixture

Every generated plan must obey:

- every proposed FocusBlock is fully contained inside a supplied CandidateTimeWindow;
- no generated FocusBlocks overlap;
- no work occurs after its deadline;
- no work overlaps FixedBusyEvents;
- no work overlaps ProtectedTime;
- no workload receives more scheduled effort than its current unscheduled effort;
- existing confirmed FocusBlocks would not be moved automatically;
- non-splittable workloads would require one continuous valid segment;
- user-confirmed minimum block requirements are hard;
- preferred block lengths are soft unless explicitly confirmed as hard.

All five canonical active workloads in this fixture are splittable.

---

# 19. Small-Fragment Observation

Stage 4B verification already demonstrated that BalancedForward can sometimes produce tiny remainder fragments.

The canonical demo should record such output rather than hiding it.

For example:

- 6-minute block
- 12-minute block

would be technically schedulable but poor human schedule quality.

This is **not a Stage 4B validity failure** unless it violates a hard minimum.

It is an important observation for Stage 4C.

Stage 4C should later evaluate schedule quality such as:

- fragmentation;
- tiny remainder blocks;
- spacing;
- workload concentration;
- future bottlenecks;
- open-time preservation.

Do not modify the demo fixture just to prevent the generator from exposing weaknesses.

---

# 20. Balance Actions — Future Demo Layer

The final hackathon story should eventually demonstrate:

- Keep
- Move / Delay
- Reduce
- Remove
- Reconsider
- Recover

But these are not Stage 4B generated-schedule outputs.

The intended future narrative remains:

### Keep
Protect OS preparation.

### Move / Delay
Do not consume all early time with OS simply because it is nearest.

### Reduce
Nicole can return testing/documentation responsibility to teammates rather than absorbing all unfinished group work.

Potential future confirmed estimate:

`Web Programming 18h → 13h`

Do not apply this reduction in the Stage 4B baseline fixture.

### Remove
Drop an optional Tech Carnival promo post.

### Reconsider
Question whether Nicole needs to lead booth-decoration planning.

### Recover
Protect recovery because current energy is Low and Nicole reports exhaustion.

These actions should be implemented/tested when the corresponding Balance layer exists.

---

# 21. Current Stage 4B Demo Journey

The Stage 4B integration test should use this flow:

1. Load Nicole fixture.
2. Show today's Daily Check-In.
3. Show structured active workloads.
4. Show current Stress & Load Map using the shared AnalysisResult.
5. Calculate 7-day Candidate Time from calendar inputs.
6. Generate:
   - DeadlineFirst,
   - BalancedForward,
   - SustainabilityAware.
7. Inspect actual generated blocks.
8. Compare the schedules manually as a product/development test.
9. Record problems discovered.
10. Use those findings to design Stage 4C.

Stress Dump may be displayed as narrative/demo context, but exact LLM extraction is not yet a Stage 4B requirement.

---

# 22. What the Stage 4B Demo Must Answer

After loading this fixture, inspect:

## Data / analysis
- Is today's Check-In correctly treated as current?
- Is the stress score 18 / Very High?
- Is missing baseline handled honestly?
- Does the current AnalysisResult use the same facts on Home and Map?
- Are mock-calendar limitations visible where appropriate?

## Candidate Time
- Are all retained classes/meetings removed from Candidate Time?
- Is 00:00–04:00 protected rest excluded?
- Are no fake “available capacity” hours introduced?

## Scheduler
- Does DeadlineFirst protect near cutoffs?
- Does BalancedForward start future competing workloads early enough?
- Does SustainabilityAware preserve feasibility while using current resource state only as a soft preference?
- Do any workloads become partially or completely unscheduled?
- Do tiny fragments appear?
- Are there surprising early-morning blocks?
- Is FCG started too late or reasonably protected?
- Does Philosophy consume time despite being outside the default 7-day horizon?
- Would Nicole realistically follow any generated plan?

These observations become evidence for Stage 4C requirements.

---

# 23. What Must NOT Be Faked

Do not change fixture values solely to force the app to display:

- Overloaded
- recoveryNeed
- a specific mismatch
- a specific candidate schedule
- a specific “best plan”

Do not reintroduce:

- total capacity score
- total demand score
- burnout risk percentage
- `Stress = Workload / Capacity`
- fake neutral resource values
- missing-calendar-as-normal
- historical `Sustained Strain` as a current Stage 4B field
- old 31h / 29.75h calculations
- fake 4.5h daily availability
- future energy predictions

If the real current implementation produces an unexpected result, record it and evaluate the rule instead of altering the seed until the output looks good.

---

# 24. Canonical Fixture Summary

## Current Check-In

- Q1: 5
- Q2: 2
- Q3: 5
- Q4: 2
- Emotion: Exhausted
- Energy: 1
- Derived stress score: 18
- Derived stress category: Very High
- Personal baseline: unavailable

## Active workloads

| Workload | Remaining | Deadline |
|---|---:|---|
| OS Quiz | 5h | Thu 10 Sep 08:00 |
| Web Programming Group Assignment | 18h | Fri 11 Sep 23:59 |
| Tech Carnival Sponsorship | 6h | Thu 10 Sep 18:00 |
| FCG Test | 8h | Mon 14 Sep 14:00 |
| Philosophy Reflection | 2h | Fri 18 Sep 23:59 |

## Existing FocusBlocks

None.

## Protected Time

Daily 00:00–04:00.

## Calendar source

Mock.

## Scheduling horizon

8 Sep 2026 22:15 → 15 Sep 2026 22:15.

## Candidate schedule strategies

- DeadlineFirst
- BalancedForward
- SustainabilityAware

## Current-stage historical status

No `Sustained Strain` output.

## Stage 4B result

Generate alternatives only.  
Do not rank or automatically apply them.

---

# 25. Deferred Decisions

These deliberately remain outside this Stage 4B fixture:

- real 30-record historical baseline;
- historical daily snapshot implementation;
- Sustained Strain design if reintroduced later;
- final Stress Dump LLM extraction;
- final StressFactor persistence;
- optional promo-post exact scheduling data;
- decoration-planning exact scheduling data;
- exact Balance recommendation cards;
- final Reduce confirmation and 18h → 13h application;
- Remove application + Undo;
- Reconsider decision persistence;
- Recovery block semantics;
- Stage 4C ranking;
- Balance AI;
- final post-Balance status.

These should be decided when their corresponding implementation stage begins rather than pre-seeded now.
