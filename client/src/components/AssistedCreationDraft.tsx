import { useTranslation } from 'react-i18next';
import './AssistedCreationDraft.css';

interface AssistedCreationDraftProps {
  draft?: string;
  stateLabel: string;
}

export default function AssistedCreationDraft({ draft, stateLabel }: AssistedCreationDraftProps) {
  const { t } = useTranslation();

  return (
    <section className="assisted-draft">
      <h3>{t('ac.draft.title')}</h3>
      <p className="assisted-draft-state">{stateLabel}</p>
      <pre>{draft || t('ac.draft.empty')}</pre>
    </section>
  );
}
