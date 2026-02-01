/**
 * DiffViewer Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiffViewer } from '../DiffViewer';

describe('DiffViewer', () => {
  const oldContent = 'line 1\nline 2\nline 3';
  const newContent = 'line 1\nline 2 modified\nline 3\nline 4';

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

  it('handles empty old content (create)', () => {
    render(<DiffViewer oldContent="" newContent="new content" />);
    
    expect(screen.getByText('new content')).toBeInTheDocument();
  });

  it('handles empty new content (delete)', () => {
    render(<DiffViewer oldContent="old content" newContent="" />);
    
    expect(screen.getByText('old content')).toBeInTheDocument();
  });

  it('shows unchanged lines as context', () => {
    const sameContent = 'line 1\nline 2';
    
    render(<DiffViewer oldContent={sameContent} newContent={sameContent} />);
    
    const contextLines = document.querySelectorAll('.diff-line-context');
    expect(contextLines.length).toBe(2);
  });
});
