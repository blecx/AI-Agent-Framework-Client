import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LanguageSwitcher from './LanguageSwitcher';

// Mock react-i18next with proper vi.fn() mocks
const mockChangeLanguage = vi.fn();
const mockI18n = {
  language: 'en',
  changeLanguage: mockChangeLanguage,
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: mockI18n,
    t: (key: string) => key,
  }),
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockI18n.language = 'en';
    mockChangeLanguage.mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('renders the language switcher button', () => {
      render(<LanguageSwitcher />);
      const button = screen.getByRole('button', { name: /current language/i });
      expect(button).toBeInTheDocument();
    });

    it('displays the current language code in uppercase', () => {
      render(<LanguageSwitcher />);
      expect(screen.getByText('EN')).toBeInTheDocument();
    });

    it('displays "DE" when German is selected', () => {
      mockI18n.language = 'de';
      render(<LanguageSwitcher />);
      expect(screen.getByText('DE')).toBeInTheDocument();
    });

    it('handles language codes with region (e.g., en-US)', () => {
      mockI18n.language = 'en-US';
      render(<LanguageSwitcher />);
      expect(screen.getByText('EN')).toBeInTheDocument();
    });

    it('defaults to "EN" if language is undefined', () => {
      mockI18n.language = undefined as unknown as string;
      render(<LanguageSwitcher />);
      expect(screen.getByText('EN')).toBeInTheDocument();
    });
  });

  describe('Dropdown interaction', () => {
    it('opens dropdown when button is clicked', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);
      const button = screen.getByRole('button', { name: /current language/i });

      await user.click(button);

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('shows both language options in dropdown', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);
      const button = screen.getByRole('button', { name: /current language/i });

      await user.click(button);

      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Deutsch')).toBeInTheDocument();
    });

    it('marks current language as active', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);
      const button = screen.getByRole('button', { name: /current language/i });

      await user.click(button);

      const englishOption = screen
        .getByRole('menuitem', { name: /switch to english/i })
        .closest('button');
      expect(englishOption).toHaveClass('active');
    });

    it('closes dropdown when clicking outside', async () => {
      render(<LanguageSwitcher />);
      const button = screen.getByRole('button', { name: /current language/i });

      fireEvent.click(button);
      expect(screen.getByRole('menu')).toBeInTheDocument();

      // Click outside (on document body)
      fireEvent.mouseDown(document.body);

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });
  });

  describe('Language switching', () => {
    it('changes language when option is clicked', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);
      const button = screen.getByRole('button', { name: /current language/i });

      await user.click(button);
      const germanOption = screen.getByRole('menuitem', {
        name: /switch to deutsch/i,
      });
      await user.click(germanOption);

      expect(mockChangeLanguage).toHaveBeenCalledWith('de');
    });

    it('closes dropdown after language selection', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);
      const button = screen.getByRole('button', { name: /current language/i });

      await user.click(button);
      const germanOption = screen.getByRole('menuitem', {
        name: /switch to deutsch/i,
      });
      await user.click(germanOption);

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('refocuses button after selection', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);
      const button = screen.getByRole('button', {
        name: /current language/i,
      }) as HTMLButtonElement;

      await user.click(button);
      const germanOption = screen.getByRole('menuitem', {
        name: /switch to deutsch/i,
      });
      await user.click(germanOption);

      await waitFor(() => {
        expect(button).toHaveFocus();
      });
    });
  });

  describe('Keyboard accessibility', () => {
    it('closes dropdown on Escape key', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);
      const button = screen.getByRole('button', { name: /current language/i });

      await user.click(button);
      expect(screen.getByRole('menu')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('refocuses button after Escape', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);
      const button = screen.getByRole('button', {
        name: /current language/i,
      }) as HTMLButtonElement;

      await user.click(button);
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(button).toHaveFocus();
      });
    });

    it('changes language on Enter key', async () => {
      render(<LanguageSwitcher />);
      const button = screen.getByRole('button', { name: /current language/i });

      fireEvent.click(button);
      const germanOption = screen.getByRole('menuitem', {
        name: /switch to deutsch/i,
      });

      fireEvent.keyDown(germanOption, { key: 'Enter' });

      expect(mockChangeLanguage).toHaveBeenCalledWith('de');
    });

    it('changes language on Space key', async () => {
      render(<LanguageSwitcher />);
      const button = screen.getByRole('button', { name: /current language/i });

      fireEvent.click(button);
      const germanOption = screen.getByRole('menuitem', {
        name: /switch to deutsch/i,
      });

      fireEvent.keyDown(germanOption, { key: ' ' });

      expect(mockChangeLanguage).toHaveBeenCalledWith('de');
    });
  });

  describe('ARIA attributes', () => {
    it('has proper aria-label on button', () => {
      render(<LanguageSwitcher />);
      const button = screen.getByRole('button', { name: /current language/i });
      expect(button).toHaveAttribute(
        'aria-label',
        expect.stringContaining('English'),
      );
    });

    it('has aria-expanded=false when closed', () => {
      render(<LanguageSwitcher />);
      const button = screen.getByRole('button', { name: /current language/i });
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('has aria-expanded=true when open', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);
      const button = screen.getByRole('button', { name: /current language/i });

      await user.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('has aria-haspopup attribute', () => {
      render(<LanguageSwitcher />);
      const button = screen.getByRole('button', { name: /current language/i });
      expect(button).toHaveAttribute('aria-haspopup', 'true');
    });

    it('has role="menu" on dropdown', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);
      const button = screen.getByRole('button', { name: /current language/i });

      await user.click(button);

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('has role="menuitem" on options', async () => {
      const user = userEvent.setup();
      render(<LanguageSwitcher />);
      const button = screen.getByRole('button', { name: /current language/i });

      await user.click(button);

      const options = screen.getAllByRole('menuitem');
      expect(options).toHaveLength(2);
    });
  });
});
