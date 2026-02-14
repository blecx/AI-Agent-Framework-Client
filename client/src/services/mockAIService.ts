const MOCK_QUESTIONS = [
  'What is the name of your project?',
  'Describe the main goal of this project.',
  'Who are the key stakeholders?',
  'What is the estimated timeline?',
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const generateMockDraft = (answers: string[]) => {
  const [name = 'Project', goal = 'Goal not provided', stakeholders = 'Stakeholders not provided', timeline = 'Timeline not provided'] = answers;

  return `# Project Charter\n\n## Project\n${name}\n\n## Goal\n${goal}\n\n## Stakeholders\n${stakeholders}\n\n## Timeline\n${timeline}\n`;
};

export const mockAIService = {
  startSession: async (artifactType: string) => {
    await delay(400);

    return {
      sessionId: `session-${artifactType}-${Date.now()}`,
      firstQuestion: MOCK_QUESTIONS[0],
    };
  },

  submitAnswer: async (
    answer: string,
    questionIndex: number,
    allAnswers: string[],
  ) => {
    await delay(700);

    const nextIndex = questionIndex + 1;
    if (nextIndex < MOCK_QUESTIONS.length) {
      return {
        isComplete: false,
        nextQuestion: MOCK_QUESTIONS[nextIndex],
      };
    }

    return {
      isComplete: true,
      draft: generateMockDraft([...allAnswers, answer]),
    };
  },
};
