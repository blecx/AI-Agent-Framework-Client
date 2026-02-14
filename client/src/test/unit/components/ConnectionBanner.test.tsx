import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConnectionBanner from "../../../components/ConnectionBanner";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "banner.offline":
          "Offline: changes are saved locally. You can sync later.",
        "banner.degraded": "Limited connection: sync may fail.",
        "conn.action.workOffline": "Work offline",
        "conn.action.retry": "Retry",
      };

      return translations[key] ?? key;
    },
  }),
}));

describe("ConnectionBanner", () => {
  it("does not render while online", () => {
    const { container } = render(
      <ConnectionBanner state="online" onRetry={vi.fn()} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders offline message and action buttons", () => {
    render(<ConnectionBanner state="offline" onRetry={vi.fn()} />);

    expect(
      screen.getByText(
        "Offline: changes are saved locally. You can sync later.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Work offline" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("dismisses when Work offline is clicked", () => {
    render(<ConnectionBanner state="offline" onRetry={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Work offline" }));

    expect(
      screen.queryByText(
        "Offline: changes are saved locally. You can sync later.",
      ),
    ).not.toBeInTheDocument();
  });

  it("calls retry callback when Retry is clicked", () => {
    const onRetry = vi.fn();
    render(<ConnectionBanner state="degraded" onRetry={onRetry} />);

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(onRetry).toHaveBeenCalledOnce();
  });
});
