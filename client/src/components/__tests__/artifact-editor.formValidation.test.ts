import { describe, expect, it } from 'vitest';
import type { Template } from '@/types/template';
import {
  isArtifactFormValid,
  validateArtifactField,
  validateArtifactForm,
} from '@/features/artifacts/artifact-editor/formValidation';

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

// ---------------------------------------------------------------------------
// validateArtifactForm — S3R-UX-02 deterministic whole-form validation
// ---------------------------------------------------------------------------

describe('validateArtifactForm — consistency pass (#268)', () => {
  it('returns empty object for a fully valid form (success path)', () => {
    const errors = validateArtifactForm(
      template,
      { title: 'Apollo', budget: 5000, code: 'AB-01' },
      t,
    );
    expect(errors).toEqual({});
  });

  it('returns error for missing required field (validation-error path)', () => {
    const errors = validateArtifactForm(template, { title: '' }, t);
    expect(errors.title).toBe('artifactEditor.validation.required');
  });

  it('reports type mismatch as validation error', () => {
    const errors = validateArtifactForm(
      template,
      { title: 'Apollo', budget: 'not-a-number' },
      t,
    );
    expect(errors.budget).toBe('artifactEditor.validation.mustBeNumber');
  });

  it('reports pattern mismatch as validation error', () => {
    const errors = validateArtifactForm(
      template,
      { title: 'Apollo', code: 'invalid' },
      t,
    );
    expect(errors.code).toBe('artifactEditor.validation.invalidFormat');
  });

  it('collects multiple errors in deterministic field order', () => {
    const errors = validateArtifactForm(
      template,
      { title: '', budget: 'bad', code: 'invalid' },
      t,
    );
    // All three invalid fields should be reported
    expect(Object.keys(errors)).toEqual(
      expect.arrayContaining(['title', 'budget', 'code']),
    );
    expect(Object.keys(errors)).toHaveLength(3);
  });

  it('field order in returned errors is deterministic across three calls', () => {
    const data = { title: '', budget: 'bad', code: 'invalid' };
    const keys1 = Object.keys(validateArtifactForm(template, data, t));
    const keys2 = Object.keys(validateArtifactForm(template, data, t));
    const keys3 = Object.keys(validateArtifactForm(template, data, t));
    expect(keys1).toEqual(keys2);
    expect(keys2).toEqual(keys3);
  });

  it('returns empty object when template is null', () => {
    expect(validateArtifactForm(null, { title: '' }, t)).toEqual({});
  });
});
