import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import apiClient from "../services/apiClient";
import type { Project } from "../types";
import { useToast } from "../hooks/useToast";
import { SkeletonProjectCard } from "./ui/Skeleton";
import { Button } from "./ui/Button";
import DataTable from "./DataTable";
import type { TableColumn, TableFilter } from "../types/table";
import "./ProjectList.css";

export default function ProjectList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({
    key: "",
    name: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch projects
  const {
    data: projectsResponse,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await apiClient.listProjects();
      if (!response.success) {
        throw new Error(response.error || t("projects.list.errors.load"));
      }
      return response.data || [];
    },
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (project: {
      key: string;
      name: string;
      description?: string;
    }) => {
      const normalizedDescription = project.description?.trim() || undefined;

      const response = await apiClient.createProject(
        project.key,
        project.name,
        normalizedDescription,
      );

      // Graceful fallback for older backend contracts without description support.
      if (!response.success && normalizedDescription) {
        const compatibilityResponse = await apiClient.createProject(
          project.key,
          project.name,
        );

        if (compatibilityResponse.success) {
          return compatibilityResponse.data;
        }
      }

      if (!response.success) {
        throw new Error(response.error || t("projects.list.errors.create"));
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowCreateForm(false);
      setNewProject({ key: "", name: "", description: "" });
      setError(null);
      toast.showSuccess(t("projects.list.toast.created"));
    },
    onError: (error: Error) => {
      console.error("Error creating project:", error);
      setError(error.message);
      toast.showError(
        t("projects.list.toast.createFailed", { message: error.message }),
      );
    },
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.key || !newProject.name) {
      setError(t("projects.create.errors.requiredKeyAndName"));
      return;
    }
    createProjectMutation.mutate(newProject);
  };

  const handleViewProject = (projectKey: string) => {
    navigate(`/projects/${projectKey}`);
  };

  if (isLoading) {
    return (
      <div className="project-list-container">
        <header className="project-list-header">
          <h1>{t("projects.list.title")}</h1>
        </header>
        <div className="projects-grid">
          <SkeletonProjectCard />
          <SkeletonProjectCard />
          <SkeletonProjectCard />
        </div>
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="project-list-container">
        <div className="error">
          {t("projects.list.errors.loadingWithMessage", {
            message: (queryError as Error).message,
          })}
        </div>
      </div>
    );
  }

  const projects = projectsResponse || [];

  const projectColumns: Array<TableColumn<Project>> = [
    {
      key: "key",
      label: t("projects.list.meta.key"),
      sortable: true,
      render: (project) => <span className="project-key">{project.key}</span>,
      sortValue: (project) => project.key,
    },
    {
      key: "name",
      label: t("projects.list.table.name"),
      sortable: true,
      sortValue: (project) => project.name,
    },
    {
      key: "description",
      label: t("projects.list.table.description"),
      render: (project) => project.description || "-",
      sortValue: (project) => project.description || "",
    },
    {
      key: "createdAt",
      label: t("projects.list.meta.created"),
      sortable: true,
      render: (project) => new Date(project.createdAt).toLocaleDateString(),
      sortValue: (project) => new Date(project.createdAt).getTime(),
    },
    {
      key: "gitRepo",
      label: t("projects.list.table.branch"),
      render: (project) =>
        project.gitRepo ? (
          <span className="git-status">{project.gitRepo.branch}</span>
        ) : (
          "-"
        ),
      sortValue: (project) => project.gitRepo?.branch || "",
    },
  ];

  const projectFilters: Array<TableFilter<Project>> = [
    {
      key: "search",
      label: t("table.search"),
      type: "search",
      placeholder: t("projects.list.table.searchPlaceholder"),
      accessor: (project) =>
        `${project.key} ${project.name} ${project.description || ""}`.toLowerCase(),
    },
  ];

  return (
    <div className="project-list-container">
      <header className="project-list-header">
        <h1>{t("projects.list.title")}</h1>
        <Button
          variant="primary"
          data-testid="create-project-button"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm
            ? t("projects.create.cta.cancel")
            : t("projects.list.cta.new")}
        </Button>
      </header>

      {error && <div className="error-message">{error}</div>}

      {showCreateForm && (
        <div className="create-project-form" data-testid="create-project-form">
          <h2>{t("projects.create.title")}</h2>
          <form onSubmit={handleCreateProject}>
            <div className="form-group">
              <label htmlFor="projectKey">
                {t("projects.create.form.keyLabel")}
              </label>
              <input
                id="projectKey"
                type="text"
                value={newProject.key}
                onChange={(e) =>
                  setNewProject({ ...newProject, key: e.target.value })
                }
                placeholder={t("projects.create.form.keyPlaceholder")}
                required
              />
              <small>{t("projects.create.form.keyHelp")}</small>
            </div>
            <div className="form-group">
              <label htmlFor="projectName">
                {t("projects.create.form.nameLabel")}
              </label>
              <input
                id="projectName"
                type="text"
                value={newProject.name}
                onChange={(e) =>
                  setNewProject({ ...newProject, name: e.target.value })
                }
                placeholder={t("projects.create.form.namePlaceholder")}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="projectDescription">
                {t("projects.create.form.descriptionLabel")}
              </label>
              <textarea
                id="projectDescription"
                value={newProject.description}
                onChange={(e) =>
                  setNewProject({ ...newProject, description: e.target.value })
                }
                placeholder={t("projects.create.form.descriptionPlaceholder")}
                rows={3}
              />
            </div>
            <div className="form-actions">
              <Button
                type="submit"
                variant="primary"
                isLoading={createProjectMutation.isPending}
                disabled={createProjectMutation.isPending}
              >
                {t("projects.create.cta.create")}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowCreateForm(false);
                  setError(null);
                }}
              >
                {t("projects.create.cta.cancel")}
              </Button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        columns={projectColumns}
        data={projects}
        filters={projectFilters}
        getRowId={(project) => project.key}
        onRowClick={(project) => handleViewProject(project.key)}
        queryKeyPrefix="projects"
        defaultPageSize={10}
        emptyTitle={t("projects.list.empty.title")}
        emptyDescription={t("projects.list.empty.text")}
        emptyCta={t("projects.list.cta.new")}
        onEmptyCta={() => setShowCreateForm(true)}
      />
    </div>
  );
}
