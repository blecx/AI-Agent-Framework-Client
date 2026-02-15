# Help Content Guide

## Purpose

This guide defines how to add and maintain in-app help content for context help, guided co-authoring, and workflow documentation.

## Add a new help topic

1. Add topic metadata in `client/src/content/helpTopics.ts`.
2. Add translations under `help.topics.*` in:
   - `client/src/i18n/i18n.en.json`
   - `client/src/i18n/i18n.de.json`
3. If needed, add step-by-step docs under `help.docs.<topic-id>`.
4. Validate routes with `/help` and `/help/<topic-id>`.

## Add contextual field help

1. Define `help.formFields.*` translations.
2. Use `HelpTooltip` in complex forms (for example `ArtifactEditor`).
3. Link to a relevant help route via `learnMorePath`.

## Writing guidance

- Keep tooltip copy concise and task-focused.
- Use plain language before introducing domain terms.
- Include at least one actionable step in docs topics.
- Keep EN and DE content in sync.

## Validation checklist

- `npm run lint`
- `npm run test -- --run`
- `npm run build`
