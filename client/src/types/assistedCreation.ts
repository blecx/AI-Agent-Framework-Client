export type AssistedCreationState =
  | 'idle'
  | 'prompting'
  | 'generating'
  | 'reviewing'
  | 'paused'
  | 'complete';

export interface AssistedCreationQuestion {
  question: string;
  answer?: string;
}

export interface AssistedCreationSession {
  sessionId: string;
  artifactType: string;
  state: AssistedCreationState;
  questions: AssistedCreationQuestion[];
  draft?: string;
  currentQuestionIndex: number;
}
