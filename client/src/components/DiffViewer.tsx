/**
 * DiffViewer Component
 * Displays unified or side-by-side diff visualization
 */

import React from 'react';
import './DiffViewer.css';

export interface DiffViewerProps {
  oldContent: string;
  newContent: string;
  splitView?: boolean;
  fileName?: string;
}

interface DiffLine {
  type: 'add' | 'remove' | 'context';
  oldLineNum?: number;
  newLineNum?: number;
  content: string;
}

/**
 * Simple unified diff generator
 * Splits content by lines and marks additions/removals
 */
function generateUnifiedDiff(oldContent: string, newContent: string): DiffLine[] {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');
  const diff: DiffLine[] = [];

  const maxLen = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine === newLine && oldLine !== undefined) {
      diff.push({
        type: 'context',
        oldLineNum: i + 1,
        newLineNum: i + 1,
        content: oldLine,
      });
    } else {
      if (oldLine !== undefined) {
        diff.push({
          type: 'remove',
          oldLineNum: i + 1,
          content: oldLine,
        });
      }
      if (newLine !== undefined) {
        diff.push({
          type: 'add',
          newLineNum: i + 1,
          content: newLine,
        });
      }
    }
  }

  return diff;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  oldContent,
  newContent,
  splitView = false,
  fileName,
}) => {
  const diffLines = generateUnifiedDiff(oldContent, newContent);

  if (splitView) {
    // Side-by-side view
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    const maxLen = Math.max(oldLines.length, newLines.length);

    return (
      <div className="diff-viewer diff-viewer-split">
        {fileName && <div className="diff-header">{fileName}</div>}
        <div className="diff-split-container">
          <div className="diff-column diff-column-old">
            <div className="diff-column-header">Original</div>
            {Array.from({ length: maxLen }, (_, i) => {
              const line = oldLines[i] || '';
              const hasChange = oldLines[i] !== newLines[i];
              return (
                <div
                  key={i}
                  className={`diff-line ${hasChange && oldLines[i] !== undefined ? 'diff-line-remove' : ''}`}
                >
                  <span className="diff-line-num">{oldLines[i] !== undefined ? i + 1 : ''}</span>
                  <span className="diff-line-content">{line}</span>
                </div>
              );
            })}
          </div>
          <div className="diff-column diff-column-new">
            <div className="diff-column-header">Modified</div>
            {Array.from({ length: maxLen }, (_, i) => {
              const line = newLines[i] || '';
              const hasChange = oldLines[i] !== newLines[i];
              return (
                <div
                  key={i}
                  className={`diff-line ${hasChange && newLines[i] !== undefined ? 'diff-line-add' : ''}`}
                >
                  <span className="diff-line-num">{newLines[i] !== undefined ? i + 1 : ''}</span>
                  <span className="diff-line-content">{line}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Unified view
  return (
    <div className="diff-viewer diff-viewer-unified">
      {fileName && <div className="diff-header">{fileName}</div>}
      {diffLines.map((line, idx) => (
        <div key={idx} className={`diff-line diff-line-${line.type}`}>
          <span className="diff-line-num diff-line-num-old">
            {line.oldLineNum || ''}
          </span>
          <span className="diff-line-num diff-line-num-new">
            {line.newLineNum || ''}
          </span>
          <span className="diff-line-content">{line.content}</span>
        </div>
      ))}
    </div>
  );
};
