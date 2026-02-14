import { useTranslation } from 'react-i18next';
import type { ArtifactState } from '../types/artifact';
import './ArtifactStateBadge.css';

interface ArtifactStateBadgeProps {
  state: ArtifactState;
}

const STATE_ICONS: Record<ArtifactState, string> = {
  draft: '📝',
  inReview: '👁',
  applied: '✅',
  needsAttention: '⚠',
  complete: '✓',
  outdated: '⏰',
  conflict: '⚠',
};

export default function ArtifactStateBadge({ state }: ArtifactStateBadgeProps) {
  const { t } = useTranslation();

  return (
    <span className={`artifact-state-badge artifact-state-badge--${state}`}>
      <span aria-hidden="true">{STATE_ICONS[state]}</span>
      <span>{t(`art.state.${state}`)}</span>
    </span>
  );
}
