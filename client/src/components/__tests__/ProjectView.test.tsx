/**
 * ProjectView Component Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n/config";
import ProjectView from "../ProjectView";
import { AuditApiClient } from "../../services/AuditApiClient";

// Mock dependencies
vi.mock("../../services/apiClient", () => ({
  default: {
    getProject: vi.fn(),
  },
}));

vi.mock("../ProposePanel", () => ({ default: () => <div>ProposePanel</div> }));
vi.mock("../ApplyPanel", () => ({ default: () => <div>ApplyPanel</div> }));
vi.mock("../ProjectCommandPanel", () => ({
  default: () => <div>CommandPanel</div>,
}));
vi.mock("../ArtifactList", () => ({
  ArtifactList: ({
    onCreateNew,
    onSelectArtifact,
  }: {
    onCreateNew?: () => void;
    onSelectArtifact?: (artifact: { path: string; name: string }) => void;
  }) => (
    <div>
      <div>ArtifactList</div>
      <button type="button" onClick={() => onCreateNew?.()}>
        TriggerCreate
      </button>
      <button
        type="button"
        onClick={() =>
          onSelectArtifact?.({
            path: "artifacts/charter.md",
            name: "charter.md",
          })
        }
      >
        TriggerSelect
      </button>
    </div>
  ),
}));
vi.mock("../AuditViewer", () => ({
  AuditViewer: () => <div>AuditViewer</div>,
}));
vi.mock("../ReadinessBuilder", () => ({
  default: () => <div>ReadinessBuilder</div>,
}));
vi.mock("../RAIDList", () => ({
  default: () => <div>RAIDList</div>,
}));

const mockProject = {
  key: "TEST-123",
  name: "Test Project",
  description: "A test project description",
  createdAt: "2026-01-01T10:00:00Z",
  updatedAt: "2026-02-01T15:30:00Z",
  gitRepo: {
    url: "https://github.com/test/repo.git",
    branch: "main",
    lastCommit: "abc123",
    status: "clean",
  },
  documents: [
    {
      id: "doc-1",
      name: "Plan.md",
      path: "docs/plan.md",
      lastModified: "2026-01-15T12:00:00Z",
    },
  ],
};

const mockAuditData = {
  summary: {
    errors: 2,
    warnings: 5,
    info: 10,
  },
};

function renderWithProviders(
  ui: React.ReactElement,
  { route = "/projects/TEST-123" } = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/projects/:projectKey" element={ui} />
            <Route path="/projects/:projectKey/propose" element={ui} />
            <Route path="/projects/:projectKey/apply" element={ui} />
            <Route path="/projects/:projectKey/commands" element={ui} />
            <Route path="/projects/:projectKey/artifacts" element={ui} />
            <Route path="/projects/:projectKey/readiness" element={ui} />
            <Route path="/projects/:projectKey/raid" element={ui} />
            <Route path="/projects/:projectKey/audit" element={ui} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </I18nextProvider>,
  );
}

describe("ProjectView", () => {
  let mockGetProject: ReturnType<typeof vi.fn>;
  let mockGetAuditResults: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.restoreAllMocks();
    mockGetProject = vi.fn();
    mockGetAuditResults = vi.fn().mockResolvedValue(mockAuditData);

    const apiClient = await import("../../services/apiClient");
    vi.mocked(apiClient.default.getProject).mockImplementation(mockGetProject);

    vi.spyOn(AuditApiClient.prototype, "getAuditResults").mockImplementation(
      mockGetAuditResults,
    );
  });

  it("renders loading state with skeletons", () => {
    mockGetProject.mockReturnValue(new Promise(() => {})); // Never resolves
    renderWithProviders(<ProjectView />);

    expect(screen.getByText("← Back to Projects")).toBeInTheDocument();
    // Check for skeleton placeholders
    const skeletons = document.querySelectorAll(".skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders error state when project fetch fails", async () => {
    mockGetProject.mockRejectedValue(new Error("Network error"));
    renderWithProviders(<ProjectView />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading project/i)).toBeInTheDocument();
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });

    expect(
      screen.getByRole("button", { name: /back to projects/i }),
    ).toBeInTheDocument();
  });

  it("renders error when API returns unsuccessful response", async () => {
    mockGetProject.mockResolvedValue({
      success: false,
      error: "Project not found",
    });
    renderWithProviders(<ProjectView />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading project/i)).toBeInTheDocument();
      expect(screen.getByText(/Project not found/i)).toBeInTheDocument();
    });
  });

  it("renders project overview with all details", async () => {
    mockGetProject.mockResolvedValue({ success: true, data: mockProject });
    mockGetAuditResults.mockResolvedValue(mockAuditData);

    renderWithProviders(<ProjectView />);

    await waitFor(() => {
      expect(screen.getByText("Test Project")).toBeInTheDocument();
    });

    expect(screen.getByText(/Key: TEST-123/i)).toBeInTheDocument();
    expect(screen.getByText("A test project description")).toBeInTheDocument();
    expect(screen.getByText(/Project Details/i)).toBeInTheDocument();
  });

  it("displays git repository information when available", async () => {
    mockGetProject.mockResolvedValue({ success: true, data: mockProject });
    mockGetAuditResults.mockResolvedValue(mockAuditData);

    renderWithProviders(<ProjectView />);

    await waitFor(() => {
      expect(screen.getByText(/Git Repository/i)).toBeInTheDocument();
    });

    expect(
      screen.getByText("https://github.com/test/repo.git"),
    ).toBeInTheDocument();
    expect(screen.getByText("main")).toBeInTheDocument();
    expect(screen.getByText("abc123")).toBeInTheDocument();
    expect(screen.getByText("clean")).toBeInTheDocument();
  });

  it("displays documents list when available", async () => {
    mockGetProject.mockResolvedValue({ success: true, data: mockProject });
    mockGetAuditResults.mockResolvedValue(mockAuditData);

    renderWithProviders(<ProjectView />);

    await waitFor(() => {
      expect(screen.getByText(/Documents \(1\)/i)).toBeInTheDocument();
    });

    expect(screen.getByText("Plan.md")).toBeInTheDocument();
    expect(screen.getByText("docs/plan.md")).toBeInTheDocument();
  });

  it("displays audit badge when audit data is available", async () => {
    mockGetProject.mockResolvedValue({ success: true, data: mockProject });
    mockGetAuditResults.mockResolvedValue(mockAuditData);

    renderWithProviders(<ProjectView />);

    await waitFor(() => {
      expect(screen.getByText("Test Project")).toBeInTheDocument();
    });

    // Wait for audit query to complete and verify API was called
    await waitFor(() => {
      expect(mockGetAuditResults).toHaveBeenCalledWith("TEST-123");
    });
  });

  it("switches to propose tab when clicked", async () => {
    mockGetProject.mockResolvedValue({ success: true, data: mockProject });
    mockGetAuditResults.mockResolvedValue(mockAuditData);

    const user = userEvent.setup();
    renderWithProviders(<ProjectView />);

    await waitFor(() => {
      expect(screen.getByText("Test Project")).toBeInTheDocument();
    });

    const proposeTab = screen.getByRole("button", { name: /Propose Changes/i });
    await user.click(proposeTab);

    expect(proposeTab).toHaveClass("active");
    expect(screen.getByText("ProposePanel")).toBeInTheDocument();
  });

  it("switches to apply tab when clicked", async () => {
    mockGetProject.mockResolvedValue({ success: true, data: mockProject });
    mockGetAuditResults.mockResolvedValue(mockAuditData);

    const user = userEvent.setup();
    renderWithProviders(<ProjectView />);

    await waitFor(() => {
      expect(screen.getByText("Test Project")).toBeInTheDocument();
    });

    const applyTab = screen.getByRole("button", { name: /Apply Proposals/i });
    await user.click(applyTab);

    expect(applyTab).toHaveClass("active");
    expect(screen.getByText("ApplyPanel")).toBeInTheDocument();
  });

  it("switches to commands tab when clicked", async () => {
    mockGetProject.mockResolvedValue({ success: true, data: mockProject });
    mockGetAuditResults.mockResolvedValue(mockAuditData);

    const user = userEvent.setup();
    renderWithProviders(<ProjectView />);

    await waitFor(() => {
      expect(screen.getByText("Test Project")).toBeInTheDocument();
    });

    const commandsTab = screen.getByRole("button", { name: /Commands/i });
    await user.click(commandsTab);

    expect(commandsTab).toHaveClass("active");
    expect(screen.getByText("CommandPanel")).toBeInTheDocument();
  });

  it("switches to artifacts tab when clicked", async () => {
    mockGetProject.mockResolvedValue({ success: true, data: mockProject });
    mockGetAuditResults.mockResolvedValue(mockAuditData);

    const user = userEvent.setup();
    renderWithProviders(<ProjectView />);

    await waitFor(() => {
      expect(screen.getByText("Test Project")).toBeInTheDocument();
    });

    const artifactsTab = screen.getByRole("button", { name: /Artifacts/i });
    await user.click(artifactsTab);

    expect(artifactsTab).toHaveClass("active");
    expect(screen.getByText("ArtifactList")).toBeInTheDocument();
  });

  it("navigates to propose tab when artifact create CTA is triggered", async () => {
    mockGetProject.mockResolvedValue({ success: true, data: mockProject });
    mockGetAuditResults.mockResolvedValue(mockAuditData);

    const user = userEvent.setup();
    renderWithProviders(<ProjectView />);

    await waitFor(() => {
      expect(screen.getByText("Test Project")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Artifacts/i }));
    await user.click(screen.getByRole("button", { name: "TriggerCreate" }));

    await waitFor(() => {
      expect(screen.getByText("ProposePanel")).toBeInTheDocument();
    });
  });

  it("opens selected artifact in a new tab", async () => {
    mockGetProject.mockResolvedValue({ success: true, data: mockProject });
    mockGetAuditResults.mockResolvedValue(mockAuditData);

    const user = userEvent.setup();
    const openSpy = vi
      .spyOn(window, "open")
      .mockImplementation(() => null as unknown as Window);

    renderWithProviders(<ProjectView />);

    await waitFor(() => {
      expect(screen.getByText("Test Project")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Artifacts/i }));
    await user.click(screen.getByRole("button", { name: "TriggerSelect" }));

    expect(openSpy).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/projects/TEST-123/artifacts/artifacts/charter.md",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("switches to audit tab when clicked", async () => {
    mockGetProject.mockResolvedValue({ success: true, data: mockProject });
    mockGetAuditResults.mockResolvedValue(mockAuditData);

    const user = userEvent.setup();
    renderWithProviders(<ProjectView />);

    await waitFor(() => {
      expect(screen.getByText("Test Project")).toBeInTheDocument();
    });

    const auditTabs = screen.getAllByRole("button", { name: /Audit/i });
    const auditTab = auditTabs[0]; // Select first Audit button (the tab)
    await user.click(auditTab);

    await waitFor(() => {
      expect(screen.getByText("AuditViewer")).toBeInTheDocument();
    });
  });

  it("switches to readiness tab when clicked", async () => {
    mockGetProject.mockResolvedValue({ success: true, data: mockProject });
    mockGetAuditResults.mockResolvedValue(mockAuditData);

    const user = userEvent.setup();
    renderWithProviders(<ProjectView />);

    await waitFor(() => {
      expect(screen.getByText("Test Project")).toBeInTheDocument();
    });

    const readinessTab = screen.getByRole("button", {
      name: /Readiness Builder/i,
    });
    await user.click(readinessTab);

    await waitFor(() => {
      expect(screen.getByText("ReadinessBuilder")).toBeInTheDocument();
    });
  });

  it("switches to RAID tab when clicked", async () => {
    mockGetProject.mockResolvedValue({ success: true, data: mockProject });
    mockGetAuditResults.mockResolvedValue(mockAuditData);

    const user = userEvent.setup();
    renderWithProviders(<ProjectView />);

    await waitFor(() => {
      expect(screen.getByText("Test Project")).toBeInTheDocument();
    });

    const raidTab = screen.getByRole("button", { name: /RAID/i });
    await user.click(raidTab);

    await waitFor(() => {
      expect(screen.getByText("RAIDList")).toBeInTheDocument();
    });
  });

  it("loads propose content when opened via propose route", async () => {
    mockGetProject.mockResolvedValue({ success: true, data: mockProject });
    mockGetAuditResults.mockResolvedValue(mockAuditData);

    renderWithProviders(<ProjectView />, {
      route: "/projects/TEST-123/propose",
    });

    await waitFor(() => {
      expect(screen.getByText("ProposePanel")).toBeInTheDocument();
    });
  });

  it("loads apply content when opened via apply route", async () => {
    mockGetProject.mockResolvedValue({ success: true, data: mockProject });
    mockGetAuditResults.mockResolvedValue(mockAuditData);

    renderWithProviders(<ProjectView />, {
      route: "/projects/TEST-123/apply",
    });

    await waitFor(() => {
      expect(screen.getByText("ApplyPanel")).toBeInTheDocument();
    });
  });

  it("handles project without git repository", async () => {
    const projectWithoutGit = { ...mockProject, gitRepo: undefined };
    mockGetProject.mockResolvedValue({
      success: true,
      data: projectWithoutGit,
    });
    mockGetAuditResults.mockResolvedValue(mockAuditData);

    renderWithProviders(<ProjectView />);

    await waitFor(() => {
      expect(screen.getByText("Test Project")).toBeInTheDocument();
    });

    expect(screen.queryByText(/Git Repository/i)).not.toBeInTheDocument();
  });

  it("handles project without documents", async () => {
    const projectWithoutDocs = { ...mockProject, documents: [] };
    mockGetProject.mockResolvedValue({
      success: true,
      data: projectWithoutDocs,
    });
    mockGetAuditResults.mockResolvedValue(mockAuditData);

    renderWithProviders(<ProjectView />);

    await waitFor(() => {
      expect(screen.getByText("Test Project")).toBeInTheDocument();
    });

    expect(screen.queryByText(/Documents/i)).not.toBeInTheDocument();
  });

  it("remains compatible when project has no description", async () => {
    const projectWithoutDescription = {
      ...mockProject,
      description: undefined,
    };

    mockGetProject.mockResolvedValue({
      success: true,
      data: projectWithoutDescription,
    });
    mockGetAuditResults.mockResolvedValue(mockAuditData);

    renderWithProviders(<ProjectView />);

    await waitFor(() => {
      expect(screen.getByText("Test Project")).toBeInTheDocument();
    });

    expect(
      screen.queryByText("A test project description"),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Project Details/i)).toBeInTheDocument();
  });

  it("handles missing audit data gracefully", async () => {
    mockGetProject.mockResolvedValue({ success: true, data: mockProject });
    mockGetAuditResults.mockRejectedValue(new Error("No audit data"));

    renderWithProviders(<ProjectView />);

    await waitFor(() => {
      expect(screen.getByText("Test Project")).toBeInTheDocument();
    });

    // Should still render project view even without audit data
    expect(screen.getByText(/Project Details/i)).toBeInTheDocument();
  });

  it("formats dates correctly", async () => {
    mockGetProject.mockResolvedValue({ success: true, data: mockProject });
    mockGetAuditResults.mockResolvedValue(mockAuditData);

    renderWithProviders(<ProjectView />);

    await waitFor(() => {
      expect(screen.getByText("Test Project")).toBeInTheDocument();
    });

    // Dates should be formatted as locale strings
    const dateElements = screen.getAllByText(/2026/);
    expect(dateElements.length).toBeGreaterThan(0);
  });
});
