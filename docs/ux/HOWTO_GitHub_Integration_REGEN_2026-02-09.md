# HOWTO – Deliverables in GitHub einpflegen (inkl. Befehle)
**Datum:** 2026-02-09

## Empfohlene Zielstruktur
- `docs/ux/`
  - `UI-Client_UX-Review_Workflow-Findings-Recommendation_REGEN_2026-02-09.md`
  - `UI_Wording_and_State_Set_Copilot_Source_REGEN_2026-02-09.md`
  - `Bericht_App-Build_Initiale-QA_REGEN_2026-02-09.md`
  - `HOWTO_GitHub_Integration_REGEN_2026-02-09.md`
- `docs/ux/string-catalog/`
  - `string-catalog_REGEN_2026-02-09.csv`
  - `string-catalog_REGEN_2026-02-09.xlsx`
- `client/src/i18n/`
  - `i18n.de_REGEN_2026-02-09.json`
  - `i18n.en_REGEN_2026-02-09.json`

## Git-Workflow
```bash
git clone <REPO_URL>
cd <REPO_ORDNER>

git checkout -b chore/ui-ux-deliverables

mkdir -p docs/ux docs/ux/string-catalog client/src/i18n

# ZIP entpackt nach /tmp/ui-ux
cp /tmp/ui-ux/UI-Client_UX-Review_Workflow-Findings-Recommendation_REGEN_2026-02-09.md docs/ux/
cp /tmp/ui-ux/UI_Wording_and_State_Set_Copilot_Source_REGEN_2026-02-09.md docs/ux/
cp /tmp/ui-ux/Bericht_App-Build_Initiale-QA_REGEN_2026-02-09.md docs/ux/
cp /tmp/ui-ux/HOWTO_GitHub_Integration_REGEN_2026-02-09.md docs/ux/

cp /tmp/ui-ux/string-catalog_REGEN_2026-02-09.csv docs/ux/string-catalog/
cp /tmp/ui-ux/string-catalog_REGEN_2026-02-09.xlsx docs/ux/string-catalog/

cp /tmp/ui-ux/i18n.de_REGEN_2026-02-09.json client/src/i18n/i18n.de.json
cp /tmp/ui-ux/i18n.en_REGEN_2026-02-09.json client/src/i18n/i18n.en.json

git add docs/ux client/src/i18n
git commit -m "Add UX review, Copilot wording/state spec, and i18n catalogs"
git push -u origin chore/ui-ux-deliverables
```
