import { describe, expect, it } from 'vitest';

import { validateUxEvidence } from "./check-ux-evidence.mjs";

describe('validateUxEvidence', () => {
  it('non-UI changes do not require UX evidence', () => {
    const result = validateUxEvidence({
      body: '# Summary\n',
      changedFiles: ['client/scripts/check-docs.mjs'],
    });

    expect(result.ok).toBe(true);
    expect(result.uiTouched).toBe(false);
    expect(result.errors).toEqual([]);
  });

  it('UI changes fail when UX section is missing', () => {
    const result = validateUxEvidence({
      body: '# Summary\n\n## Validation\n',
      changedFiles: ['client/src/App.tsx'],
    });

    expect(result.ok).toBe(false);
    expect(result.uiTouched).toBe(true);
    expect(result.errors.join('\n')).toMatch(/UX \/ Navigation Review/);
  });

  it('UI changes fail when authority checkbox is missing', () => {
    const result = validateUxEvidence({
      body: `# Summary

## UX / Navigation Review
- [x] Responsive behavior validated on target breakpoints.
- [x] Keyboard navigation and a11y pass reviewed.
`,
      changedFiles: ['client/src/components/ProjectView.tsx'],
    });

    expect(result.ok).toBe(false);
    expect(result.errors.join('\n')).toMatch(/blecs-ux-authority/);
  });

  it('UI changes pass with complete UX evidence', () => {
    const result = validateUxEvidence({
      body: `# Summary

## UX / Navigation Review
- [x] blecs-ux-authority consulted: pass
- [x] Responsive behavior validated on desktop/tablet/mobile breakpoints.
- [x] Navigation + keyboard/a11y checks passed with evidence in manual test section.
`,
      changedFiles: ['client/src/components/ProjectView.tsx', 'client/src/index.css'],
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
