import { useMemo, useState, type KeyboardEventHandler } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import ConnectionStatus from './ConnectionStatus';
import type { ConnectionState } from '../types/connection';
import './AppNavigation.css';

interface NavItem {
  key: string;
  labelKey: string;
  path: string;
  icon?: string;
  primary?: boolean;
  badgeKey?: string;
  helpAvailable?: boolean;
}

interface NavSection {
  key: string;
  labelKey: string;
  items: NavItem[];
}

interface AppNavigationProps {
  connectionState: ConnectionState;
}

export default function AppNavigation({ connectionState }: AppNavigationProps) {
  const { t } = useTranslation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    projects: true,
    create: true,
    manage: true,
    review: true,
  });

  const sections: NavSection[] = useMemo(
    () => [
      {
        key: 'primary',
        labelKey: '',
        items: [
          {
            key: 'guided-builder',
            labelKey: 'nav.guidedBuilder',
            path: '/guided-builder',
            icon: '🚀',
            primary: true,
            helpAvailable: true,
          },
        ],
      },
      {
        key: 'projects',
        labelKey: 'nav.sections.projects',
        items: [
          {
            key: 'projects',
            labelKey: 'nav.projects',
            path: '/projects',
            icon: '📁',
          },
        ],
      },
      {
        key: 'create',
        labelKey: 'nav.sections.create',
        items: [
          {
            key: 'assisted-creation',
            labelKey: 'nav.assistedCreation',
            path: '/projects',
            icon: '⚡',
            badgeKey: 'nav.badges.power',
            helpAvailable: true,
          },
          {
            key: 'commands',
            labelKey: 'nav.commands',
            path: '/commands',
            icon: '🧠',
            helpAvailable: true,
          },
        ],
      },
      {
        key: 'manage',
        labelKey: 'nav.sections.manage',
        items: [
          {
            key: 'api-tester',
            labelKey: 'nav.apiTester',
            path: '/api-tester',
            icon: '🧪',
          },
          {
            key: 'ui-library',
            labelKey: 'nav.uiLibrary',
            path: '/ui',
            icon: '🧩',
          },
        ],
      },
      {
        key: 'review',
        labelKey: 'nav.sections.review',
        items: [
          {
            key: 'readiness-builder',
            labelKey: 'nav.readinessBuilder',
            path: '/projects',
            icon: '📋',
            helpAvailable: true,
          },
        ],
      },
    ],
    [],
  );

  const closeMobile = () => setIsMobileOpen(false);

  const toggleSection = (key: string) => {
    setExpandedSections((current) => ({ ...current, [key]: !current[key] }));
  };

  const onArrowNavigate: KeyboardEventHandler<HTMLElement> = (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      return;
    }

    const focusables = Array.from(
      document.querySelectorAll<HTMLElement>('.app-nav [data-nav-focusable="true"]'),
    );

    if (focusables.length === 0) {
      return;
    }

    const currentIndex = focusables.findIndex((item) => item === document.activeElement);
    if (currentIndex === -1) {
      return;
    }

    event.preventDefault();
    const nextIndex =
      event.key === 'ArrowDown'
        ? (currentIndex + 1) % focusables.length
        : (currentIndex - 1 + focusables.length) % focusables.length;

    focusables[nextIndex]?.focus();
  };

  return (
    <>
      <button
        className="nav-mobile-toggle"
        type="button"
        onClick={() => setIsMobileOpen((open) => !open)}
        aria-label={isMobileOpen ? t('nav.closeMenu') : t('nav.openMenu')}
        aria-expanded={isMobileOpen}
        aria-controls="app-navigation"
      >
        {isMobileOpen ? '✕' : '☰'}
      </button>

      {isMobileOpen && <button type="button" className="nav-mobile-overlay" onClick={closeMobile} aria-label={t('nav.closeMenu')} />}

      <nav id="app-navigation" className={`app-nav ${isMobileOpen ? 'app-nav--mobile-open' : ''}`} aria-label={t('nav.primaryAria')} onKeyDown={onArrowNavigate}>
        <div className="app-nav__brand">
          <h1>{t('nav.brand')}</h1>
        </div>

        <div className="app-nav__sections">
          {sections.map((section) => {
            const hasHeader = section.labelKey.length > 0;
            const expanded = expandedSections[section.key] ?? true;

            return (
              <section key={section.key} className="app-nav__section" aria-label={hasHeader ? t(section.labelKey) : undefined}>
                {hasHeader && (
                  <button
                    type="button"
                    className="app-nav__section-header"
                    onClick={() => toggleSection(section.key)}
                    aria-expanded={expanded}
                    data-nav-focusable="true"
                  >
                    <span>{t(section.labelKey)}</span>
                    <span aria-hidden="true">{expanded ? '▾' : '▸'}</span>
                  </button>
                )}

                {(!hasHeader || expanded) && (
                  <div className="app-nav__items">
                    {section.items.map((item) => (
                      <NavLink
                        key={item.key}
                        to={item.path}
                        className={({ isActive }) =>
                          [
                            'app-nav__item',
                            item.primary ? 'app-nav__item--primary' : 'app-nav__item--secondary',
                            isActive ? 'app-nav__item--active' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')
                        }
                        onClick={closeMobile}
                        data-nav-focusable="true"
                      >
                        {item.icon && <span className="app-nav__icon" aria-hidden="true">{item.icon}</span>}
                        <span className="app-nav__label">{t(item.labelKey)}</span>
                        {item.badgeKey && <span className="app-nav__badge">{t(item.badgeKey)}</span>}
                        {item.helpAvailable && <span className="app-nav__help" aria-label={t('nav.helpAvailable')}>?</span>}
                      </NavLink>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <div className="app-nav__footer">
          <ConnectionStatus state={connectionState} />
          <LanguageSwitcher />
        </div>
      </nav>
    </>
  );
}
