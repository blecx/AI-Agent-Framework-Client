import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { DiffLine, ReviewGateProps } from '../types/reviewGate';
import './ReviewGate.css';

type DiffMode = 'side-by-side' | 'unified' | 'inline';

function buildDiffLines(before: string, after: string): DiffLine[] {
  const oldLines = before.split('\n');
  const newLines = after.split('\n');
  const maxLen = Math.max(oldLines.length, newLines.length);
  const lines: DiffLine[] = [];

  for (let i = 0; i < maxLen; i += 1) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine === newLine && oldLine !== undefined) {
      lines.push({
        type: 'unchanged',
        content: oldLine,
        oldLineNumber: i + 1,
        newLineNumber: i + 1,
      });
      continue;
    }

    if (oldLine !== undefined) {
      lines.push({
        type: 'remove',
        content: oldLine,
        oldLineNumber: i + 1,
      });
    }

    if (newLine !== undefined) {
      lines.push({
        type: 'add',
        content: newLine,
        newLineNumber: i + 1,
      });
    }
  }

  return lines;
}

export default function ReviewGate({
  diff,
  checks,
  onApprove,
  onReject,
  onEdit,
  approveLabel,
  rejectLabel,
  editLabel,
}: ReviewGateProps) {
  const { t } = useTranslation();
  const [diffMode, setDiffMode] = useState<DiffMode>('side-by-side');
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const diffLines = useMemo(() => diff.lines || buildDiffLines(diff.before, diff.after), [diff]);

  const canApprove = checks.every(
    (check) => !(check.status === 'fail' && check.blocking !== false),
  );

  const handleApprove = async () => {
    if (!canApprove || loading) return;
    setLoading(true);
    try {
      await onApprove();
    } finally {
      setLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onReject(rejectReason.trim() || undefined);
      setShowRejectModal(false);
      setRejectReason('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        handleApprove();
      }

      if (event.key === 'Escape') {
        setShowRejectModal(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const resolveCheckIcon = (status: string): string => {
    if (status === 'pass') return '✅';
    if (status === 'fail') return '❌';
    if (status === 'warning') return '⚠️';
    return '⏳';
  };

  return (
    <div className="review-gate" data-testid="review-gate">
      <div className="review-gate-diff-header">
        <label htmlFor="review-gate-diff-mode">{t('reviewGate.diff.modeLabel')}</label>
        <select
          id="review-gate-diff-mode"
          value={diffMode}
          onChange={(event) => setDiffMode(event.target.value as DiffMode)}
        >
          <option value="side-by-side">{t('reviewGate.diff.sideBySide')}</option>
          <option value="unified">{t('reviewGate.diff.unified')}</option>
          <option value="inline">{t('reviewGate.diff.inline')}</option>
        </select>
      </div>

      {diffMode === 'side-by-side' && (
        <div className="review-gate-side-by-side">
          <section>
            <h4>{t('reviewGate.diff.before')}</h4>
            <pre>{diff.before}</pre>
          </section>
          <section>
            <h4>{t('reviewGate.diff.after')}</h4>
            <pre>{diff.after}</pre>
          </section>
        </div>
      )}

      {diffMode === 'inline' && (
        <div className="review-gate-inline" data-testid="review-inline">
          <h4>{t('reviewGate.diff.before')}</h4>
          <pre>{diff.before}</pre>
          <h4>{t('reviewGate.diff.after')}</h4>
          <pre>{diff.after}</pre>
        </div>
      )}

      {diffMode === 'unified' && (
        <div className="review-gate-unified" data-testid="review-unified">
          {diffLines.map((line, index) => (
            <div
              key={`${line.type}-${line.oldLineNumber || 0}-${line.newLineNumber || 0}-${index}`}
              className={`review-gate-line review-gate-line-${line.type}`}
            >
              <span className="line-number old">{line.oldLineNumber || ''}</span>
              <span className="line-number new">{line.newLineNumber || ''}</span>
              <span className="line-prefix">
                {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
              </span>
              <span className="line-content">{line.content}</span>
            </div>
          ))}
        </div>
      )}

      <div className="review-gate-checks">
        <h4>{t('reviewGate.checks.title')}</h4>
        {checks.map((check) => (
          <div key={check.id} className={`review-gate-check review-gate-check-${check.status}`}>
            <span className="review-gate-check-icon">{resolveCheckIcon(check.status)}</span>
            <div>
              <span className="review-gate-check-label">{check.label}</span>
              {check.message && <p className="review-gate-check-message">{check.message}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="review-gate-actions">
        {onEdit && (
          <button type="button" onClick={onEdit} disabled={loading}>
            {editLabel || t('reviewGate.actions.edit')}
          </button>
        )}
        <button type="button" onClick={() => setShowRejectModal(true)} disabled={loading}>
          {rejectLabel || t('reviewGate.actions.reject')}
        </button>
        <button
          type="button"
          className="review-gate-approve"
          onClick={handleApprove}
          disabled={!canApprove || loading}
          title={!canApprove ? t('reviewGate.actions.approveBlocked') : ''}
        >
          {loading ? t('reviewGate.actions.applying') : approveLabel || t('reviewGate.actions.approve')}
        </button>
      </div>

      {showRejectModal && (
        <div className="review-gate-modal-overlay" role="dialog" aria-modal="true">
          <div className="review-gate-modal">
            <h3>{t('reviewGate.reject.title')}</h3>
            <label htmlFor="review-gate-reject-reason">{t('reviewGate.reject.reasonLabel')}</label>
            <textarea
              id="review-gate-reject-reason"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder={t('reviewGate.reject.reasonPlaceholder')}
              rows={4}
            />
            <div className="review-gate-modal-actions">
              <button type="button" onClick={() => setShowRejectModal(false)} disabled={loading}>
                {t('reviewGate.reject.cancel')}
              </button>
              <button type="button" onClick={handleRejectConfirm} disabled={loading}>
                {t('reviewGate.reject.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
