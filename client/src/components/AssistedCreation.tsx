import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AssistedCreationControls from './AssistedCreationControls';
import AssistedCreationPrompt from './AssistedCreationPrompt';
import AssistedCreationDraft from './AssistedCreationDraft';
import { mockAIService } from '../services/mockAIService';
import type { AssistedCreationSession } from '../types/assistedCreation';
import './AssistedCreation.css';

interface AssistedCreationProps {
  projectKey: string;
}

export default function AssistedCreation({ projectKey }: AssistedCreationProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const artifactType = searchParams.get('artifactType') || 'charter';

  const [session, setSession] = useState<AssistedCreationSession>({
    sessionId: '',
    artifactType,
    state: 'idle',
    questions: [],
    currentQuestionIndex: 0,
  });

  useEffect(() => {
    let mounted = true;

    const start = async () => {
      const result = await mockAIService.startSession(artifactType);
      if (!mounted) {
        return;
      }

      setSession({
        sessionId: result.sessionId,
        artifactType,
        state: 'prompting',
        questions: [{ question: result.firstQuestion }],
        currentQuestionIndex: 0,
      });
    };

    start();
    return () => {
      mounted = false;
    };
  }, [artifactType]);

  const stateLabel = useMemo(() => {
    switch (session.state) {
      case 'prompting':
        return t('ac.state.prompting');
      case 'generating':
        return t('ac.state.generating');
      case 'reviewing':
        return t('ac.state.reviewing');
      case 'paused':
        return t('ac.state.paused');
      case 'complete':
        return t('ac.state.complete');
      case 'idle':
      default:
        return t('ac.state.idle');
    }
  }, [session.state, t]);

  const handleSubmitAnswer = async (answer: string) => {
    setSession((prev) => {
      const questions = [...prev.questions];
      questions[prev.currentQuestionIndex] = {
        ...questions[prev.currentQuestionIndex],
        answer,
      };

      return {
        ...prev,
        state: 'generating',
        questions,
      };
    });

    const currentAnswers = session.questions
      .filter((item) => item.answer)
      .map((item) => item.answer as string);

    const result = await mockAIService.submitAnswer(
      answer,
      session.currentQuestionIndex,
      currentAnswers,
    );

    setSession((prev) => {
      if (result.isComplete) {
        return {
          ...prev,
          state: 'reviewing',
          draft: result.draft,
        };
      }

      return {
        ...prev,
        state: 'prompting',
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        questions: [
          ...prev.questions,
          { question: result.nextQuestion as string },
        ],
      };
    });
  };

  const handlePause = () => {
    setSession((prev) => ({ ...prev, state: 'paused' }));
  };

  const handleResume = () => {
    setSession((prev) => ({ ...prev, state: 'prompting' }));
  };

  const handleSaveDraft = () => {
    setSession((prev) => ({ ...prev, state: 'paused' }));
  };

  const handleSaveSnapshot = () => {
    setSession((prev) => ({ ...prev, state: 'complete' }));
  };

  const handleExit = () => {
    navigate(`/projects/${projectKey}`);
  };

  return (
    <div className="assisted-creation" data-testid="assisted-creation">
      <header className="assisted-creation-header">
        <h2>{t('ac.title')}: {artifactType}</h2>
        <button type="button" className="btn-secondary" onClick={handleExit}>×</button>
      </header>

      <div className="assisted-creation-content">
        <div className="assisted-creation-pane assisted-creation-pane-left">
          <AssistedCreationPrompt session={session} onSubmit={handleSubmitAnswer} />
        </div>

        <div className="assisted-creation-pane assisted-creation-pane-right">
          <AssistedCreationDraft draft={session.draft} stateLabel={stateLabel} />
        </div>
      </div>

      <footer className="assisted-creation-footer">
        <AssistedCreationControls
          state={session.state}
          hasDraft={!!session.draft}
          onPause={handlePause}
          onResume={handleResume}
          onSaveDraft={handleSaveDraft}
          onSaveSnapshot={handleSaveSnapshot}
          onExit={handleExit}
        />
      </footer>
    </div>
  );
}
