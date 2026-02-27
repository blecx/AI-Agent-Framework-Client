import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppNavigation from "./AppNavigation";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        "nav.brand": "AI Agent Framework",
        "nav.primaryAria": "Main navigation",
        "nav.openMenu": "Open navigation menu",
        "nav.closeMenu": "Close navigation menu",
        "nav.guidedBuilder": "Guided Builder",
        "projects.list.cta.new": "Create Project",
        "nav.projects": "Projects",
        "nav.sections.projects": "Projects",
        "nav.sections.currentProject": "Current Project",
        "nav.sections.create": "Create",
        "nav.sections.manage": "Manage",
        "nav.commands": "Commands",
        "nav.apiTester": "API Tester",
        "nav.uiLibrary": "UI Library",
        "nav.artifactBuilder": "Artifact Builder",
        "nav.readinessBuilder": "Readiness Builder",
        "nav.raid": "RAID",
        "projectView.tabs.proposeChanges": "Propose Changes",
        "projectView.tabs.applyProposals": "Apply Proposals",
        "projectView.tabs.audit": "Audit",
        "ac.title": "Assisted Creation",
        "nav.helpAvailable": "Help is available for this feature",
      })[key] ?? key,
  }),
}));

vi.mock("./ConnectionStatus", () => ({
  default: () => <div>ConnectionStatus</div>,
}));

vi.mock("./LanguageSwitcher", () => ({
  default: () => <div>LanguageSwitcher</div>,
}));

describe("AppNavigation", () => {
  it("renders guided builder as primary nav item and main sections", () => {
    render(
      <MemoryRouter initialEntries={["/projects"]}>
        <AppNavigation connectionState="online" />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("navigation", { name: "Main navigation" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Guided Builder" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Create Project" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: /Help is available for this feature: Guided Builder/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Projects/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create/i })).toBeInTheDocument();
  });

  it("highlights the active route", () => {
    render(
      <MemoryRouter initialEntries={["/guided-builder"]}>
        <AppNavigation connectionState="online" />
      </MemoryRouter>,
    );

    const guidedBuilderLink = screen.getByRole("link", {
      name: "Guided Builder",
    });
    expect(guidedBuilderLink.className).toContain("app-nav__item--active");
  });

  it("toggles mobile navigation and collapses sections", () => {
    render(
      <MemoryRouter initialEntries={["/projects"]}>
        <AppNavigation connectionState="online" />
      </MemoryRouter>,
    );

    const menuToggle = screen.getByRole("button", {
      name: /Open navigation menu/i,
    });
    expect(menuToggle).toHaveAttribute("aria-controls", "app-navigation");
    expect(menuToggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(menuToggle);

    expect(menuToggle).toHaveAttribute("aria-label", "Close navigation menu");
    expect(menuToggle).toHaveAttribute("aria-expanded", "true");

    const createSectionButton = screen.getByRole("button", { name: /Create/i });
    const createSectionId = createSectionButton.getAttribute("aria-controls");
    expect(createSectionId).toBeTruthy();
    const createSectionPanel = document.getElementById(createSectionId ?? "");
    expect(createSectionPanel).toBeTruthy();
    expect(createSectionButton).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(createSectionButton);
    expect(createSectionButton).toHaveAttribute("aria-expanded", "false");
    expect(createSectionPanel).toHaveAttribute("hidden");
  });

  it("does not expose duplicate project-scoped shortcuts in global navigation", () => {
    render(
      <MemoryRouter initialEntries={["/projects"]}>
        <AppNavigation connectionState="online" />
      </MemoryRouter>,
    );

    expect(
      screen.queryByRole("link", { name: /Assisted Creation/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Readiness Builder/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Open a project to start/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Open a project to assess readiness/i),
    ).not.toBeInTheDocument();
  });

  it("renders deterministic section and project item order", () => {
    render(
      <MemoryRouter initialEntries={["/projects/alpha-proj/audit"]}>
        <AppNavigation connectionState="online" />
      </MemoryRouter>,
    );

    const projectsButton = screen.getByRole("button", { name: /Projects/i });
    const currentProjectButton = screen.getByRole("button", {
      name: /Current Project/i,
    });
    const createButton = screen.getByRole("button", { name: /Create/i });
    const manageButton = screen.getByRole("button", { name: /Manage/i });

    expect(
      projectsButton.compareDocumentPosition(currentProjectButton) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      currentProjectButton.compareDocumentPosition(createButton) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      createButton.compareDocumentPosition(manageButton) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    const artifactLink = screen.getByRole("link", { name: "Artifact Builder" });
    const assistedLink = screen.getByRole("link", { name: "Assisted Creation" });
    const readinessLink = screen.getByRole("link", { name: "Readiness Builder" });
    const proposeLink = screen.getByRole("link", { name: "Propose Changes" });
    const applyLink = screen.getByRole("link", { name: "Apply Proposals" });
    const raidLink = screen.getByRole("link", { name: "RAID" });
    const auditLink = screen.getByRole("link", { name: "Audit" });

    expect(
      artifactLink.compareDocumentPosition(assistedLink) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      assistedLink.compareDocumentPosition(readinessLink) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      readinessLink.compareDocumentPosition(proposeLink) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      proposeLink.compareDocumentPosition(applyLink) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      applyLink.compareDocumentPosition(raidLink) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      raidLink.compareDocumentPosition(auditLink) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("shows scope markers for global and project scoped entries", () => {
    render(
      <MemoryRouter initialEntries={["/projects/alpha-proj/artifacts"]}>
        <AppNavigation connectionState="online" />
      </MemoryRouter>,
    );

    const projectsLink = screen.getByRole("link", { name: "Projects" });
    const artifactLink = screen.getByRole("link", { name: "Artifact Builder" });

    expect(projectsLink).toHaveTextContent("GLB");
    expect(artifactLink).toHaveTextContent("PRJ");
  });

  it("supports Home/End keyboard navigation across focusable nav controls", () => {
    render(
      <MemoryRouter initialEntries={["/projects/alpha-proj/artifacts"]}>
        <AppNavigation connectionState="online" />
      </MemoryRouter>,
    );

    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    const projectsButton = screen.getByRole("button", { name: /Projects/i });

    projectsButton.focus();
    fireEvent.keyDown(nav, { key: "End" });

    const focusables = Array.from(
      nav.querySelectorAll<HTMLElement>('[data-nav-focusable="true"]'),
    );

    expect(document.activeElement).toBe(focusables[focusables.length - 1]);

    fireEvent.keyDown(nav, { key: "Home" });
    expect(document.activeElement).toBe(focusables[0]);
  });
});
