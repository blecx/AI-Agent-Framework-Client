import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ConnectionStatus from "../../../components/ConnectionStatus";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "conn.state.online": "Online",
        "conn.state.offline": "Offline",
        "conn.state.reconnecting": "Reconnecting…",
        "conn.state.degraded": "Degraded",
      };

      return translations[key] ?? key;
    },
  }),
}));

describe("ConnectionStatus", () => {
  it("renders online state with translated label", () => {
    const { container } = render(<ConnectionStatus state="online" />);

    expect(screen.getByText("Online")).toBeInTheDocument();
    expect(container.querySelector(".connection-status--online")).toBeTruthy();
  });

  it("renders offline state", () => {
    const { container } = render(<ConnectionStatus state="offline" />);

    expect(screen.getByText("Offline")).toBeInTheDocument();
    expect(container.querySelector(".connection-status--offline")).toBeTruthy();
  });

  it("renders reconnecting state", () => {
    const { container } = render(<ConnectionStatus state="reconnecting" />);

    expect(screen.getByText("Reconnecting…")).toBeInTheDocument();
    expect(
      container.querySelector(".connection-status--reconnecting"),
    ).toBeTruthy();
  });
});
