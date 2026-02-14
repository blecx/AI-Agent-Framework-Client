# UX Deliverables Integration Plan

**Date:** 2026-02-13  
**Source:** ui-ux-deliverables_REGEN_2026-02-09.zip  
**Target:** AI-Agent-Framework-Client

---

## Executive Summary

The UX deliverables have been extracted and analyzed. Key findings:

- ✅ **Documentation files are already integrated** into `docs/ux/`
- ✅ **i18n files are already integrated** into `client/src/i18n/`
- ✅ **i18n infrastructure is working** (i18next + react-i18next)
- ⚠️ **i18n is NOT being used in main components** yet (only example components)
- ❌ **Key UX components are missing**: Guided Builder, Assisted Creation, Readiness Builder
- ⚠️ **Several S0/S1 UX issues** from the review need addressing

---

## 1. Deliverables Status

### Already Integrated ✅

| File | Target Location | Status |
|------|----------------|--------|
| UI-Client_UX-Review_Workflow-Findings-Recommendation_REGEN_2026-02-09.md | docs/ux/ | ✅ Integrated |
| UI_Wording_and_State_Set_Copilot_Source_REGEN_2026-02-09.md | docs/ux/ | ✅ Integrated |
| Bericht_App-Build_Initiale-QA_REGEN_2026-02-09.md | docs/ux/ | ✅ Integrated |
| HOWTO_GitHub_Integration_REGEN_2026-02-09.md | docs/ux/ | ✅ Integrated |
| string-catalog_REGEN_2026-02-09.csv | docs/ux/string-catalog/ | ✅ Integrated |
| string-catalog_REGEN_2026-02-09.xlsx | docs/ux/string-catalog/ | ✅ Integrated |
| i18n.en_REGEN_2026-02-09.json | client/src/i18n/i18n.en.json | ✅ Integrated |
| i18n.de_REGEN_2026-02-09.json | client/src/i18n/i18n.de.json | ✅ Integrated |

### i18n Structure Coverage

The i18n files define translations for these modules:
- `nav` - Navigation (Projects, Guided Builder, Artifact Builder, Readiness Builder, RAID, History, Sync)
- `conn` - Connection states (online, offline, reconnecting, degraded)
- `banner` - Global banners (offline, degraded connection)
- `projects` - Project management
- `gb` - Guided Builder
- `ac` - Assisted Creation
- `art` - Artifact Builder
- `rd` - Readiness Builder
- `proposal` - Proposal/change management
- `sync` - Sync and conflict resolution

---

## 2. Existing Component Inventory

### Current Components (29 total)

**Core Features:**
- ProjectList, ProjectView, ProjectCommandPanel
- ArtifactEditor, ArtifactList
- ProposalCreator, ProposalList, ProposalReview, ProposePanel, ApplyPanel
- RAIDList, RAIDDetail
- CommandPanel
- DiffViewer, AuditViewer, AuditBadge

**UI Infrastructure:**
- ErrorBoundary, LoadingSkeleton
- Toast, ToastContainer, ToastContext
- ConfirmDialog, InputModal
- ApiTester, UiLibraryDemo

**i18n (Example only):**
- I18nExample, LanguageSwitcher

### Current Routes

From App.tsx:
- `/` - Home
- `/projects` - Project list
- `/projects/:projectKey` - Project detail
- `/projects/:projectKey/propose` - Create proposal
- `/projects/:projectKey/apply` - Apply changes
- `/projects/:projectKey/artifacts` - Artifacts view
- `/project/:key` - Legacy route (inconsistent param naming)

---

## 3. Gap Analysis: What's Missing

### 3.1 Critical UX Components (S0/S1)

#### ❌ Guided Builder Module
- **Status:** Not implemented
- **i18n Ready:** ✅ Yes (`gb.*` keys defined)
- **Description:** Primary entry point for AI-assisted project setup
- **Components Needed:**
  - `GuidedBuilder.tsx` - Main orchestrator
  - `GuidedBuilderNav.tsx` - Step navigation
  - `GuidedBuilderProgress.tsx` - Progress indicator

