/**
 * React Component i18n Integration Test
 * 
 * Tests i18n hook usage in React components.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { Suspense } from 'react';
import I18nExample from './I18nExample';
import i18n from '../i18n/config'; // Import initialized i18n instance

describe('I18nExample Component', () => {
  beforeEach(async () => {
    // Ensure i18n is initialized
    await i18n.init();
    // Reset language before each test
    await i18n.changeLanguage('en');
  });

  const renderWithI18n = (component: React.ReactElement) => {
    return render(
      <I18nextProvider i18n={i18n}>
        <Suspense fallback="Loading...">
          {component}
        </Suspense>
      </I18nextProvider>
    );
  };

  it('should render with English translations by default', async () => {
    renderWithI18n(<I18nExample />);
    
    await waitFor(() => {
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });
    expect(screen.getByText('Guided Builder')).toBeInTheDocument();
    expect(screen.getByText('Artifact Builder')).toBeInTheDocument();
  });

  it('should display current language', async () => {
    renderWithI18n(<I18nExample />);
    
    await waitFor(() => {
      expect(screen.getByText(/Current language:/)).toBeInTheDocument();
    });
  });

  it('should switch to German when German button clicked', async () => {
    renderWithI18n(<I18nExample />);
    
    await waitFor(() => {
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });

    const germanButton = screen.getByText('Deutsch');
    fireEvent.click(germanButton);

    await waitFor(() => {
      expect(screen.getByText('Projekte')).toBeInTheDocument();
    });
  });

  it('should switch to English when English button clicked', async () => {
    renderWithI18n(<I18nExample />);
    
    await waitFor(() => {
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });

    // Switch to German first
    const germanButton = screen.getByText('Deutsch');
    fireEvent.click(germanButton);

    await waitFor(() => {
      expect(screen.getByText('Projekte')).toBeInTheDocument();
    });

    // Switch back to English
    const englishButton = screen.getByText('English');
    fireEvent.click(englishButton);

    await waitFor(() => {
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });
  });

  it('should render nested translation keys', async () => {
    renderWithI18n(<I18nExample />);
    
    await waitFor(() => {
      expect(screen.getByText('Online')).toBeInTheDocument();
    });
  });

  it('should have language switch buttons', async () => {
    renderWithI18n(<I18nExample />);
    
    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument();
    });
    expect(screen.getByText('Deutsch')).toBeInTheDocument();
  });
});
