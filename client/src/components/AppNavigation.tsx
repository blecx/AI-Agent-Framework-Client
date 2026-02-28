import {
  useMemo,
  useRef,
  useState,
  useEffect,
  type KeyboardEventHandler,
} from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import ConnectionStatus from './ConnectionStatus';
import type { ConnectionState } from '../types/connection';
import './AppNavigation.css';

interface NavItem {
  key: string;
  labelKey: string;
  path: string;
  order: number;
  scope: 'global' | 'project';
  primary?: boolean;
  helpAvailable?: boolean;
  helpPath?: string;
}

interface NavSection {
  key: string;
  labelKey: string;
  order: number;
  items: NavItem[];
}

interface AppNavigationProps {
  connectionState: ConnectionState;
  onRetryConnection?: () => void;
}

const sortNavItems = (items: NavItem[]): NavItem[] =>
  [...items].sort((left, right) => {
    if (left.order !== right.order) {
      return left.order - right.order;
    }
    return left.key.localeCompare(right.key);
  });

const sortNavSections = (sections: NavSection[]): NavSection[] =>
  [...sections]
    .sort((left, right) => {
      if (left.order !== right.order) {
        return left.order - right.order;
      }
      return left.key.localeCompare(right.key);
    })
    .map((section) => ({
      ...section,
      items: sortNavItems(section.items),
    }));

const buildSections = (currentProjectKey: string | null): NavSection[] => {
  const sectionList: NavSection[] = [
    {
      key: 'primary',
      labelKey: '',
      order: 0,
      items: [
        {
          key: 'create-project',
          labelKey: 'projects.list.cta.new',
          path: '/projects?create=1',
          order: 0,
          scope: 'global',
          primary: true,
        },
        {
          key: 'guided-builder',
          labelKey: 'nav.guidedBuilder',
          path: '/guided-builder',
          order: 1,
          scope: 'global',
          helpAvailable: true,
          helpPath: '/help/guided-builder',
        },
      ],
    },
    {
      key: 'projects',
      labelKey: 'nav.sections.projects',
      order: 1,
      items: [
        {
          key: 'projects',
          labelKey: 'nav.projects',
          path: '/projects',
          order: 0,
          scope: 'global',
        },
      ],
    },
  ];

  if (currentProjectKey) {
    sectionList.push({
      key: 'current-project',
      labelKey: 'nav.sections.currentProject',
      order: 2,
      items: [
        {
          key: 'project-artifacts',
          labelKey: 'nav.artifactBuilder',
          path: `/projects/${currentProjectKey}/artifacts`,
          order: 0,
          scope: 'project',
        },
        {
          key: 'project-assisted-creation',
          labelKey: 'ac.title',
          path: `/projects/${currentProjectKey}/assisted-creation`,
          order: 1,
          scope: 'project',
        },
        {
          key: 'project-readiness',
          labelKey: 'nav.readinessBuilder',
          path: `/projects/${currentProjectKey}/readiness`,
          order: 2,
          scope: 'project',
        },
        {
          key: 'project-propose',
          labelKey: 'projectView.tabs.proposeChanges',
          path: `/projects/${currentProjectKey}/propose`,
          order: 3,
          scope: 'project',
        },
        {
          key: 'project-apply',
          labelKey: 'projectView.tabs.applyProposals',
          path: `/projects/${currentProjectKey}/apply`,
          order: 4,
          scope: 'project',
        },
        {
          key: 'project-raid',
          labelKey: 'nav.raid',
          path: `/projects/${currentProjectKey}/raid`,
          order: 5,
          scope: 'project',
        },
        {
          key: 'project-audit',
          labelKey: 'projectView.tabs.audit',
          path: `/projects/${currentProjectKey}/audit`,
          order: 6,
          scope: 'project',
        },
        {
          key: 'project-journey-planner',
          labelKey: 'nav.journeys.planner',
          path: `/projects/${currentProjectKey}/readiness?journey=planner`,
          order: 7,
          scope: 'project',
        },
        {
          key: 'project-journey-reviewer',
          labelKey: 'nav.journeys.reviewer',
          path: `/projects/${currentProjectKey}/propose?journey=reviewer`,
          order: 8,
          scope: 'project',
        },
        {
          key: 'project-journey-approver',
          labelKey: 'nav.journeys.approver',
          path: `/projects/${currentProjectKey}/apply?journey=approver`,
          order: 9,
          scope: 'project',
        },
        {
          key: 'project-conflict-resolution',
          labelKey: 'nav.journeys.conflictResolution',
          path: `/projects/${currentProjectKey}/apply?journey=conflict-resolution`,
          order: 10,
          scope: 'project',
        },
      ],
    });
  }

  sectionList.push(
    {
      key: 'create',
      labelKey: 'nav.sections.create',
      order: 3,
      items: [
        {
          key: 'commands',
          labelKey: 'nav.commands',
          path: '/commands',
          order: 0,
          scope: 'global',
          helpAvailable: true,
          helpPath: '/help/workflows',
        },
      ],
    },
    {
      key: 'manage',
      labelKey: 'nav.sections.manage',
      order: 4,
      items: [
        {
          key: 'api-tester',
          labelKey: 'nav.apiTester',
          path: '/api-tester',
          order: 0,
          scope: 'global',
        },
        {
          key: 'ui-library',
          labelKey: 'nav.uiLibrary',
          path: '/ui',
          order: 1,
          scope: 'global',
        },
      ],
    },
  );

  return sortNavSections(sectionList);
};