#### ❌ Assisted Creation Flow
- **Status:** Not implemented
- **i18n Ready:** ✅ Yes (`ac.*` keys defined)
- **Description:** AI-guided artifact creation with pause/resume
- **Components Needed:**
  - `AssistedCreation.tsx` - Flow container
  - `AssistedCreationControls.tsx` - Pause/Resume/Save controls
  - `AssistedCreationPrompt.tsx` - Guided prompting UI
  - `AssistedCreationDraft.tsx` - Draft preview

#### ❌ Readiness Builder
- **Status:** Not implemented
- **i18n Ready:** ✅ Yes (`rd.*` keys defined)
- **Description:** Project maturity assessment with gap analysis
- **Components Needed:**
  - `ReadinessBuilder.tsx` - Main dashboard
  - `ReadinessPanel.tsx` - Status + gaps display
  - `ReadinessChecks.tsx` - Individual check items

#### ⚠️ Artifact Builder Redesign
- **Status:** Partial (ArtifactEditor exists but doesn't match spec)
- **i18n Ready:** ✅ Yes (`art.*` keys defined)
- **Description:** Enhanced artifact management per UX spec
- **Components Needed:**
  - Refactor `ArtifactEditor.tsx` to use i18n
  - Add state management per spec (draft, inReview, applied, etc.)
  - Add "Improve with AI" action

### 3.2 Sync & Offline Support (S1/S2)

#### ❌ Connection Status Indicator
- **Status:** Not implemented
- **i18n Ready:** ✅ Yes (`conn.*` keys defined)
- **Components Needed:**
  - `ConnectionStatus.tsx` - Status indicator
  - `ConnectionBanner.tsx` - Offline/degraded banner
  - `OfflineActions.tsx` - Work offline / Retry actions

#### ❌ Sync UI
- **Status:** Not implemented
- **i18n Ready:** ✅ Yes (`sync.*` keys defined)
- **Components Needed:**
  - `SyncPanel.tsx` - Sync status display
  - `ConflictResolver.tsx` - Conflict resolution UI
  - `SyncHistory.tsx` - Sync history log

### 3.3 Navigation Restructure (S1)

#### ⚠️ Main Navigation
- **Current:** Basic routing
- **Required:** Prominent Guided Builder entry, consistent naming
- **Components Needed:**
  - `MainNav.tsx` - Enhanced navigation with i18n
  - Update App.tsx routes to match i18n nav structure
  - Fix inconsistent route param naming (projectKey vs key)

### 3.4 i18n Integration (S2)

#### ❌ Existing Components Need i18n
- **Status:** Most components have hardcoded English strings
- **Priority:** High (foundation for all UX improvements)
- **Components to Update:**
  - ProjectList, ProjectView
  - ArtifactEditor, ArtifactList
  - ProposalCreator, ProposalList, ProposalReview
  - RAIDList, RAIDDetail
  - CommandPanel, ProjectCommandPanel
  - All UI infrastructure components (modals, toasts, etc.)

### 3.5 UX Pattern Standardization (S2/S3)

#### ⚠️ Empty States
- **Current:** Inconsistent or missing
- **Required:** Consistent pattern with CTA
- **Components Needed:**
  - `EmptyState.tsx` - Reusable empty state component
  - Update all list components to use it

#### ⚠️ Review Gate Pattern
- **Current:** Partial (DiffViewer exists)
- **Required:** Standardized across all workflows
- **Components Needed:**
  - `ReviewGate.tsx` - Reusable review/apply/reject pattern
  - Update ProposalReview to use it

#### ⚠️ Table/Filter Pattern
- **Current:** Not standardized
- **Required:** Consistent table with filters + query params
- **Components Needed:**
  - `DataTable.tsx` - Reusable table component
  - `TableFilters.tsx` - Filter UI with URL sync

---

## 4. Implementation Roadmap

### Phase 1: Foundation (Week 1)

**Priority:** Critical infrastructure for all subsequent work

1. **Issue #1**: Enable i18n in Existing Core Components
   - Size: M (100-150 LOC)
   - Scope: ProjectList, ProjectView, ArtifactEditor, RAIDList
   - Acceptance: All strings use `t()` hook from i18n
   - Testing: Language switcher works across all pages

2. **Issue #2**: Fix Route Parameter Inconsistency (S0 Blocker)
   - Size: S (< 50 LOC)
   - Scope: Standardize to `projectKey` everywhere
   - Acceptance: All routes use consistent naming
   - Testing: Navigation works without 404s

3. **Issue #3**: Create Reusable Empty State Component
   - Size: S (< 50 LOC)
   - Scope: EmptyState.tsx with i18n support
   - Acceptance: Used in ProjectList, ArtifactList, RAIDList
   - Testing: Empty states render correctly with translations

### Phase 2: Connection & Sync (Week 2)

**Priority:** Foundation for offline-first UX (S1/S2)

4. **Issue #4**: Implement Connection Status Indicator
   - Size: M (80-120 LOC)
   - Scope: ConnectionStatus, ConnectionBanner components
   - Acceptance: Shows online/offline/degraded states with i18n
   - Testing: Status updates on network change

5. **Issue #5**: Create Sync Panel & Conflict Resolver UI
   - Size: L (150-200 LOC)
   - Scope: SyncPanel, ConflictResolver, SyncHistory
   - Acceptance: Displays sync status, allows conflict resolution
   - Testing: Manual and automated conflict scenarios

### Phase 3: Guided Experience (Week 3)

**Priority:** Primary UX improvement (S1)

6. **Issue #6**: Implement Guided Builder Module
   - Size: L (200-250 LOC)
   - Scope: GuidedBuilder, GuidedBuilderNav, GuidedBuilderProgress
   - Acceptance: Navigation to Guided Builder, step progression
   - Testing: E2E test for complete guided flow

7. **Issue #7**: Implement Assisted Creation Flow
   - Size: L (200-250 LOC)
   - Scope: AssistedCreation with pause/resume/save
   - Acceptance: AI-guided creation with draft management
   - Testing: Pause/resume works, drafts persist

### Phase 4: Builders & Assessment (Week 4)

**Priority:** Complete feature set per spec

8. **Issue #8**: Refactor Artifact Builder to Match Spec
   - Size: M (120-150 LOC)
   - Scope: Update ArtifactEditor with state machine + i18n
   - Acceptance: States (draft/inReview/applied), "Improve with AI"
   - Testing: State transitions, AI improvement flow

9. **Issue #9**: Implement Readiness Builder
   - Size: L (180-220 LOC)
   - Scope: ReadinessBuilder, ReadinessPanel, ReadinessChecks
   - Acceptance: Displays project maturity, gaps, CTAs
   - Testing: Pass/warn/fail checks render correctly

### Phase 5: UX Polish (Week 5)

**Priority:** Standardization and A11y (S2/S3)

10. **Issue #10**: Create Reusable Data Table Component
    - Size: M (120-150 LOC)
    - Scope: DataTable, TableFilters with URL sync
    - Acceptance: Used in lists, filters persist in URL
    - Testing: Sorting, filtering, pagination work

11. **Issue #11**: Standardize Review Gate Pattern
    - Size: S (60-80 LOC)
    - Scope: ReviewGate component, update ProposalReview
    - Acceptance: Consistent diff/check/apply/reject UX
    - Testing: Review flow works in proposals

12. **Issue #12**: Accessibility Audit & Fixes (S2)
    - Size: M (varies by findings)
    - Scope: Keyboard navigation, ARIA labels, focus management
    - Acceptance: WCAG 2.1 AA compliance
    - Testing: Automated a11y tests pass

### Phase 6: Navigation & Help (Week 6)

**Priority:** Findability improvements (S1)

13. **Issue #13**: Implement Enhanced Main Navigation
    - Size: M (100-120 LOC)
    - Scope: MainNav with prominent Guided Builder CTA
    - Acceptance: All i18n nav items, Guided Builder prominent
    - Testing: Navigation matches UX spec

14. **Issue #14**: Add Context Help & Guided Co-Authoring Docs
    - Size: S (< 50 LOC)
    - Scope: Help tooltips, link to concept docs
    - Acceptance: Help available on key workflows
    - Testing: Help content displays correctly

---

## 5. Dependencies & Risks

### Cross-Repo Dependencies

Most UI work is client-side only, but some features require backend support:

- **Assisted Creation AI calls** → Backend must provide AI endpoints
- **Readiness checks** → Backend must provide check definitions
- **Sync/conflict resolution** → Backend must handle merge strategies

### Technical Risks

- **i18n Performance:** Adding i18n to all components may impact bundle size
  - Mitigation: Lazy-load translations, code-split by route
- **State Management:** Complex workflows may need Zustand or Redux
  - Mitigation: Start with React Query + context, refactor if needed
- **Offline Sync:** Git-backed offline requires service worker
  - Mitigation: Use IndexedDB + sync on reconnect, defer full offline mode

### Resource Estimate

- **Total Issues:** 14
- **Total Effort:** ~12-15 developer-days (assuming 1-2 developers)
- **Timeline:** 6 weeks with 1 developer, 3 weeks with 2 developers
- **Testing Effort:** +20% for E2E tests and manual QA

---

## 6. Success Metrics

### UX Quality Gates

- ✅ All S0 blockers resolved (dead-ends, routing)
- ✅ All S1 issues resolved (Guided Builder visible, proposal UX, review/history)
- ✅ 100% i18n coverage for all user-facing strings
- ✅ WCAG 2.1 AA accessibility compliance

### User Experience Metrics

- **Guided Builder adoption:** > 60% of projects start via Guided Builder
- **Assisted Creation completion:** > 70% of assisted flows complete
- **Empty state engagement:** > 40% click-through on CTA buttons
- **Offline resilience:** 0 data loss on connection drop

### Technical Metrics

- **i18n Coverage:** 100% of components use `useTranslation`
- **Type Safety:** All i18n keys type-checked (via TypeScript)
- **Test Coverage:** > 80% for new components
- **Bundle Size:** < 10% increase from i18n integration

---

## 7. Next Steps

### Immediate Actions (This Week)

1. ✅ Review and validate this plan with team
2. 🔲 Create GitHub issues for Phase 1 (Issues #1-3)
3. 🔲 Set up i18n type generation (optional but recommended)
4. 🔲 Assign Phase 1 issues to developers

### Week 2-3 Actions

5. 🔲 Begin implementation of Phase 1 issues
6. 🔲 Create GitHub issues for Phase 2 (Issues #4-5)
7. 🔲 Start E2E test planning for Guided Builder

### Ongoing

- Weekly review of UX implementation progress
- Bi-weekly user testing sessions (if possible)
- Continuous ci run and validation

---

## 8. References

- [UX Review Document](docs/ux/UI-Client_UX-Review_Workflow-Findings-Recommendation_REGEN_2026-02-09.md)
- [Wording & State Spec](docs/ux/UI_Wording_and_State_Set_Copilot_Source_REGEN_2026-02-09.md)
- [String Catalog](docs/ux/string-catalog/string-catalog_REGEN_2026-02-09.csv)
- [i18n Config](client/src/i18n/config.ts)

---

**Document Status:** Draft for review  
**Last Updated:** 2026-02-13  
**Next Review:** After Phase 1 completion
