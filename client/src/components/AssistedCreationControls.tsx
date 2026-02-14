import { useTranslation } from 'react-i18next';
import type { AssistedCreationState } from '../types/assistedCreation';
import './AssistedCreationControls.css';

interface AssistedCreationControlsProps {
  state: AssistedCreationState;
  hasDraft: boolean;
  onPause: () => void;
  onResume: () => void;
  onSaveDraft: () => void;
  onSaveSnapshot: () => void;
  onExit: () => void;
}

export default function AssistedCreationControls({
  state,
  hasDraft,
  onPause,
  onResume,
  onSaveDraft,
  onSaveSnapshot,
  onExit,
}: AssistedCreationControlsProps) {
  const { t } = useTranslation();

  const canPause = state === 'prompting' || state === 'generating';
  const canResume = state === 'paused';

  return (
    <div className="assisted-controls">
      {canPause && (
        <button type="button" className="btn-secondary" onClick={onPause} disabled={state === 'generating'}>
          ⏸ {t('ac.controls.pause')}
        </button>
      )}

      {canResume && (
        <button type="button" className="btn-secondary" onClick={onResume}>
          ▶ {t('ac.controls.resume')}
        </button>
      )}

      <button type="button" className="btn-secondary" onClick={onSaveDraft}>
        💾 {t('ac.controls.saveDraft')}
      </button>

      <button type="button" className="btn-primary" onClick={onSaveSnapshot} disabled={!hasDraft}>
        📸 {t('ac.controls.saveSnapshot')}
      </button>

      <button type="button" className="btn-secondary" onClick={onExit}>
        {t('ac.controls.exit')}
      </button>
    </div>
  );
}
