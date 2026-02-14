import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { ProjectReadiness, ReadinessCheck } from "../types/readiness";
import "./ReadinessPanel.css";

interface ReadinessPanelProps {
  readiness: ProjectReadiness;
}

const ICONS: Record<ProjectReadiness["overallStatus"], string> = {
  pass: "✓",
  warn: "⚠",
  fail: "✗",
  notAssessed: "○",
  inProgress: "⟳",
};

function isActionable(check: ReadinessCheck) {
  return (
    (check.status === "warn" ||
      check.status === "fail" ||
      check.status === "notAssessed") &&
    !!check.actionKey &&
    !!check.actionUrl
  );
}

export default function ReadinessPanel({ readiness }: ReadinessPanelProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const nextActions = readiness.checks.filter(isActionable).slice(0, 3);

  return (
    <section
      className={`readiness-panel readiness-panel--${readiness.overallStatus}`}
    >
      <div className="readiness-panel-status">
        <span className="readiness-panel-icon" aria-hidden="true">
          {ICONS[readiness.overallStatus]}
        </span>
        <span className="readiness-panel-label">
          {t(`rd.state.${readiness.overallStatus}`)}
        </span>
      </div>

      <div className="readiness-panel-summary">
        <span>
          {t("rd.summary.passed", { count: readiness.summary.passed })}
        </span>
        <span>
          {t("rd.summary.warnings", { count: readiness.summary.warnings })}
        </span>
        <span>
          {t("rd.summary.failed", { count: readiness.summary.failed })}
        </span>
      </div>

      {nextActions.length > 0 && (
        <div className="readiness-panel-actions">
          <h3>{t("rd.nextActions")}</h3>
          <ul>
            {nextActions.map((check) => (
              <li key={check.id}>
                <span>{t(`rd.checks.items.${check.id}.name`)}</span>
                <button
                  type="button"
                  className="readiness-panel-cta"
                  onClick={() => navigate(check.actionUrl || "/")}
                >
                  {check.actionKey
                    ? t(`rd.actions.${check.actionKey}`)
                    : t("rd.actions.open")}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
