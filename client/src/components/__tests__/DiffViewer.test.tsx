/**
 * DiffViewer Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { DiffViewer } from '../DiffViewer';

describe('DiffViewer', () => {
  const oldContent = 'line 1\nline 2\nline 3';
  const newContent = 'line 1\nline 2 modified\nline 3\nline 4';

  // =========================================================================
  // Basic Rendering Tests
  // =========================================================================

  describe('Basic Rendering', () => {
    it('renders unified diff view by default', () => {
      render(<DiffViewer oldContent={oldContent} newContent={newContent} />);
      
      const viewer = document.querySelector('.diff-viewer-unified');
      expect(viewer).toBeInTheDocument();
    });

    it('renders split view when splitView is true', () => {
      render(<DiffViewer oldContent={oldContent} newContent={newContent} splitView={true} />);
      
      const viewer = document.querySelector('.diff-viewer-split');
      expect(viewer).toBeInTheDocument();
      
      expect(screen.getByText('Original')).toBeInTheDocument();
      expect(screen.getByText('Modified')).toBeInTheDocument();
    });

    it('displays file name when provided', () => {
      render(
        <DiffViewer
          oldContent={oldContent}
          newContent={newContent}
          fileName="test.md"
        />
      );
      
      expect(screen.getByText('test.md')).toBeInTheDocument();
    });

    it('does not display file name when not provided', () => {
      render(<DiffViewer oldContent={oldContent} newContent={newContent} />);
      
      const header = document.querySelector('.diff-header');
      expect(header).not.toBeInTheDocument();
    });

    it('renders with empty oldContent', () => {
      render(<DiffViewer oldContent="" newContent="new content" />);
      
      const viewer = document.querySelector('.diff-viewer-unified');
      expect(viewer).toBeInTheDocument();
    });

    it('renders with empty newContent', () => {
      render(<DiffViewer oldContent="old content" newContent="" />);
      
      const viewer = document.querySelector('.diff-viewer-unified');
      expect(viewer).toBeInTheDocument();
    });

    it('renders with both contents empty', () => {
      render(<DiffViewer oldContent="" newContent="" />);
      
      const viewer = document.querySelector('.diff-viewer-unified');
      expect(viewer).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Unified View Tests
  // =========================================================================

  describe('Unified View', () => {
    it('highlights additions in unified view', () => {
      render(<DiffViewer oldContent={oldContent} newContent={newContent} />);
      
      const addedLines = document.querySelectorAll('.diff-line-add');
      expect(addedLines.length).toBeGreaterThan(0);
    });

    it('highlights removals in unified view', () => {
      const oldWithRemoval = 'line 1\nline 2\nline 3';
      const newWithRemoval = 'line 1\nline 3';
      
      render(<DiffViewer oldContent={oldWithRemoval} newContent={newWithRemoval} />);
      
      const removedLines = document.querySelectorAll('.diff-line-remove');
      expect(removedLines.length).toBeGreaterThan(0);
    });

    it('shows unchanged lines as context', () => {
      const sameContent = 'line 1\nline 2';
      
      render(<DiffViewer oldContent={sameContent} newContent={sameContent} />);
      
      const contextLines = document.querySelectorAll('.diff-line-context');
      expect(contextLines.length).toBe(2);
    });

    it('displays line numbers for old and new versions', () => {
      render(<DiffViewer oldContent={oldContent} newContent={newContent} />);
      
      const oldLineNums = document.querySelectorAll('.diff-line-num-old');
      const newLineNums = document.querySelectorAll('.diff-line-num-new');
      
      expect(oldLineNums.length).toBeGreaterThan(0);
      expect(newLineNums.length).toBeGreaterThan(0);
    });

    it('displays content in diff lines', () => {
      render(<DiffViewer oldContent="test content" newContent="test content" />);
      
      expect(screen.getByText('test content')).toBeInTheDocument();
    });

    it('handles multiline additions correctly', () => {
      const old = 'line 1';
      const newMulti = 'line 1\nline 2\nline 3';
      
      render(<DiffViewer oldContent={old} newContent={newMulti} />);
      
      const addedLines = document.querySelectorAll('.diff-line-add');
      expect(addedLines.length).toBe(2); // line 2 and line 3
    });

    it('handles multiline removals correctly', () => {
      const oldMulti = 'line 1\nline 2\nline 3';
      const newSingle = 'line 1';
      
      render(<DiffViewer oldContent={oldMulti} newContent={newSingle} />);
      
      const removedLines = document.querySelectorAll('.diff-line-remove');
      expect(removedLines.length).toBe(2); // line 2 and line 3
    });
  });

  // =========================================================================
  // Split View Tests
  // =========================================================================

  describe('Split View', () => {
    it('renders two columns in split view', () => {
      render(<DiffViewer oldContent={oldContent} newContent={newContent} splitView={true} />);
      
      const columns = document.querySelectorAll('.diff-column');
      expect(columns).toHaveLength(2);
    });

    it('displays column headers in split view', () => {
      render(<DiffViewer oldContent={oldContent} newContent={newContent} splitView={true} />);
      
      expect(screen.getByText('Original')).toBeInTheDocument();
      expect(screen.getByText('Modified')).toBeInTheDocument();
    });

    it('highlights additions in split view', () => {
      render(<DiffViewer oldContent={oldContent} newContent={newContent} splitView={true} />);
      
      const addedLines = document.querySelectorAll('.diff-line-add');
      expect(addedLines.length).toBeGreaterThan(0);
    });

    it('highlights removals in split view', () => {
      const oldWithRemoval = 'line 1\nline 2\nline 3';
      const newWithRemoval = 'line 1\nline 3';
      
      render(<DiffViewer oldContent={oldWithRemoval} newContent={newWithRemoval} splitView={true} />);
      
      const removedLines = document.querySelectorAll('.diff-line-remove');
      expect(removedLines.length).toBeGreaterThan(0);
    });

    it('aligns lines correctly when lengths differ', () => {
      const shortOld = 'line 1\nline 2';
      const longNew = 'line 1\nline 2\nline 3\nline 4';
      
      render(<DiffViewer oldContent={shortOld} newContent={longNew} splitView={true} />);
      
      const oldColumn = document.querySelector('.diff-column-old');
      const newColumn = document.querySelector('.diff-column-new');
      
      expect(oldColumn?.querySelectorAll('.diff-line')).toHaveLength(4);
      expect(newColumn?.querySelectorAll('.diff-line')).toHaveLength(4);
    });

    it('shows empty lines in old column when content is shorter', () => {
      const shortOld = 'line 1';
      const longNew = 'line 1\nline 2\nline 3';
      
      render(<DiffViewer oldContent={shortOld} newContent={longNew} splitView={true} />);
      
      const oldColumn = document.querySelector('.diff-column-old');
      const lines = oldColumn?.querySelectorAll('.diff-line');
      
      expect(lines).toHaveLength(3);
      // Last two lines should have empty content
      expect(lines?.[1].textContent).toContain('');
      expect(lines?.[2].textContent).toContain('');
    });

    it('shows empty lines in new column when content is shorter', () => {
      const longOld = 'line 1\nline 2\nline 3';
      const shortNew = 'line 1';
      
      render(<DiffViewer oldContent={longOld} newContent={shortNew} splitView={true} />);
      
      const newColumn = document.querySelector('.diff-column-new');
      const lines = newColumn?.querySelectorAll('.diff-line');
      
      expect(lines).toHaveLength(3);
    });
  });

  // =========================================================================
  // Edge Cases
  // =========================================================================

  describe('Edge Cases', () => {
    it('handles empty old content (create)', () => {
      render(<DiffViewer oldContent="" newContent="new content" />);
      
      expect(screen.getByText('new content')).toBeInTheDocument();
      const addedLines = document.querySelectorAll('.diff-line-add');
      expect(addedLines.length).toBe(1);
    });

    it('handles empty new content (delete)', () => {
      render(<DiffViewer oldContent="old content" newContent="" />);
      
      expect(screen.getByText('old content')).toBeInTheDocument();
      const removedLines = document.querySelectorAll('.diff-line-remove');
      expect(removedLines.length).toBe(1);
    });

    it('handles identical content with no changes', () => {
      const sameContent = 'line 1\nline 2\nline 3';
      
      render(<DiffViewer oldContent={sameContent} newContent={sameContent} />);
      
      const contextLines = document.querySelectorAll('.diff-line-context');
      expect(contextLines).toHaveLength(3);
      
      const addedLines = document.querySelectorAll('.diff-line-add');
      const removedLines = document.querySelectorAll('.diff-line-remove');
      expect(addedLines).toHaveLength(0);
      expect(removedLines).toHaveLength(0);
    });

    it('handles whitespace differences', () => {
      const oldWhitespace = 'line 1';
      const newWhitespace = 'line 1 ';
      
      render(<DiffViewer oldContent={oldWhitespace} newContent={newWhitespace} />);
      
      const removedLines = document.querySelectorAll('.diff-line-remove');
      const addedLines = document.querySelectorAll('.diff-line-add');
      
      expect(removedLines.length).toBe(1);
      expect(addedLines.length).toBe(1);
    });

    it('handles trailing newlines', () => {
      const oldTrailing = 'line 1\nline 2\n';
      const newTrailing = 'line 1\nline 2';
      
      render(<DiffViewer oldContent={oldTrailing} newContent={newTrailing} />);
      
      const viewer = document.querySelector('.diff-viewer-unified');
      expect(viewer).toBeInTheDocument();
    });

    it('handles special characters', () => {
      const oldSpecial = 'line with <special> & characters';
      const newSpecial = 'line with [special] & symbols';
      
      render(<DiffViewer oldContent={oldSpecial} newContent={newSpecial} />);
      
      expect(screen.getByText('line with <special> & characters')).toBeInTheDocument();
      expect(screen.getByText('line with [special] & symbols')).toBeInTheDocument();
    });

    it('handles very long lines', () => {
      const longLine = 'a'.repeat(1000);
      
      render(<DiffViewer oldContent={longLine} newContent={longLine + 'b'} />);
      
      const viewer = document.querySelector('.diff-viewer-unified');
      expect(viewer).toBeInTheDocument();
    });

    it('handles many lines', () => {
      const manyLines = Array(100).fill('line').join('\n');
      
      render(<DiffViewer oldContent={manyLines} newContent={manyLines + '\nnew line'} />);
      
      const contextLines = document.querySelectorAll('.diff-line-context');
      expect(contextLines.length).toBe(100);
    });
  });

  // =========================================================================
  // File Name Display Tests
  // =========================================================================

  describe('File Name Display', () => {
    it('displays file name in header for unified view', () => {
      render(
        <DiffViewer
          oldContent={oldContent}
          newContent={newContent}
          fileName="src/components/Test.tsx"
        />
      );
      
      const header = document.querySelector('.diff-header');
      expect(header).toHaveTextContent('src/components/Test.tsx');
    });

    it('displays file name in header for split view', () => {
      render(
        <DiffViewer
          oldContent={oldContent}
          newContent={newContent}
          fileName="README.md"
          splitView={true}
        />
      );
      
      const header = document.querySelector('.diff-header');
      expect(header).toHaveTextContent('README.md');
    });

    it('handles file names with special characters', () => {
      render(
        <DiffViewer
          oldContent={oldContent}
          newContent={newContent}
          fileName="file (with special) [chars].ts"
        />
      );
      
      expect(screen.getByText('file (with special) [chars].ts')).toBeInTheDocument();
    });

    it('handles long file paths', () => {
      const longPath = 'very/long/path/to/some/deeply/nested/file.tsx';
      
      render(
        <DiffViewer
          oldContent={oldContent}
          newContent={newContent}
          fileName={longPath}
        />
      );
      
      expect(screen.getByText(longPath)).toBeInTheDocument();
    });
  });

  // =========================================================================
  // CSS Class Tests
  // =========================================================================

  describe('CSS Classes', () => {
    it('applies correct base class for unified view', () => {
      render(<DiffViewer oldContent={oldContent} newContent={newContent} />);
      
      const viewer = document.querySelector('.diff-viewer');
      expect(viewer).toHaveClass('diff-viewer-unified');
    });

    it('applies correct base class for split view', () => {
      render(<DiffViewer oldContent={oldContent} newContent={newContent} splitView={true} />);
      
      const viewer = document.querySelector('.diff-viewer');
      expect(viewer).toHaveClass('diff-viewer-split');
    });

    it('applies addition class to added lines', () => {
      render(<DiffViewer oldContent="line 1" newContent="line 1\nline 2" />);
      
      const addedLine = document.querySelector('.diff-line-add');
      expect(addedLine).toBeInTheDocument();
    });

    it('applies removal class to removed lines', () => {
      render(<DiffViewer oldContent="line 1\nline 2" newContent="line 1" />);
      
      const removedLine = document.querySelector('.diff-line-remove');
      expect(removedLine).toBeInTheDocument();
    });

    it('applies context class to unchanged lines', () => {
      const same = 'line 1';
      render(<DiffViewer oldContent={same} newContent={same} />);
      
      const contextLine = document.querySelector('.diff-line-context');
      expect(contextLine).toBeInTheDocument();
    });

    it('applies split container class in split view', () => {
      render(<DiffViewer oldContent={oldContent} newContent={newContent} splitView={true} />);
      
      const container = document.querySelector('.diff-split-container');
      expect(container).toBeInTheDocument();
    });

    it('applies column classes in split view', () => {
      render(<DiffViewer oldContent={oldContent} newContent={newContent} splitView={true} />);
      
      const oldColumn = document.querySelector('.diff-column-old');
      const newColumn = document.querySelector('.diff-column-new');
      
      expect(oldColumn).toBeInTheDocument();
      expect(newColumn).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Line Number Tests
  // =========================================================================

  describe('Line Numbers', () => {
    it('displays line numbers in unified view', () => {
      render(<DiffViewer oldContent="line 1\nline 2" newContent="line 1\nline 2" />);
      
      const lineNums = document.querySelectorAll('.diff-line-num');
      expect(lineNums.length).toBeGreaterThan(0);
    });

    it('displays line numbers in split view', () => {
      render(<DiffViewer oldContent="line 1\nline 2" newContent="line 1\nline 2" splitView={true} />);
      
      const lineNums = document.querySelectorAll('.diff-line-num');
      expect(lineNums.length).toBeGreaterThan(0);
    });

    it('shows correct line numbers for context lines', () => {
      render(<DiffViewer oldContent="line 1\nline 2" newContent="line 1\nline 2" />);
      
      const firstLineOld = document.querySelector('.diff-line-num-old');
      expect(firstLineOld).toHaveTextContent('1');
    });

    it('shows empty line number for added lines in old column', () => {
      render(<DiffViewer oldContent="line 1" newContent="line 1\nline 2" />);
      
      // Find the added line's old line number (should be empty)
      const addedLine = document.querySelector('.diff-line-add');
      const oldLineNum = addedLine?.querySelector('.diff-line-num-old');
      expect(oldLineNum?.textContent).toBe('');
    });

    it('shows empty line number for removed lines in new column', () => {
      render(<DiffViewer oldContent="line 1\nline 2" newContent="line 1" />);
      
      // Find the removed line's new line number (should be empty)
      const removedLine = document.querySelector('.diff-line-remove');
      const newLineNum = removedLine?.querySelector('.diff-line-num-new');
      expect(newLineNum?.textContent).toBe('');
    });
  });

  // =========================================================================
  // Content Comparison Tests
  // =========================================================================

  describe('Content Comparison', () => {
    it('detects single line change', () => {
      const old = 'original line';
      const newText = 'modified line';
      
      render(<DiffViewer oldContent={old} newContent={newText} />);
      
      expect(document.querySelector('.diff-line-remove')).toBeInTheDocument();
      expect(document.querySelector('.diff-line-add')).toBeInTheDocument();
    });

    it('detects multiple consecutive changes', () => {
      const old = 'line 1\nline 2\nline 3';
      const newText = 'line 1\nmodified 2\nmodified 3';
      
      render(<DiffViewer oldContent={old} newContent={newText} />);
      
      const removedLines = document.querySelectorAll('.diff-line-remove');
      const addedLines = document.querySelectorAll('.diff-line-add');
      
      expect(removedLines).toHaveLength(2);
      expect(addedLines).toHaveLength(2);
    });

    it('preserves unchanged lines between changes', () => {
      const old = 'line 1\nline 2\nline 3\nline 4';
      const newText = 'modified 1\nline 2\nline 3\nmodified 4';
      
      render(<DiffViewer oldContent={old} newContent={newText} />);
      
      const contextLines = document.querySelectorAll('.diff-line-context');
      expect(contextLines.length).toBe(2); // line 2 and line 3
    });

    it('handles reordered lines', () => {
      const old = 'line A\nline B\nline C';
      const newText = 'line C\nline B\nline A';
      
      render(<DiffViewer oldContent={old} newContent={newText} />);
      
      const removedLines = document.querySelectorAll('.diff-line-remove');
      const addedLines = document.querySelectorAll('.diff-line-add');
      
      // Should detect all as changed (simple line-by-line comparison)
      expect(removedLines.length).toBeGreaterThan(0);
      expect(addedLines.length).toBeGreaterThan(0);
    });
  });
});
