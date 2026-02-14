# Accessibility Guidelines

This project targets WCAG 2.1 AA compliance for core workflows.

## Keyboard Navigation

- `Tab` / `Shift+Tab`: move focus forward/backward
- `Enter` / `Space`: activate controls
- `Escape`: close dialogs and overlays

## Implemented Patterns

### Skip to content

A global skip-link is rendered at app start and focuses `#main-content`:

- Component: `client/src/components/SkipToContent.tsx`
- Target: `<main id="main-content" tabIndex={-1}>`

### Dialog accessibility

`Modal` and `ConfirmDialog` include:

- `role="dialog"` + `aria-modal="true"`
- keyboard close on `Escape`
- focus trap for `Tab`/`Shift+Tab`
- previous focus restoration on close

### Loading and notifications

- Loading spinner exposes `role="status"` with `aria-live`
- Toasts use `role="alert"`
  - `error`/`warning` => `aria-live="assertive"`
  - `success`/`info` => `aria-live="polite"`

### Focus visibility

Global focus indicators are provided in `client/src/index.css`:

- `:focus-visible` outline styles
- high-contrast media fallback

## Validation Checklist

- Run lint/build/tests:
  - `npm run lint`
  - `npm run test`
  - `npm run build`
- Verify keyboard-only navigation through:
  - main navigation
  - forms
  - modal dialogs
- Verify screen reader announcements for:
  - errors (`role="alert"`)
  - loading (`role="status"`)

## Notes

Lighthouse and axe extension audits should be run in-browser as part of manual QA for release candidates.
