import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import ReadinessPanel from './ReadinessPanel';
import ReadinessChecks from './ReadinessChecks';
import { mockReadinessService } from '../services/mockReadinessService';
import type { ProjectReadiness } from '../types/readiness';
import './ReadinessBuilder.css';

interface ReadinessBuilderProps {
  projectKey?: string;
}

export default function ReadinessBuilder({ projectKey: projectKeyProp }: ReadinessBuilderProps) {
  const { t } = useTranslation();
  const { projectKey: routeProjectKey } = useParams<{ projectKey: string }>();
  const projectKey = projectKeyProp || routeProjectKey;
  const [data, setData] = useState<ProjectReadiness | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!projectKey) {
        setError(t('rd.errors.missingProjectKey'));
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const readiness = await mockReadinessService.getProjectReadiness(projectKey);
        if (mounted) {
          setData(readiness);
        }
      } catch {
        if (mounted) {
          setError(t('rd.errors.loadFailed'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [projectKey, t]);

  if (loading) {
    return <div className="readiness-builder-loading">{t('rd.loading')}</div>;
  }

  if (error || !data) {
    return <div className="readiness-builder-error">{error || t('rd.errors.loadFailed')}</div>;
  }

  return (
    <div className="readiness-builder">
      <h2>{t('rd.title')}</h2>
      <ReadinessPanel readiness={data} />
      <ReadinessChecks checks={data.checks} />
    </div>
  );
}
