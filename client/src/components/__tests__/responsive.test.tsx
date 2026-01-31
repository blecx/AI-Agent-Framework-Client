import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Responsive design tests for Issue #46
 *
 * These tests validate that responsive CSS media queries exist in component stylesheets.
 * Actual visual responsive behavior is tested manually at breakpoints:
 * - Mobile: <640px
 * - Tablet: <768px
 * - Desktop: >1024px
 */
describe('Responsive Design CSS', () => {
  // Determine project root: go up from client/src/components/__tests__ to project root
  const projectRoot = resolve(__dirname, '../../../../');

  // Paths are relative to project root
  const cssFiles = [
    'src/App.css',
    'src/components/Breadcrumb.css',
    'src/components/ProjectSelector.css',
    'client/src/components/CommandPanel.css',
    'client/src/components/ProjectCommandPanel.css',
    'client/src/components/ProjectView.css',
    'client/src/components/ApplyPanel.css',
    'client/src/components/ProposePanel.css',
    'client/src/components/ProjectList.css',
    'client/src/components/chat/ChatInput.css',
    'client/src/components/chat/ChatInterface.css',
    'client/src/components/chat/ChatMessageBubble.css',
    'client/src/components/chat/ChatMessageList.css',
  ];

  cssFiles.forEach((filePath) => {
    it(`should have responsive breakpoints in ${filePath}`, () => {
      const fullPath = resolve(projectRoot, filePath);

      // Verify file exists before reading
      expect(existsSync(fullPath)).toBe(true);
      const content = readFileSync(fullPath, 'utf-8');

      // Check for mobile or tablet media queries
      const hasResponsive =
        content.includes('@media (max-width: 640px)') || // mobile
        content.includes('@media (max-width: 768px)') || // tablet
        content.includes('@media (max-width: 1024px)'); // large tablet/small desktop

      expect(hasResponsive).toBe(true);
    });
  });

  it('should use consistent breakpoint values', () => {
    const expectedBreakpoints = [
      '@media (max-width: 640px)', // mobile
      '@media (max-width: 768px)', // tablet
    ];

    const foundBreakpoints = new Set<string>();

    cssFiles.forEach((filePath) => {
      const fullPath = resolve(projectRoot, filePath);
      const content = readFileSync(fullPath, 'utf-8');

      expectedBreakpoints.forEach((breakpoint) => {
        if (content.includes(breakpoint)) {
          foundBreakpoints.add(breakpoint);
        }
      });
    });

    // Should have used both mobile and tablet breakpoints
    expect(foundBreakpoints.size).toBeGreaterThanOrEqual(2);
  });
});
