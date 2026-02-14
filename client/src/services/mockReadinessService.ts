import type { ProjectReadiness } from '../types/readiness';

// TODO: Replace with backend readiness API
export const mockReadinessService = {
  async getProjectReadiness(projectKey: string): Promise<ProjectReadiness> {
    await new Promise((resolve) => setTimeout(resolve, 250));

    return {
      overallStatus: 'warn',
      checks: [
        {
          id: 'projectBasics',
          status: 'pass',
        },
        {
          id: 'projectCharter',
          status: 'warn',
          actionKey: 'reviewCharter',
          actionUrl: `/projects/${projectKey}/artifacts`,
        },
        {
          id: 'raidRegister',
          status: 'fail',
          actionKey: 'createRaid',
          actionUrl: `/projects/${projectKey}`,
        },
        {
          id: 'workflowDefinition',
          status: 'notAssessed',
          actionKey: 'defineWorkflow',
          actionUrl: `/projects/${projectKey}`,
        },
        {
          id: 'proposalGovernance',
          status: 'inProgress',
          actionKey: 'continueGovernance',
          actionUrl: `/projects/${projectKey}/apply`,
        },
      ],
      summary: {
        passed: 1,
        warnings: 1,
        failed: 1,
        notAssessed: 1,
        inProgress: 1,
      },
    };
  },
};
