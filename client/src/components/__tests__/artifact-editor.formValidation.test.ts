import { describe, expect, it } from 'vitest';
import type { Template } from '../../types/template';
import {
  isArtifactFormValid,
  validateArtifactField,
} from '../artifact-editor/formValidation';

const t = (key: string) => key;

const template: Template = {
  id: 'tmp-1',
  name: 'Template',
  description: 'Template description',
  artifact_type: 'pmp',
  version: '1.0.0',
  markdown_template: '# {{title}}',
  schema: {
    type: 'object',
    required: ['title'],
    properties: {
      title: {
        type: 'string',
        title: 'Title',
        minLength: 3,
      },
      budget: {
        type: 'number',
        title: 'Budget',
      },
      code: {
        type: 'string',
        title: 'Code',
        pattern: '^[A-Z]{2}-\\d{2}$',
      },
    },
  },
};

describe('artifact-editor/formValidation', () => {
  it('validates required fields', () => {
    const message = validateArtifactField('title', '', template.schema.properties.title, template, t);
    expect(message).toBe('artifactEditor.validation.required');
  });

  it('validates number type', () => {
    const message = validateArtifactField('budget', '1000', template.schema.properties.budget, template, t);
    expect(message).toBe('artifactEditor.validation.mustBeNumber');
  });

  it('validates pattern format', () => {
    const message = validateArtifactField('code', 'aa-12', template.schema.properties.code, template, t);
    expect(message).toBe('artifactEditor.validation.invalidFormat');
  });

  it('reports invalid form when required value is missing', () => {
    expect(isArtifactFormValid(template, { title: '' })).toBe(false);
  });

  it('reports valid form when required and constraints pass', () => {
    expect(
      isArtifactFormValid(template, {
        title: 'Project Apollo',
        budget: 1200,
        code: 'AB-12',
      }),
    ).toBe(true);
  });
});
