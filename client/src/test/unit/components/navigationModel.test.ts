import { describe, expect, it } from 'vitest';
import { buildNavSections } from '@/components/navigationModel';

describe('navigationModel', () => {
  it('builds deterministic section order without a current project', () => {
    const sections = buildNavSections(null);
    expect(sections.map((section) => section.key)).toEqual([
      'primary',
      'projects',
      'create',
      'manage',
    ]);
  });

  it('includes current project section between projects and create', () => {
    const sections = buildNavSections('ALPHA');
    expect(sections.map((section) => section.key)).toEqual([
      'primary',
      'projects',
      'current-project',
      'create',
      'manage',
    ]);
  });

  it('builds deterministic current-project item order with mandatory core entries', () => {
    const sections = buildNavSections('ALPHA');
    const currentProject = sections.find((section) => section.key === 'current-project');
    expect(currentProject).toBeTruthy();

    const expectedOrder = [
      'project-artifacts',
      'project-assisted-creation',
      'project-readiness',
      'project-propose',
      'project-apply',
      'project-raid',
      'project-audit',
    ];

    const actualOrder = currentProject?.items.map((item) => item.key);
    expect(actualOrder).toBeTruthy();

    for (const requiredKey of expectedOrder) {
      expect(actualOrder).toContain(requiredKey);
    }

    const indices = expectedOrder.map((requiredKey) => actualOrder!.indexOf(requiredKey));
    expect(indices.every((index) => index >= 0)).toBe(true);

    for (let i = 1; i < indices.length; i += 1) {
      expect(indices[i]).toBeGreaterThan(indices[i - 1]);
    }
  });
});
