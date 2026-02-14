export type GuidedBuilderStep =
  | 'welcome'
  | 'project-setup'
  | 'artifacts'
  | 'review';

export interface GuidedBuilderProjectData {
  name: string;
  key: string;
  description: string;
  standard: string;
}

export interface GuidedBuilderState {
  currentStep: GuidedBuilderStep;
  completedSteps: GuidedBuilderStep[];
  projectData: GuidedBuilderProjectData;
  selectedArtifacts: string[];
}
