/**
 * ArtifactList Component
 * Displays project artifacts with navigation to editor
 */

import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ArtifactApiClient,
  type Artifact,
} from "../services/ArtifactApiClient";
import { AuditApiClient } from "../services/AuditApiClient";
import EmptyState from "./ui/EmptyState";
import "./ArtifactList.css";

interface ArtifactListProps {
  projectKey: string;
  onCreateNew?: () => void;
  onSelectArtifact?: (artifact: Artifact) => void;
}

type SortField = "name" | "date";
type SortDirection = "asc" | "desc";

const EXTENSION_ICON_MAP: Record<string, string> = {
  md: "📝",
  markdown: "📝",
  txt: "📄",
  pdf: "📕",
  doc: "📘",
  docx: "📘",
  xls: "📊",
  xlsx: "📊",
  csv: "📈",
  ppt: "📽",
  pptx: "📽",
  json: "🧩",
  yml: "⚙",
  yaml: "⚙",
  xml: "🧾",
};

function getArtifactIcon(artifact: Artifact): string {
  const extensionFromName = artifact.name.split(".").pop()?.toLowerCase();
  if (extensionFromName && EXTENSION_ICON_MAP[extensionFromName]) {
    return EXTENSION_ICON_MAP[extensionFromName];
  }

  const extensionFromPath = artifact.path.split(".").pop()?.toLowerCase();
  if (extensionFromPath && EXTENSION_ICON_MAP[extensionFromPath]) {
    return EXTENSION_ICON_MAP[extensionFromPath];
  }

  const extensionFromType = artifact.type.toLowerCase();
  if (EXTENSION_ICON_MAP[extensionFromType]) {
    return EXTENSION_ICON_MAP[extensionFromType];
  }

  return "📄";
}

function toSafeDomId(value: string) {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized.length > 0 ? normalized : "root";
}

function stableIdSuffix(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }

  return Math.abs(hash).toString(36);
}

function getAriaSort(field: SortField, sortField: SortField, sortDirection: SortDirection) {
  if (field !== sortField) {
    return "none";
  }

  return sortDirection === "asc" ? "ascending" : "descending";
}

