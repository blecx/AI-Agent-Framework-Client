import { defineConfig, devices } from "@playwright/test";

const e2eBaseUrl = process.env.E2E_BASE_URL || "http://localhost:5173";
const e2ePort = Number(new URL(e2eBaseUrl).port || "5173");

/**
 * E2E Test Configuration for AI Agent Framework Client
 *
 * Environment Variables:
 * - E2E_BASE_URL: Frontend URL (default: http://localhost:3000)
 * - API_BASE_URL: Backend API URL (default: http://localhost:8000)
 * - E2E_HEADLESS: Run in headless mode (default: true in CI)
 */
export default defineConfig({
  testDir: "./e2e/tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Timeout configuration
  timeout: 60000, // 60s per test
  expect: {
    timeout: 10000, // 10s for assertions
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
    },
  },

  // Reporter configuration
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["list"],
    ...(process.env.CI ? [["github"] as ["github"]] : []),
  ],

  use: {
    baseURL: e2eBaseUrl,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",

    // Timeouts
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  // Start web server before running tests
  webServer: {
    command: `npm run build && npm run preview -- --host 127.0.0.1 --strictPort --port ${e2ePort}`,
    url: e2eBaseUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 180000, // 3 minutes to start in CI
  },
});
