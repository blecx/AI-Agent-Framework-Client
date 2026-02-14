# UX Integration Issues Tracking

**Created:** 2026-02-14  
**Source:** UX deliverables from `ui-ux-deliverables_REGEN_2026-02-09.zip`  
**Plan:** See `UX-INTEGRATION-PLAN.md` for detailed roadmap

## Overview

14 issues created across 6 phases to integrate UX improvements from the February 2026 UX review.

**Total Effort:** ~15 dev-days (23-26.5 hours)  
**Duration:** 6 weeks (2-3 issues/week)  
**Repository:** [blecx/AI-Agent-Framework-Client](https://github.com/blecx/AI-Agent-Framework-Client)

---

## Phase 1: Foundation (Week 1)

### [#150](https://github.com/blecx/AI-Agent-Framework-Client/issues/150) - Add i18n to Core Components
- **Priority:** S0 (Blocker)
- **Effort:** 1 hour
- **Labels:** enhancement, ux, ui, i18n
- **Description:** Integrate i18next into core components (ProjectList, ArtifactEditor, RAIDList, etc.)
- **Status:** 🟡 Open

### [#151](https://github.com/blecx/AI-Agent-Framework-Client/issues/151) - Fix Route Parameter Handling
- **Priority:** S0 (Blocker)
- **Effort:** <1 hour
- **Labels:** bug, ux
- **Description:** Fix inconsistent route parameter handling (projectKey vs projectId)
- **Status:** 🟡 Open

### [#152](https://github.com/blecx/AI-Agent-Framework-Client/issues/152) - Implement Empty State Component
- **Priority:** S1 (High)
- **Effort:** 1 hour
- **Labels:** enhancement, ux, ui
- **Description:** Create reusable EmptyState component for empty lists/data
- **Status:** 🟡 Open

---

## Phase 2: Connection & Sync (Week 2)

### [#153](https://github.com/blecx/AI-Agent-Framework-Client/issues/153) - Implement Connection Status Banner
- **Priority:** S1 (High)
- **Effort:** 1-1.5 hours
- **Labels:** enhancement, ux, ui
- **Description:** Add connection status indicator and reconnection handling
- **Dependencies:** #150 (i18n)
- **Status:** 🟡 Open

### [#154](https://github.com/blecx/AI-Agent-Framework-Client/issues/154) - Build Sync Panel & Conflict Resolver
- **Priority:** S1 (High)
- **Effort:** 2-2.5 hours
- **Labels:** enhancement, ux, ui
- **Description:** Create sync monitoring panel and git conflict resolution UI
- **Dependencies:** #150 (i18n), #152 (EmptyState)
- **Status:** 🟡 Open

---

## Phase 3: New Workflows (Weeks 3-4)

### [#155](https://github.com/blecx/AI-Agent-Framework-Client/issues/155) - Implement Guided Builder Workflow
- **Priority:** S2 (Medium)
- **Effort:** 3-3.5 hours
- **Labels:** enhancement, ux, ui
- **Description:** Multi-step wizard for creating ISO 21500 compliant projects
- **Dependencies:** #150 (i18n)
- **Status:** 🟡 Open

### [#156](https://github.com/blecx/AI-Agent-Framework-Client/issues/156) - Implement Assisted Creation Workflow
- **Priority:** S2 (Medium)
- **Effort:** 3 hours
- **Labels:** enhancement, ux, ui
- **Description:** Quick artifact creation with AI-powered suggestions
- **Dependencies:** #150 (i18n)
- **Status:** 🟡 Open

---

## Phase 4: Specialized Components (Week 4)

### [#157](https://github.com/blecx/AI-Agent-Framework-Client/issues/157) - Refactor Artifact Builder for Reusability
- **Priority:** S2 (Medium)
- **Effort:** 2-2.5 hours
- **Labels:** enhancement, ux, ui
- **Description:** Extract reusable components from ArtifactEditor
- **Dependencies:** #150 (i18n)
- **Status:** 🟡 Open

### [#158](https://github.com/blecx/AI-Agent-Framework-Client/issues/158) - Implement Readiness Builder Component
- **Priority:** S2 (Medium)
- **Effort:** 2-2.5 hours
- **Labels:** enhancement, ux, ui
- **Description:** Project readiness assessment with automated checks
- **Dependencies:** #150 (i18n), #152 (EmptyState)
- **Status:** 🟡 Open

---

## Phase 5: Standardization & Polish (Week 5)

### [#159](https://github.com/blecx/AI-Agent-Framework-Client/issues/159) - Create Reusable Data Table Component
- **Priority:** S3 (Low)
- **Effort:** 2-2.5 hours
- **Labels:** enhancement, ux, ui
- **Description:** Standardize table/filter patterns with URL state sync
- **Dependencies:** #150 (i18n), #152 (EmptyState)
- **Status:** 🟡 Open

### [#160](https://github.com/blecx/AI-Agent-Framework-Client/issues/160) - Standardize Review Gate Pattern
- **Priority:** S3 (Low)
- **Effort:** 1-1.5 hours
- **Labels:** enhancement, ux, ui
- **Description:** Create reusable ReviewGate component (diff + check + apply/reject)
- **Dependencies:** #150 (i18n)
- **Status:** 🟡 Open

### [#161](https://github.com/blecx/AI-Agent-Framework-Client/issues/161) - Accessibility Audit & Fixes
- **Priority:** S3 (Low)
- **Effort:** 2-4 hours
- **Labels:** enhancement, ux, ui, accessibility
- **Description:** WCAG 2.1 AA compliance audit and fixes
- **Dependencies:** All Phase 1-4 components
- **Status:** 🟡 Open

---

## Phase 6: Documentation & Navigation (Week 6)

### [#162](https://github.com/blecx/AI-Agent-Framework-Client/issues/162) - Implement Enhanced Main Navigation
- **Priority:** S2 (Medium)
- **Effort:** 2 hours
- **Labels:** enhancement, ux, ui
- **Description:** Prominent Guided Builder entry, i18n nav items, visual hierarchy
- **Dependencies:** #150 (i18n), #155 (Guided Builder)
- **Status:** 🟡 Open

### [#163](https://github.com/blecx/AI-Agent-Framework-Client/issues/163) - Add Context Help & Guided Co-Authoring Docs
- **Priority:** S2 (Medium)
- **Effort:** <1 hour
- **Labels:** enhancement, ux, ui, documentation
- **Description:** HelpTooltip component, ISO 21500 concept docs, workflow documentation
- **Dependencies:** #150 (i18n)
- **Status:** 🟡 Open

---

## Implementation Order

**Recommended sequence (respects dependencies):**

1. **Week 1 (Foundation):** #150 → #151 → #152
2. **Week 2 (Connection):** #153 → #154
3. **Week 3 (Guided Builder):** #155
4. **Week 4 (Assisted Creation + Specialized):** #156 → #157 → #158
5. **Week 5 (Standardization):** #159 → #160 → #161
6. **Week 6 (Navigation + Help):** #162 → #163

---

## Issue Templates

Detailed issue templates are available in `.tmp/`:
- `.tmp/issue-ux-01-i18n.md` → Issue #150
- `.tmp/issue-ux-02-route-param.md` → Issue #151
- `.tmp/issue-ux-03-empty-state.md` → Issue #152
- `.tmp/issue-ux-04-connection-status.md` → Issue #153
- `.tmp/issue-ux-05-sync-panel.md` → Issue #154
- `.tmp/issue-ux-06-guided-builder.md` → Issue #155
- `.tmp/issue-ux-07-assisted-creation.md` → Issue #156
- `.tmp/issue-ux-08-artifact-builder-refactor.md` → Issue #157
- `.tmp/issue-ux-09-readiness-builder.md` → Issue #158
- `.tmp/issue-ux-10-data-table.md` → Issue #159
- `.tmp/issue-ux-11-review-gate.md` → Issue #161
- `.tmp/issue-ux-12-accessibility.md` → Issue #161
- `.tmp/issue-ux-13-navigation.md` → Issue #162
- `.tmp/issue-ux-14-context-help.md` → Issue #163

---

## Progress Tracking

Update issue statuses here as work progresses:

- 🟡 **Open:** Not started
- 🔵 **In Progress:** Currently being worked on
- 🟢 **Completed:** Merged to main
- 🔴 **Blocked:** Waiting on dependencies

**Last Updated:** 2026-02-14
