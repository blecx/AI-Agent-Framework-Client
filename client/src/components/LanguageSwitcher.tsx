import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
] as const;

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Get current language code (first 2 chars, e.g., "en-US" -> "en")
  const currentLanguage = i18n.language?.substring(0, 2) || 'en';
  const currentLangLabel = LANGUAGES.find(
    (lang) => lang.code === currentLanguage,
  )?.label;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  const handleLanguageChange = async (languageCode: string) => {
    await i18n.changeLanguage(languageCode);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    languageCode: string,
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleLanguageChange(languageCode);
    }
  };

  return (
    <div className="language-switcher" ref={dropdownRef}>
      <button
        ref={buttonRef}
        className="language-switcher-btn"
        onClick={handleToggle}
        aria-label={`Current language: ${currentLangLabel}. Click to change language.`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        type="button"
      >
        <span className="language-code">{currentLanguage.toUpperCase()}</span>
        <span className="dropdown-arrow" aria-hidden="true">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <div className="language-dropdown" role="menu">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={`language-option ${lang.code === currentLanguage ? 'active' : ''}`}
              onClick={() => handleLanguageChange(lang.code)}
              onKeyDown={(e) => handleKeyDown(e, lang.code)}
              role="menuitem"
              type="button"
              aria-label={`Switch to ${lang.label}`}
            >
              <span className="language-code-option">
                {lang.code.toUpperCase()}
              </span>
              <span className="language-label">{lang.label}</span>
              {lang.code === currentLanguage && (
                <span className="checkmark" aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
