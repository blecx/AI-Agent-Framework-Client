export interface NavItem {
  key: string;
  labelKey: string;
  path: string;
  order: number;
  scope: 'global' | 'project';
  primary?: boolean;
  helpAvailable?: boolean;
  helpPath?: string;
}

export interface NavSection {
  key: string;
  labelKey: string;
  order: number;
  items: NavItem[];
}

const sortNavItems = (items: NavItem[]): NavItem[] =>
  [...items].sort((left, right) => {
    if (left.order !== right.order) {
      return left.order - right.order;
    }
    return left.key.localeCompare(right.key);
  });

const sortNavSections = (sections: NavSection[]): NavSection[] =>
  [...sections]
    .sort((left, right) => {
      if (left.order !== right.order) {
        return left.order - right.order;
      }
      return left.key.localeCompare(right.key);
    })
    .map((section) => ({
      ...section,
      items: sortNavItems(section.items),
    }));

const buildCurrentProjectSection = (currentProjectKey: string): NavSection => ({
  key: 'current-project',
  labelKey: 'nav.sections.currentProject',
  order: 2,
  items: [
    {
      key: 'project-artifacts',
      labelKey: 'nav.artifactBuilder',
      path: `/projects/${currentProjectKey}/artifacts`,
      order: 0,
      scope: 'project',
    },
    {
      key: 'project-assisted-creation',
      labelKey: 'ac.title',
      path: `/projects/${currentProjectKey}/assisted-creation`,
      order: 1,
      scope: 'project',
    },
    {
      key: 'project-readiness',
      labelKey: 'nav.readinessBuilder',
      path: `/projects/${currentProjectKey}/readiness`,
      order: 2,
      scope: 'project',
    },
    {
      key: 'project-propose',
      labelKey: 'projectView.tabs.proposeChanges',
      path: `/projects/${currentProjectKey}/propose`,
      order: 3,
      scope: 'project',
    },
    {
      key: 'project-apply',
      labelKey: 'projectView.tabs.applyProposals',
      path: `/projects/${currentProjectKey}/apply`,
      order: 4,
      scope: 'project',
    },
    {
      key: 'project-raid',
      labelKey: 'nav.raid',
      path: `/projects/${currentProjectKey}/raid`,
      order: 5,
      scope: 'project',
    },
    {
      key: 'project-audit',
      labelKey: 'projectView.tabs.audit',
      path: `/projects/${currentProjectKey}/audit`,
      order: 6,
      scope: 'project',
    },
    {
      key: 'project-journey-planner',
      labelKey: 'nav.journeys.planner',
      path: `/projects/${currentProjectKey}/readiness?journey=planner`,
      order: 7,
      scope: 'project',
    },
    {
      key: 'project-journey-reviewer',
      labelKey: 'nav.journeys.reviewer',
      path: `/projects/${currentProjectKey}/propose?journey=reviewer`,
      order: 8,
      scope: 'project',
    },
    {
      key: 'project-journey-approver',
      labelKey: 'nav.journeys.approver',
      path: `/projects/${currentProjectKey}/apply?journey=approver`,
      order: 9,
      scope: 'project',
    },
    {
      key: 'project-conflict-resolution',
      labelKey: 'nav.journeys.conflictResolution',
      path: `/projects/${currentProjectKey}/apply?journey=conflict-resolution`,
      order: 10,
      scope: 'project',
    },
  ],
});

export const buildNavSections = (currentProjectKey: string | null): NavSection[] => {
  const sections: NavSection[] = [
    {
      key: 'primary',
      labelKey: '',
      order: 0,
      items: [
        {
          key: 'create-project',
          labelKey: 'projects.list.cta.new',
          path: '/projects?create=1',
          order: 0,
          scope: 'global',
          primary: true,
        },
        {
          key: 'guided-builder',
          labelKey: 'nav.guidedBuilder',
          path: '/guided-builder',
          order: 1,
          scope: 'global',
          helpAvailable: true,
          helpPath: '/help/guided-builder',
        },
      ],
    },
    {
      key: 'projects',
      labelKey: 'nav.sections.projects',
      order: 1,
      items: [
        {
          key: 'projects',
          labelKey: 'nav.projects',
          path: '/projects',
          order: 0,
          scope: 'global',
        },
      ],
    },
  ];

  if (currentProjectKey) {
    sections.push(buildCurrentProjectSection(currentProjectKey));
  }

  sections.push(
    {
      key: 'create',
      labelKey: 'nav.sections.create',
      order: 3,
      items: [
        {
          key: 'commands',
          labelKey: 'nav.commands',
          path: '/commands',
          order: 0,
          scope: 'global',
          helpAvailable: true,
          helpPath: '/help/workflows',
        },
      ],
    },
    {
      key: 'manage',
      labelKey: 'nav.sections.manage',
      order: 4,
      items: [
        {
          key: 'api-tester',
          labelKey: 'nav.apiTester',
          path: '/api-tester',
          order: 0,
          scope: 'global',
        },
        {
          key: 'ui-library',
          labelKey: 'nav.uiLibrary',
          path: '/ui',
          order: 1,
          scope: 'global',
        },
      ],
    },
  );

  return sortNavSections(sections);
};
