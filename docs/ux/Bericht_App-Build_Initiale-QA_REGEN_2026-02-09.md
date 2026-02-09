# Bericht – App bauen (React/TypeScript UI für bestehende REST-API)
**Datum:** 2026-02-09

---

## Ausgangslage
- React/TypeScript Frontend, existierende REST-API/CRUD Contract.
- Multi-Repo, Dokumentation weitgehend vorhanden.
- Hauptunsicherheit: UX-Qualität und Workflow-Konsistenz.

## Wie beschreibt man die App sinnvoll?
1. Domänenmodell + Statusmodell (Project/Artifact/Readiness/Proposal/RAID/History/Sync).
2. Top Use-Cases (3–7) + DoD.
3. Task Flows (Start → Ende, Fehlpfade/States).
4. IA (Navigation, Routen, Module).
5. API-Mapping (Actions → Endpoints, Loading/Empty/Error).
6. NFRs (A11y, Performance, Audit/Traceability, Offline/Sync).

## Wo anfangen?
- Rollen/Ziele fixieren → Domänen-/Statusmodell → Workflow Map → Heuristik/Walkthrough → Backlog.

## AI kann übernehmen
- Workflow Mapping, UX-Heuristik, Walkthrough, Testplan, Ticket-Backlog, Wording/State Set + i18n.

## Interviews?
Ja. Output: Use-Cases+DoD, Regeln Workflowwahl, Glossar/Wording, Rollen/Permissions, Review Gate Requirements.

## Standards/„kopieren“?
Patterns kopieren, nicht Pixel. Fokus: Systemstatus, Fehlerprävention, Undo/History, Review Gate, WCAG/A11y.
