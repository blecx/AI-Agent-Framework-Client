import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AssistedCreationSession } from '../types/assistedCreation';
import './AssistedCreationPrompt.css';

interface AssistedCreationPromptProps {
  session: AssistedCreationSession;
  onSubmit: (answer: string) => void;
}

export default function AssistedCreationPrompt({
  session,
  onSubmit,
}: AssistedCreationPromptProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');

  const currentQuestion = session.questions[session.currentQuestionIndex];

  const handleSubmit = () => {
    if (!input.trim()) {
      return;
    }

    onSubmit(input.trim());
    setInput('');
  };

  return (
    <section className="assisted-prompt">
      <h3>{t('ac.prompt.title')}</h3>
      <p>{t('ac.prompt.question', { current: session.currentQuestionIndex + 1, total: session.questions.length })}</p>

      <div className="assisted-prompt-question">{currentQuestion?.question}</div>

      <div className="assisted-prompt-input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('ac.prompt.placeholder')}
          disabled={session.state === 'paused' || session.state === 'generating'}
        />
        <button
          type="button"
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!input.trim() || session.state === 'paused' || session.state === 'generating'}
        >
          {t('ac.prompt.submit')}
        </button>
      </div>

      <ul className="assisted-prompt-history">
        {session.questions
          .filter((q) => q.answer)
          .map((q, idx) => (
            <li key={`${q.question}-${idx}`}>
              <strong>{q.question}</strong>
              <p>{q.answer}</p>
            </li>
          ))}
      </ul>
    </section>
  );
}
