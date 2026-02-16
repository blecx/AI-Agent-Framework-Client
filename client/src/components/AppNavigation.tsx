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
  helpAvailable?: boolean;
  helpPath?: string;
}

interface NavSection {
  key: string;
  labelKey: string;
  items: NavItem[];
}

interface AppNavigationProps {
  connectionState: ConnectionState;
  onRetryConnection?: () => void;
}

export default function AppNavigation({
  connectionState,
  onRetryConnection,
}: AppNavigationProps) {
  const { t } = useTranslation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    projects: true,
    create: true,
    manage: true,
  });

  const healthCheckIntervalMs = parseInt(
    import.meta.env.VITE_HEALTH_CHECK_INTERVAL || '30000',
    10,
  );
  const healthCheckIntervalSeconds = Math.max(
    1,
    Math.round(healthCheckIntervalMs / 1000),
  );
  const apiDocsUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/docs`;
  const showSettingsPlaceholder =
    import.meta.env.VITE_ENABLE_SETTINGS_PLACEHOLDER === 'true';

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
            helpPath: '/help/guided-builder',
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
            key: 'commands',
            labelKey: 'nav.commands',
            path: '/commands',
            icon: '🧠',
            helpAvailable: true,
            helpPath: '/help/workflows',
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
          <div className="app-nav__api-controls">
            <div className="app-nav__api-status" role="status" aria-live="polite">
              <span className={`app-nav__api-dot app-nav__api-dot--${connectionState}`} aria-hidden="true" />
              <span>{t('nav.header.apiStatusLabel', { state: t(`conn.state.${connectionState}`) })}</span>
            </div>
            <p className="app-nav__api-refresh-note">
              {t('nav.header.refreshInfo', { seconds: healthCheckIntervalSeconds })}
            </p>
            <div className="app-nav__api-actions">
              <a
                className="app-nav__api-link"
                href={apiDocsUrl}
                target="_blank"
                rel="noreferrer"
              >
                {t('nav.header.openApiDocs')}
              </a>
              <button
                type="button"
                className="app-nav__api-refresh"
                onClick={onRetryConnection}
                disabled={!onRetryConnection}
              >
                {t('nav.header.refreshStatus')}
              </button>
              {showSettingsPlaceholder && (
                <button
                  type="button"
                  className="app-nav__api-settings"
                  disabled
                  title={t('nav.header.settingsSoon')}
                >
                  {t('nav.header.settings')}
                </button>
              )}
            </div>
          </div>
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
                      <div key={item.key} className="app-nav__item-row">
                        <NavLink
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
                          <span className="app-nav__label-group">
                            <span className="app-nav__label">{t(item.labelKey)}</span>
                          </span>
                        </NavLink>
                        {item.helpAvailable && item.helpPath && (
                          <NavLink
                            to={item.helpPath}
                            className="app-nav__help-link"
                            aria-label={`${t('nav.helpAvailable')}: ${t(item.labelKey)}`}
                            onClick={closeMobile}
                            data-nav-focusable="true"
                          >
                            <span className="app-nav__help" aria-hidden="true">?</span>
                          </NavLink>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <div className="app-nav__footer">
          <LanguageSwitcher />
          <ConnectionStatus state={connectionState} />
        </div>
      </nav>
    </>
  );
}
