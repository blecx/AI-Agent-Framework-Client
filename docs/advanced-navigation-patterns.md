# Advanced Navigation Patterns (Multi-Role + Conflict Resolution)

This note defines the navigation intent for issue slice `P3-UX-02`.

## Multi-Role Journey Model

The UI should make role journeys explicit while preserving one coherent workflow:

1. **Planner journey**
   - Entry: project readiness path
   - Goal: define scope and readiness before review gates
2. **Reviewer journey**
   - Entry: proposal/review path
   - Goal: evaluate and request changes with context
3. **Approver journey**
   - Entry: apply/approval path
   - Goal: confirm decisions and move work forward safely

## Conflict-Resolution Flow

Conflict resolution must be reachable from relevant workflow states, especially apply/review contexts.

Expected behavior:
- User can navigate to conflict-resolution without leaving the project workflow.
- Next actions are explicit: resolve now, defer with rationale, or return to prior workflow step.
- The flow avoids dead ends and keeps traceability to audit/review surfaces.

## UX Evidence Expectations (PR)

For navigation-affecting changes, include checked evidence in `## UX / Navigation Review` for:
- Multi-role workflow journey validation (planner/reviewer/approver)
- Conflict-resolution flow validation with clear next actions

## Non-Trivial Design Quality Bar

- Route grouping supports discovery → execution → review → traceability.
- Navigation decisions include rationale/trade-offs.
- Responsive and accessibility constraints remain satisfied.
