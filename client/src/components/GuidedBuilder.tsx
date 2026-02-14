import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GuidedBuilderNav from './GuidedBuilderNav';
import GuidedBuilderProgress from './GuidedBuilderProgress';
import WelcomeStep from './guided-builder/WelcomeStep';
import ProjectSetupStep from './guided-builder/ProjectSetupStep';
import ArtifactsStep from './guided-builder/ArtifactsStep';
import ReviewStep from './guided-builder/ReviewStep';
import type {
  GuidedBuilderState,
  GuidedBuilderStep,
} from '../types/guidedBuilder';
import './GuidedBuilder.css';

const STEPS: GuidedBuilderStep[] = [
  'welcome',
  'project-setup',
  'artifacts',
  'review',
];

const STORAGE_KEY = 'guided-builder-state';

const DEFAULT_STATE: GuidedBuilderState = {
  currentStep: 'welcome',
  completedSteps: [],
  projectData: {
    name: '',
    key: '',
    description: '',
    standard: 'ISO 21500',
  },
  selectedArtifacts: [],
};

const isValidStep = (value?: string): value is GuidedBuilderStep =>
  !!value && STEPS.includes(value as GuidedBuilderStep);

export default function GuidedBuilder() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { step } = useParams<{ step?: string }>();

  const [state, setState] = useState<GuidedBuilderState>(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_STATE;
    }

    try {
      const parsed = JSON.parse(raw) as GuidedBuilderState;
      return {
        ...DEFAULT_STATE,
        ...parsed,
        projectData: {
          ...DEFAULT_STATE.projectData,
          ...parsed.projectData,
        },
      };
    } catch {
      return DEFAULT_STATE;
    }
  });

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!isValidStep(step)) {
      navigate(`/guided-builder/${state.currentStep}`, { replace: true });
    }
  }, [step, state.currentStep, navigate]);

  const currentStep = isValidStep(step) ? step : state.currentStep;

  const currentStepIndex = useMemo(
    () => STEPS.indexOf(currentStep),
    [currentStep],
  );

  const goToStep = (nextStep: GuidedBuilderStep) => {
    setState((prev) => ({
      ...prev,
      currentStep: nextStep,
    }));
    navigate(`/guided-builder/${nextStep}`);
  };

  const handleNext = () => {
    if (currentStepIndex >= STEPS.length - 1) {
      return;
    }

    const nextStep = STEPS[currentStepIndex + 1];
    setState((prev) => ({
      ...prev,
      completedSteps: prev.completedSteps.includes(prev.currentStep)
        ? prev.completedSteps
        : [...prev.completedSteps, currentStep],
    }));
    goToStep(nextStep);
  };

  const handleBack = () => {
    if (currentStepIndex <= 0) {
      return;
    }

    goToStep(STEPS[currentStepIndex - 1]);
  };

  const handleSkip = () => {
    goToStep('review');
  };

  const handleExit = () => {
    navigate('/projects');
  };

  return (
    <div className="guided-builder-page" data-testid="guided-builder">
      <header className="guided-builder-header">
        <GuidedBuilderProgress current={currentStepIndex + 1} total={STEPS.length} />
        <button
          type="button"
          className="guided-builder-exit"
          onClick={handleExit}
          aria-label={t('gb.exit')}
        >
          ×
        </button>
      </header>

      <main className="guided-builder-content">
        {currentStep === 'welcome' && (
          <WelcomeStep onGetStarted={handleNext} />
        )}
        {currentStep === 'project-setup' && (
          <ProjectSetupStep
            data={state.projectData}
            onChange={(projectData) =>
              setState((prev) => ({ ...prev, projectData }))
            }
          />
        )}
        {currentStep === 'artifacts' && (
          <ArtifactsStep
            projectKey={state.projectData.key}
            selectedArtifacts={state.selectedArtifacts}
            onChange={(selectedArtifacts) =>
              setState((prev) => ({ ...prev, selectedArtifacts }))
            }
          />
        )}
        {currentStep === 'review' && (
          <ReviewStep
            projectData={state.projectData}
            selectedArtifacts={state.selectedArtifacts}
          />
        )}
      </main>

      <footer className="guided-builder-footer">
        <GuidedBuilderNav
          onBack={handleBack}
          onNext={handleNext}
          onSkip={handleSkip}
          showBack={currentStepIndex > 0}
          showNext={currentStepIndex < STEPS.length - 1}
          showSkip={currentStepIndex > 0 && currentStepIndex < STEPS.length - 1}
        />
      </footer>
    </div>
  );
}