export default function AppNavigation({
  connectionState,
  onRetryConnection,
}: AppNavigationProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const mobileToggleRef = useRef<HTMLButtonElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
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

  const currentProjectKey = useMemo(() => {
    const match = location.pathname.match(/^\/projects\/([^/]+)(?:\/.*)?$/);
    return match ? decodeURIComponent(match[1]) : null;
  }, [location.pathname]);

  const sections: NavSection[] = useMemo(() => buildSections(currentProjectKey), [currentProjectKey]);

  const closeMobile = () => setIsMobileOpen(false);

  const toggleSection = (key: string) => {
    setExpandedSections((current) => ({ ...current, [key]: !current[key] }));
  };

  const getNavFocusables = () =>
    Array.from(
      navRef.current?.querySelectorAll<HTMLElement>('[data-nav-focusable="true"]') ?? [],
    );

  useEffect(() => {
    if (!isMobileOpen) {
      return;
    }

    const toggleButton = mobileToggleRef.current;
    const mainContent = document.getElementById('main-content');
    mainContent?.setAttribute('inert', '');

    const focusables = getNavFocusables();
    focusables[0]?.focus();

    const onMobileKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsMobileOpen(false);
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const drawerFocusables = getNavFocusables();
      if (drawerFocusables.length === 0) {
        return;
      }

      const first = drawerFocusables[0];
      const last = drawerFocusables[drawerFocusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !active || !drawerFocusables.includes(active)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last || !active || !drawerFocusables.includes(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onMobileKeydown);

    return () => {
      document.removeEventListener('keydown', onMobileKeydown);
      mainContent?.removeAttribute('inert');
      toggleButton?.focus();
    };
  }, [isMobileOpen]);

  const onArrowNavigate: KeyboardEventHandler<HTMLElement> = (event) => {
    if (
      event.key !== 'ArrowDown' &&
      event.key !== 'ArrowUp' &&
      event.key !== 'Home' &&
      event.key !== 'End'
    ) {
      return;
    }

    const focusables = getNavFocusables();

    if (focusables.length === 0) {
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      focusables[0]?.focus();
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      focusables[focusables.length - 1]?.focus();
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
        ref={mobileToggleRef}
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

      <nav ref={navRef} id="app-navigation" className={`app-nav ${isMobileOpen ? 'app-nav--mobile-open' : ''}`} aria-label={t('nav.primaryAria')} onKeyDown={onArrowNavigate}>
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
            const itemsId = hasHeader ? `app-nav-section-items-${section.key}` : undefined;

            return (
              <section key={section.key} className="app-nav__section" aria-label={hasHeader ? t(section.labelKey) : undefined}>
                {hasHeader && (
                  <button
                    type="button"
                    className="app-nav__section-header"
                    onClick={() => toggleSection(section.key)}
                    aria-expanded={expanded}
                    aria-controls={itemsId}
                    data-nav-focusable="true"
                  >
                    <span>{t(section.labelKey)}</span>
                    <span className="app-nav__section-chevron" aria-hidden="true">
                      {expanded ? '▾' : '▸'}
                    </span>
                  </button>
                )}

                <div
                  className="app-nav__items"
                  id={itemsId}
                  hidden={hasHeader ? !expanded : false}
                >
                  {section.items.map((item) => (
                    <div key={item.key} className="app-nav__item-row">
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          [
                            'app-nav__item',
                            item.primary
                              ? 'app-nav__item--primary'
                              : 'app-nav__item--secondary',
                            `app-nav__item--scope-${item.scope}`,
                            isActive
                              ? 'app-nav__item--state-active'
                              : 'app-nav__item--state-inactive',
                            isActive ? 'app-nav__item--active' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')
                        }
                        onClick={closeMobile}
                        data-nav-focusable="true"
                      >
                        <span className="app-nav__label-group">
                          <span className="app-nav__label">{t(item.labelKey)}</span>
                          <span className={`app-nav__scope-badge app-nav__scope-badge--${item.scope}`} aria-hidden="true">
                            {item.scope === 'project' ? 'PRJ' : 'GLB'}
                          </span>
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
                          <span className="app-nav__help" aria-hidden="true">
                            ?
                          </span>
                        </NavLink>
                      )}
                    </div>
                  ))}
                </div>
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
