import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DiffViewer } from './DiffViewer';
import type { ConflictResolution, SyncConflict } from '../types/sync';
import './ConflictResolver.css';

interface ConflictResolverProps {
  conflict: SyncConflict;
  onResolve: (resolution: ConflictResolution) => void;
  onCancel: () => void;
}

export default function ConflictResolver({
  conflict,
  onResolve,
  onCancel,
}: ConflictResolverProps) {
  const { t } = useTranslation();
  const [selectedResolution, setSelectedResolution] =
    useState<ConflictResolution>('mine');

  return (
    <section className="conflict-resolver" aria-label={t('sync.conflict.title', { file: conflict.file })}>
      <h3>{t('sync.conflict.title', { file: conflict.file })}</h3>

      <DiffViewer
        oldContent={conflict.localContent}
        newContent={conflict.remoteContent}
        splitView
        fileName={conflict.file}
      />

      <fieldset className="conflict-options">
        <legend>{t('sync.conflict.resolutionOptions')}</legend>

        <label>
          <input
            type="radio"
            name="resolution"
            value="mine"
            checked={selectedResolution === 'mine'}
            onChange={() => setSelectedResolution('mine')}
          />
          {t('sync.conflict.keepMine')}
        </label>

        <label>
          <input
            type="radio"
            name="resolution"
            value="theirs"
            checked={selectedResolution === 'theirs'}
            onChange={() => setSelectedResolution('theirs')}
          />
          {t('sync.conflict.useTheirs')}
        </label>

        <label>
          <input
            type="radio"
            name="resolution"
            value="ai"
            checked={selectedResolution === 'ai'}
            onChange={() => setSelectedResolution('ai')}
          />
          {t('sync.conflict.aiSuggestion')}
        </label>

        <label>
          <input
            type="radio"
            name="resolution"
            value="manual"
            checked={selectedResolution === 'manual'}
            onChange={() => setSelectedResolution('manual')}
          />
          {t('sync.conflict.manual')}
        </label>
      </fieldset>

      <div className="conflict-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          {t('sync.conflict.cancel')}
        </button>
        <button type="button" className="btn-primary" onClick={() => onResolve(selectedResolution)}>
          {t('sync.conflict.apply')}
        </button>
      </div>
    </section>
  );
}
