import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import apiClient from "../services/apiClient";
import type { WorkflowState, WorkflowStateInfo } from "../types";
import "./WorkflowStatePanel.css";

interface WorkflowStatePanelProps {
  projectKey?: string;
}

function stateLabelKey(state: WorkflowState) {
  return `wf.states.${state}`;
}

export default function WorkflowStatePanel({ projectKey }: WorkflowStatePanelProps) {
  const { t } = useTranslation();
  const [workflowState, setWorkflowState] = useState<WorkflowStateInfo | null>(null);
  const [allowedTransitions, setAllowedTransitions] = useState<WorkflowState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transitioningTo, setTransitioningTo] = useState<WorkflowState | null>(null);

  const loadWorkflow = useCallback(async () => {
    if (!projectKey) {
      setError(t("wf.errors.missingProjectKey"));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [stateResponse, transitionsResponse] = await Promise.all([
        apiClient.getWorkflowState(projectKey),
        apiClient.getAllowedTransitions(projectKey),
      ]);

      if (!stateResponse.success) {
        setError(stateResponse.error || t("wf.errors.loadFailed"));
        return;
      }

      if (!transitionsResponse.success) {
        setError(transitionsResponse.error || t("wf.errors.loadFailed"));
        return;
      }

      setWorkflowState(stateResponse.data || null);
      setAllowedTransitions(transitionsResponse.data?.allowed_transitions || []);
    } catch {
      setError(t("wf.errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [projectKey, t]);

  useEffect(() => {
    void loadWorkflow();
  }, [loadWorkflow]);

  const handleTransition = async (toState: WorkflowState) => {
    if (!projectKey) {
      setError(t("wf.errors.missingProjectKey"));
      return;
    }

    setTransitioningTo(toState);
    setError(null);

    try {
      const response = await apiClient.transitionWorkflowState(projectKey, {
        to_state: toState,
      });

      if (!response.success) {
        setError(response.error || t("wf.errors.transitionFailed"));
        return;
      }

      await loadWorkflow();
    } catch {
      setError(t("wf.errors.transitionFailed"));
    } finally {
      setTransitioningTo(null);
    }
  };

  return (
    <section className="workflow-state-panel" aria-live="polite">
      <h2>{t("wf.title")}</h2>

      {loading && <div className="workflow-state-panel-loading">{t("wf.loading")}</div>}

      {error && (
        <div className="workflow-state-panel-error" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && workflowState && (
        <>
          <div className="workflow-state-panel-current">
            <strong>{t("wf.currentState")}: </strong>
            <span>{t(stateLabelKey(workflowState.current_state))}</span>
          </div>

          <div className="workflow-state-panel-meta">
            <span>
              {t("wf.updatedAt")}: {new Date(workflowState.updated_at).toLocaleString()}
            </span>
            <span>
              {t("wf.updatedBy")}: {workflowState.updated_by}
            </span>
          </div>

          <div className="workflow-state-panel-transitions">
            <h3>{t("wf.allowedTransitions")}</h3>

            {allowedTransitions.length === 0 ? (
              <p>{t("wf.noTransitions")}</p>
            ) : (
              <div className="workflow-state-panel-buttons">
                {allowedTransitions.map((state) => (
                  <button
                    key={state}
                    type="button"
                    className="workflow-state-panel-button"
                    disabled={transitioningTo !== null}
                    onClick={() => void handleTransition(state)}
                  >
                    {transitioningTo === state
                      ? t("wf.transitioning")
                      : t("wf.actions.transitionTo", {
                          state: t(stateLabelKey(state)),
                        })}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