export const ArtifactList: React.FC<ArtifactListProps> = ({
  projectKey,
  onCreateNew,
  onSelectArtifact,
}) => {
  const { t } = useTranslation();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );
  const [auditIssuesMap, setAuditIssuesMap] = useState<
    Record<string, { hasErrors: boolean; hasWarnings: boolean }>
  >({});

  const apiClient = useMemo(() => new ArtifactApiClient(), []);
  const auditClient = useMemo(() => new AuditApiClient(), []);

  useEffect(() => {
    const fetchArtifacts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.listArtifacts(projectKey);
        setArtifacts(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : t("art.list.errors.failedToLoad"),
        );
      } finally {
        setLoading(false);
      }
    };

    if (projectKey) {
      fetchArtifacts();
    }
  }, [projectKey, apiClient, t]);

  useEffect(() => {
    const fetchAuditData = async () => {
      try {
        const auditResult = await auditClient.getAuditResults(projectKey);
        const issuesMap: Record<
          string,
          { hasErrors: boolean; hasWarnings: boolean }
        > = {};

        auditResult.issues.forEach((issue) => {
          if (!issuesMap[issue.artifact]) {
            issuesMap[issue.artifact] = {
              hasErrors: false,
              hasWarnings: false,
            };
          }
          if (issue.severity === "error") {
            issuesMap[issue.artifact].hasErrors = true;
          } else if (issue.severity === "warning") {
            issuesMap[issue.artifact].hasWarnings = true;
          }
        });

        setAuditIssuesMap(issuesMap);
      } catch {
        // Audit data is optional - don't show error
        setAuditIssuesMap({});
      }
    };

    if (projectKey) {
      fetchAuditData();
    }
  }, [projectKey, auditClient]);

  const sortedArtifacts = useMemo(() => {
    const sorted = [...artifacts];
    sorted.sort((a, b) => {
      let comparison = 0;

      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "date") {
        const dateA = a.versions?.[0]?.date || "";
        const dateB = b.versions?.[0]?.date || "";
        comparison = dateA.localeCompare(dateB);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
    return sorted;
  }, [artifacts, sortField, sortDirection]);

  const filteredArtifacts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return sortedArtifacts;
    }

    return sortedArtifacts.filter((artifact) => {
      return (
        artifact.name.toLowerCase().includes(query) ||
        artifact.path.toLowerCase().includes(query)
      );
    });
  }, [sortedArtifacts, searchQuery]);

  const groupedArtifacts = useMemo(() => {
    return filteredArtifacts.reduce<Record<string, Artifact[]>>(
      (acc, artifact) => {
        const pathParts = artifact.path.split("/");
        const group =
          pathParts.length > 1
            ? pathParts.slice(0, -1).join("/")
            : t("art.list.groups.root");

        if (!acc[group]) {
          acc[group] = [];
        }

        acc[group].push(artifact);
        return acc;
      },
      {},
    );
  }, [filteredArtifacts, t]);

  useEffect(() => {
    setExpandedGroups((previousGroups) => {
      const nextExpandedGroups: Record<string, boolean> = {};
      Object.keys(groupedArtifacts).forEach((group) => {
        nextExpandedGroups[group] = previousGroups[group] ?? true;
      });

      const previousKeys = Object.keys(previousGroups);
      const nextKeys = Object.keys(nextExpandedGroups);

      if (previousKeys.length !== nextKeys.length) {
        return nextExpandedGroups;
      }

      for (const key of nextKeys) {
        if (previousGroups[key] !== nextExpandedGroups[key]) {
          return nextExpandedGroups;
        }
      }

      return previousGroups;
    });
  }, [groupedArtifacts]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleArtifactClick = (artifact: Artifact) => {
    if (onSelectArtifact) {
      onSelectArtifact(artifact);
    }
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  if (loading) {
    return <div className="artifact-list-loading">{t("art.list.loading")}</div>;
  }

  if (error) {
    return (
      <div className="artifact-list-error">
        {t("art.list.errors.loadingWithMessage", { message: error })}
      </div>
    );
  }

  return (
    <div className="artifact-list">
      <div className="artifact-list-header">
        <h2>{t("art.list.title")}</h2>
        <button
          className="btn-create-artifact"
          onClick={onCreateNew}
          aria-label={t("art.list.actions.createNewAria")}
          type="button"
          disabled={!onCreateNew}
        >
          {t("art.list.actions.createNew")}
        </button>
      </div>

      <div className="artifact-list-toolbar">
        <input
          type="search"
          className="artifact-search-input"
          placeholder={t("art.list.search.placeholder")}
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          aria-label={t("art.list.search.aria")}
        />
      </div>

      {artifacts.length === 0 ? (
        <EmptyState
          icon="📄"
          title={t("art.list.empty.title")}
          description={t("art.list.empty.description")}
          ctaLabel={t("art.list.cta.create")}
          ctaAction={() => onCreateNew?.()}
        />
      ) : filteredArtifacts.length === 0 ? (
        <div className="artifact-no-results" role="status" aria-live="polite">
          <h3>{t("art.list.search.noResults.title")}</h3>
          <p>{t("art.list.search.noResults.description")}</p>
          <button
            className="artifact-search-clear"
            onClick={() => setSearchQuery("")}
            type="button"
          >
            {t("art.list.search.clear")}
          </button>
        </div>
      ) : (
        <section className="artifact-explorer" aria-label={t("art.list.groups.aria")}>
          {Object.entries(groupedArtifacts).map(([groupName, groupItems]) => {
            const isExpanded = expandedGroups[groupName] ?? true;
            const groupContentId = `artifact-group-${toSafeDomId(groupName)}-${stableIdSuffix(groupName)}`;

            return (
              <section className="artifact-group" key={groupName}>
                <button
                  type="button"
                  className="artifact-group-toggle"
                  onClick={() => toggleGroup(groupName)}
                  aria-expanded={isExpanded}
                  aria-controls={groupContentId}
                >
                  <span className="artifact-group-chevron" aria-hidden="true">
                    {isExpanded ? "▾" : "▸"}
                  </span>
                  <span className="artifact-group-name">{groupName}</span>
                  <span className="artifact-group-count">
                    {groupItems.length}
                  </span>
                </button>

                <div
                  className="artifact-list-table-wrapper"
                  id={groupContentId}
                  hidden={!isExpanded}
                >
                  <table className="artifact-list-table">
                      <thead>
                        <tr>
                          <th className="artifact-status-col" scope="col">
                            {t("art.list.columns.status")}
                          </th>
                          <th
                            className="sortable"
                            scope="col"
                            aria-sort={getAriaSort("name", sortField, sortDirection)}
                          >
                            <button
                              type="button"
                              className="artifact-sort-button"
                              onClick={() => handleSort("name")}
                            >
                              {t("art.list.columns.name")}
                              {sortField === "name" &&
                                (sortDirection === "asc" ? "↑" : "↓")}
                            </button>
                          </th>
                          <th scope="col">{t("art.list.columns.type")}</th>
                          <th scope="col">{t("art.list.columns.path")}</th>
                          <th
                            className="sortable"
                            scope="col"
                            aria-sort={getAriaSort("date", sortField, sortDirection)}
                          >
                            <button
                              type="button"
                              className="artifact-sort-button"
                              onClick={() => handleSort("date")}
                            >
                              {t("art.list.columns.lastModified")}
                              {sortField === "date" &&
                                (sortDirection === "asc" ? "↑" : "↓")}
                            </button>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupItems.map((artifact) => {
                          const auditStatus = auditIssuesMap[artifact.name] || {
                            hasErrors: false,
                            hasWarnings: false,
                          };

                          const statusLabel = auditStatus.hasErrors
                            ? t("art.state.needsAttention")
                            : auditStatus.hasWarnings
                              ? t("art.state.inReview")
                              : t("art.state.complete");
                          const statusIcon = auditStatus.hasErrors
                            ? "✗"
                            : auditStatus.hasWarnings
                              ? "⚠"
                              : "✓";
                          const statusClass = auditStatus.hasErrors
                            ? "error"
                            : auditStatus.hasWarnings
                              ? "warning"
                              : "success";

                          return (
                            <tr key={artifact.path} className="artifact-row">
                              <td
                                className={`artifact-status artifact-status--${statusClass}`}
                                aria-label={statusLabel}
                              >
                                <span aria-hidden="true">{statusIcon}</span>
                              </td>
                              <td className="artifact-name">
                                <button
                                  type="button"
                                  className="artifact-open-button"
                                  onClick={() => handleArtifactClick(artifact)}
                                  disabled={!onSelectArtifact}
                                >
                                  <span className="artifact-file-icon" aria-hidden="true">
                                    {getArtifactIcon(artifact)}
                                  </span>{" "}
                                  <span className="artifact-file-name">{artifact.name}</span>
                                </button>
                              </td>
                              <td>{artifact.type}</td>
                              <td className="artifact-path" title={artifact.path}>
                                {artifact.path}
                              </td>
                              <td>{artifact.versions?.[0]?.date || "N/A"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    </div>
              </section>
            );
          })}
        </section>
      )}
    </div>
  );
};
