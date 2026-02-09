# UI Wording & State Set (Copilot Source)
**Datum:** 2026-02-09  
**Standard:** Guided Builder / Assisted Creation / Artifact Builder / Readiness Builder / Guided Co-Authoring

---

## 0) Microcopy-Regeln
- Ton: sachlich, direkt.
- Buttons: Verb + Objekt.
- Fehler: Problem + Aktion.
- Statuslabels kurz, konsistent.

## 1) Begriffe (verbindlich)
- Guided Builder (Umbrella)
- Assisted Creation (Entry Action)
- Artifact Builder (Artefaktbereich)
- Readiness Builder (Reifegradbereich)
- Guided Co-Authoring (Konzept/Help)

## 2) Standard States
Loading / Empty / Error / Stale

## 3) Assisted Creation
Controls: Pausieren, Fortsetzen, Entwurf speichern, Snapshot speichern, Beenden  
States: Draft, Ready for review, Blocked, Failed

## 4) Artifact Builder
Actions: Create/Edit/Improve with AI/Propose/Review/Apply/Reject/Snapshot/Export  
States: draft, inReview, applied, needsAttention, complete, outdated, conflict

## 5) Readiness Builder
States: notAssessed, inProgress, pass, warn, fail  
CTAs kontextabhängig.

## 6) Sync & Conflicts (ohne Git-Begriffe)
Sync States: clean/ahead/behind/diverged/running/failed/conflict  
Conflict Resolution: AI suggestion / mine / remote / manual + Review + Validate
