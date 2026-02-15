export type HelpCategory =
  | 'getting-started'
  | 'workflows'
  | 'concepts'
  | 'reference';

export interface HelpTopic {
  id: string;
  category: HelpCategory;
  titleKey: string;
  summaryKey: string;
  contentKey: string;
}

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'first-steps',
    category: 'getting-started',
    titleKey: 'help.topics.firstSteps.title',
    summaryKey: 'help.topics.firstSteps.summary',
    contentKey: 'help.topics.firstSteps.content',
  },
  {
    id: 'iso21500',
    category: 'getting-started',
    titleKey: 'help.topics.iso21500.title',
    summaryKey: 'help.topics.iso21500.summary',
    contentKey: 'help.topics.iso21500.content',
  },
  {
    id: 'guided-builder',
    category: 'workflows',
    titleKey: 'help.topics.gb.title',
    summaryKey: 'help.topics.gb.summary',
    contentKey: 'help.topics.gb.content',
  },
  {
    id: 'assisted-creation',
    category: 'workflows',
    titleKey: 'help.topics.ac.title',
    summaryKey: 'help.topics.ac.summary',
    contentKey: 'help.topics.ac.content',
  },
  {
    id: 'readiness-builder',
    category: 'workflows',
    titleKey: 'help.topics.rd.title',
    summaryKey: 'help.topics.rd.summary',
    contentKey: 'help.topics.rd.content',
  },
  {
    id: 'workflows',
    category: 'workflows',
    titleKey: 'help.topics.workflows.title',
    summaryKey: 'help.topics.workflows.summary',
    contentKey: 'help.topics.workflows.content',
  },
  {
    id: 'projects',
    category: 'concepts',
    titleKey: 'help.topics.projects.title',
    summaryKey: 'help.topics.projects.summary',
    contentKey: 'help.topics.projects.content',
  },
  {
    id: 'artifacts',
    category: 'concepts',
    titleKey: 'help.topics.artifacts.title',
    summaryKey: 'help.topics.artifacts.summary',
    contentKey: 'help.topics.artifacts.content',
  },
  {
    id: 'raid',
    category: 'concepts',
    titleKey: 'help.topics.raid.title',
    summaryKey: 'help.topics.raid.summary',
    contentKey: 'help.topics.raid.content',
  },
  {
    id: 'guided-co-authoring',
    category: 'reference',
    titleKey: 'help.topics.guidedCoAuthoring.title',
    summaryKey: 'help.topics.guidedCoAuthoring.summary',
    contentKey: 'help.topics.guidedCoAuthoring.content',
  },
];

export const HELP_TOPIC_IDS = new Set(HELP_TOPICS.map((topic) => topic.id));

export const findHelpTopic = (id?: string) =>
  HELP_TOPICS.find((topic) => topic.id === id);
