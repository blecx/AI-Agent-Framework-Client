/**
 * ArtifactEditor Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { ArtifactEditor } from '../ArtifactEditor';
import { templateApiClient } from '../../services/TemplateApiClient';
import i18n from '../../i18n/config';
import type { Template } from '../../types/template';

// Mock the templateApiClient
vi.mock('../../services/TemplateApiClient', () => ({
  templateApiClient: {
    getTemplate: vi.fn(),
  },
}));

// Mock useToast hook to avoid ToastProvider requirement
vi.mock('../../hooks/useToast', () => ({
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showInfo: vi.fn(),
    showWarning: vi.fn(),
  }),
}));

// Mock useUnsavedChanges hook to avoid react-router dependency
vi.mock('../../hooks/useUnsavedChanges', () => ({
  useUnsavedChanges: () => ({
    isBlocked: false,
    confirmNavigation: vi.fn(),
    cancelNavigation: vi.fn(),
  }),
}));

describe('ArtifactEditor', () => {
  const renderWithI18n = (component: React.ReactElement) =>
    render(<I18nextProvider i18n={i18n}>{component}</I18nextProvider>);

  const mockTemplate: Template = {
    id: 'pmp-01',
    name: 'Project Management Plan',
    description: 'Standard PMP template',
    artifact_type: 'pmp',
    version: '1.0.0',
    markdown_template: '# {{title}}\n\n{{description}}',
    schema: {
      type: 'object',
      required: ['title', 'purpose'],
      properties: {
        title: {
          type: 'string',
          title: 'Project Title',
          description: 'The name of your project',
          minLength: 3,
          maxLength: 100,
        },
        purpose: {
          type: 'string',
          title: 'Purpose',
          description: 'Why this project exists',
          format: 'textarea',
        },
        start_date: {
          type: 'string',
          title: 'Start Date',
          format: 'date',
        },
        priority: {
          type: 'string',
          title: 'Priority',
          enum: ['Low', 'Medium', 'High'],
        },
      },
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('en');
  });

  it('renders loading state initially', () => {
    vi.mocked(templateApiClient.getTemplate).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithI18n(<ArtifactEditor templateId="pmp-01" projectKey="TEST" />);

    // PR #122 changed loading state to use LoadingSkeleton with aria attributes
    const loadingElement = screen.getByLabelText('Loading template');
    expect(loadingElement).toBeInTheDocument();
    expect(loadingElement).toHaveAttribute('aria-busy', 'true');
  });

  it('renders error when template fails to load', async () => {
    vi.mocked(templateApiClient.getTemplate).mockRejectedValue(
      new Error('Template not found')
    );

    renderWithI18n(<ArtifactEditor templateId="pmp-01" projectKey="TEST" />);

    await waitFor(() => {
      expect(screen.getByText('Template not found')).toBeInTheDocument();
    });
  });

  it('renders form from template schema', async () => {
    vi.mocked(templateApiClient.getTemplate).mockResolvedValue(mockTemplate);

    renderWithI18n(<ArtifactEditor templateId="pmp-01" projectKey="TEST" />);

    await waitFor(() => {
      expect(screen.getByText('Project Management Plan')).toBeInTheDocument();
    });

    expect(screen.getByText('Standard PMP template')).toBeInTheDocument();
    expect(screen.getByText('pmp')).toBeInTheDocument();

    // Check all fields are rendered
    expect(screen.getByLabelText(/Project Title/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Purpose/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Start Date/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Priority/)).toBeInTheDocument();
  });

  it('marks required fields with asterisk', async () => {
    vi.mocked(templateApiClient.getTemplate).mockResolvedValue(mockTemplate);

    renderWithI18n(<ArtifactEditor templateId="pmp-01" projectKey="TEST" />);

    await waitFor(() => {
      expect(screen.getByText('Project Management Plan')).toBeInTheDocument();
    });

    const titleLabel = screen.getByText(/Project Title/);
    const purposeLabel = screen.getByText(/Purpose/);
    
    expect(within(titleLabel.closest('label')!).getByText('*')).toBeInTheDocument();
    expect(within(purposeLabel.closest('label')!).getByText('*')).toBeInTheDocument();
  });

  it('renders text input for string fields', async () => {
    vi.mocked(templateApiClient.getTemplate).mockResolvedValue(mockTemplate);

    renderWithI18n(<ArtifactEditor templateId="pmp-01" projectKey="TEST" />);

    await waitFor(() => {
      const titleInput = screen.getByLabelText(/Project Title/);
      expect(titleInput).toHaveAttribute('type', 'text');
    });
  });

  it('renders textarea for long text fields', async () => {
    vi.mocked(templateApiClient.getTemplate).mockResolvedValue(mockTemplate);

    renderWithI18n(<ArtifactEditor templateId="pmp-01" projectKey="TEST" />);

    await waitFor(() => {
      const purposeInput = screen.getByLabelText(/Purpose/);
      expect(purposeInput.tagName).toBe('TEXTAREA');
    });
  });

  it('renders date input for date fields', async () => {
    vi.mocked(templateApiClient.getTemplate).mockResolvedValue(mockTemplate);

    renderWithI18n(<ArtifactEditor templateId="pmp-01" projectKey="TEST" />);

    await waitFor(() => {
      const dateInput = screen.getByLabelText(/Start Date/);
      expect(dateInput).toHaveAttribute('type', 'date');
    });
  });

  it('renders dropdown for enum fields', async () => {
    vi.mocked(templateApiClient.getTemplate).mockResolvedValue(mockTemplate);

    render(<ArtifactEditor templateId="pmp-01" projectKey="TEST" />);

    await waitFor(() => {
      const prioritySelect = screen.getByLabelText(/Priority/);
      expect(prioritySelect.tagName).toBe('SELECT');
      
      const options = within(prioritySelect).getAllByRole('option');
      expect(options).toHaveLength(4); // "Select Priority" + 3 enum values
      expect(options[1]).toHaveTextContent('Low');
      expect(options[2]).toHaveTextContent('Medium');
      expect(options[3]).toHaveTextContent('High');
    });
  });

  it('validates required fields on save', async () => {
    vi.mocked(templateApiClient.getTemplate).mockResolvedValue(mockTemplate);
    const onSave = vi.fn();

    renderWithI18n(
      <ArtifactEditor templateId="pmp-01" projectKey="TEST" onSave={onSave} />
    );

    await waitFor(() => {
      expect(screen.getByText('Project Management Plan')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save/i });
    
    // Button should be disabled when required fields are empty
    expect(saveButton).toBeDisabled();
    
    // Click should not call onSave (button disabled)
    await userEvent.click(saveButton);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('validates minLength constraint', async () => {
    vi.mocked(templateApiClient.getTemplate).mockResolvedValue(mockTemplate);
    const onSave = vi.fn();

    renderWithI18n(
      <ArtifactEditor templateId="pmp-01" projectKey="TEST" onSave={onSave} />
    );

    await waitFor(() => {
      expect(screen.getByText('Project Management Plan')).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/Project Title/);
    await userEvent.type(titleInput, 'AB'); // Only 2 chars, min is 3

    const purposeInput = screen.getByLabelText(/Purpose/);
    await userEvent.type(purposeInput, 'Valid purpose');

    const saveButton = screen.getByRole('button', { name: /save/i });
    
    // Save button should be disabled (title too short)
    expect(saveButton).toBeDisabled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('calls onSave with form data when valid', async () => {
    vi.mocked(templateApiClient.getTemplate).mockResolvedValue(mockTemplate);
    const onSave = vi.fn();

    renderWithI18n(
      <ArtifactEditor templateId="pmp-01" projectKey="TEST" onSave={onSave} />
    );

    await waitFor(() => {
      expect(screen.getByText('Project Management Plan')).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/Project Title/);
    await userEvent.type(titleInput, 'My Project');

    const purposeInput = screen.getByLabelText(/Purpose/);
    await userEvent.type(purposeInput, 'To deliver value');

    const dateInput = screen.getByLabelText(/Start Date/);
    await userEvent.type(dateInput, '2026-02-01');

    const prioritySelect = screen.getByLabelText(/Priority/);
    await userEvent.selectOptions(prioritySelect, 'High');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        title: 'My Project',
        purpose: 'To deliver value',
        start_date: '2026-02-01',
        priority: 'High',
      });
    });
  });

  it('clears field error on change', async () => {
    vi.mocked(templateApiClient.getTemplate).mockResolvedValue(mockTemplate);

    renderWithI18n(<ArtifactEditor templateId="pmp-01" projectKey="TEST" />);

    await waitFor(() => {
      expect(screen.getByText('Project Management Plan')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save/i });
    
    // Initially disabled (required fields empty)
    expect(saveButton).toBeDisabled();

    // Type in field - button should become enabled
    const titleInput = screen.getByLabelText(/Project Title/);
    await userEvent.type(titleInput, 'New Title');
    
    const purposeInput = screen.getByLabelText(/Purpose/);
    await userEvent.type(purposeInput, 'New Purpose');

    await waitFor(() => {
      expect(saveButton).not.toBeDisabled();
    });
  });

  it('calls onCancel when cancel button clicked', async () => {
    vi.mocked(templateApiClient.getTemplate).mockResolvedValue(mockTemplate);
    const onCancel = vi.fn();

    renderWithI18n(
      <ArtifactEditor
        templateId="pmp-01"
        projectKey="TEST"
        onCancel={onCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Project Management Plan')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('populates form with initialData', async () => {
    vi.mocked(templateApiClient.getTemplate).mockResolvedValue(mockTemplate);

    const initialData = {
      title: 'Existing Project',
      purpose: 'Existing purpose',
      priority: 'Medium',
    };

    renderWithI18n(
      <ArtifactEditor
        templateId="pmp-01"
        projectKey="TEST"
        initialData={initialData}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Project Management Plan')).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/Project Title/) as HTMLInputElement;
    expect(titleInput.value).toBe('Existing Project');

    const purposeInput = screen.getByLabelText(/Purpose/) as HTMLTextAreaElement;
    expect(purposeInput.value).toBe('Existing purpose');

    const prioritySelect = screen.getByLabelText(/Priority/) as HTMLSelectElement;
    expect(prioritySelect.value).toBe('Medium');
  });

  it('disables save button when form is invalid', async () => {
    vi.mocked(templateApiClient.getTemplate).mockResolvedValue(mockTemplate);

    renderWithI18n(<ArtifactEditor templateId="pmp-01" projectKey="TEST" />);

    await waitFor(() => {
      expect(screen.getByText('Project Management Plan')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save/i });
    
    // Initially disabled (required fields empty)
    expect(saveButton).toBeDisabled();
  });

  it('shows draft state badge by default', async () => {
    vi.mocked(templateApiClient.getTemplate).mockResolvedValue(mockTemplate);

    renderWithI18n(<ArtifactEditor templateId="pmp-01" projectKey="TEST" />);

    await waitFor(() => {
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });
  });

  it('disables editing in applied state and shows propose change action', async () => {
    vi.mocked(templateApiClient.getTemplate).mockResolvedValue(mockTemplate);

    renderWithI18n(
      <ArtifactEditor templateId="pmp-01" projectKey="TEST" artifactState="applied" />
    );

    await waitFor(() => {
      expect(screen.getByText('Applied')).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/Project Title/) as HTMLInputElement;
    expect(titleInput).toBeDisabled();
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /propose change/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /improve with ai/i })).not.toBeInTheDocument();
  });

  it('transitions from draft to in-review when proposing for review', async () => {
    vi.mocked(templateApiClient.getTemplate).mockResolvedValue(mockTemplate);

    renderWithI18n(<ArtifactEditor templateId="pmp-01" projectKey="TEST" />);

    await waitFor(() => {
      expect(screen.getByText('Project Management Plan')).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText(/Project Title/), 'Refactor App');
    await userEvent.type(screen.getByLabelText(/Purpose/), 'Improve reliability');

    const proposeButton = screen.getByRole('button', { name: /propose for review/i });
    await userEvent.click(proposeButton);

    await waitFor(() => {
      expect(screen.getByText('In Review')).toBeInTheDocument();
    });
  });
});
