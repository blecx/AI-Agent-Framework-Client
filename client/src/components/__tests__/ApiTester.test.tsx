/**
 * ApiTester Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ApiTester from '../ApiTester';
import apiService, { type TestResult } from '../../services/api';

// Mock dependencies
vi.mock('../../services/api', () => ({
  default: {
    getBaseUrl: vi.fn(),
    setBaseUrl: vi.fn(),
    testHealth: vi.fn(),
    testInfo: vi.fn(),
    testListAgents: vi.fn(),
    testAgentCapabilities: vi.fn(),
    testCustomEndpoint: vi.fn(),
  },
}));

vi.mock('../../hooks/useToast', () => ({
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showInfo: vi.fn(),
  }),
}));

describe('ApiTester', () => {
  const mockTestResult: TestResult = {
    status: 'success',
    method: 'GET',
    endpoint: '/health',
    duration: 150,
    response: { status: 'healthy' },
  };

  const mockErrorResult: TestResult = {
    status: 'error',
    method: 'GET',
    endpoint: '/invalid',
    duration: 50,
    error: 'Not Found',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (apiService.getBaseUrl as ReturnType<typeof vi.fn>).mockReturnValue('http://localhost:8000/api');
    (apiService.testHealth as ReturnType<typeof vi.fn>).mockResolvedValue(mockTestResult);
    (apiService.testInfo as ReturnType<typeof vi.fn>).mockResolvedValue(mockTestResult);
    (apiService.testListAgents as ReturnType<typeof vi.fn>).mockResolvedValue(mockTestResult);
    (apiService.testAgentCapabilities as ReturnType<typeof vi.fn>).mockResolvedValue(mockTestResult);
    (apiService.testCustomEndpoint as ReturnType<typeof vi.fn>).mockResolvedValue(mockTestResult);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // Render Tests
  // =========================================================================

  describe('Component Rendering', () => {
    it('should render main heading and subtitle', () => {
      render(<ApiTester />);

      expect(screen.getByText('AI Agent Framework API Tester')).toBeInTheDocument();
      expect(screen.getByText('Test API endpoints without workflows')).toBeInTheDocument();
    });

    it('should render configuration section', () => {
      render(<ApiTester />);

      expect(screen.getByText('Configuration')).toBeInTheDocument();
      expect(screen.getByLabelText('API Base URL:')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update url/i })).toBeInTheDocument();
    });

    it('should render predefined tests section', () => {
      render(<ApiTester />);

      expect(screen.getByText('Predefined Tests')).toBeInTheDocument();
      expect(screen.getByText('Health Check')).toBeInTheDocument();
      expect(screen.getByText('API Info')).toBeInTheDocument();
      expect(screen.getByText('List Agents')).toBeInTheDocument();
      expect(screen.getByText('Agent Capabilities')).toBeInTheDocument();
    });

    it('should render custom test section', () => {
      render(<ApiTester />);

      expect(screen.getByText('Custom Test')).toBeInTheDocument();
      expect(screen.getByLabelText('Endpoint:')).toBeInTheDocument();
      expect(screen.getByLabelText('Method:')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /run custom test/i })).toBeInTheDocument();
    });

    it('should display current API URL in input', () => {
      render(<ApiTester />);

      const urlInput = screen.getByLabelText('API Base URL:') as HTMLInputElement;
      expect(urlInput.value).toBe('http://localhost:8000/api');
    });

    it('should not render results section initially', () => {
      render(<ApiTester />);

      expect(screen.queryByText(/Test Results/)).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // API URL Configuration Tests
  // =========================================================================

  describe('API URL Configuration', () => {
    it('should update API URL input when typing', async () => {
      const user = userEvent.setup();
      render(<ApiTester />);

      const urlInput = screen.getByLabelText('API Base URL:') as HTMLInputElement;
      await user.clear(urlInput);
      await user.type(urlInput, 'http://localhost:9000/api');

      expect(urlInput.value).toBe('http://localhost:9000/api');
    });

    it('should call setBaseUrl when Update URL button is clicked', async () => {
      const user = userEvent.setup();
      render(<ApiTester />);

      const urlInput = screen.getByLabelText('API Base URL:');
      await user.clear(urlInput);
      await user.type(urlInput, 'http://newapi.com');

      const updateButton = screen.getByRole('button', { name: /update url/i });
      await user.click(updateButton);

      expect(apiService.setBaseUrl).toHaveBeenCalledWith('http://newapi.com');
    });

    it('should clear test results when URL is updated', async () => {
      const user = userEvent.setup();
      render(<ApiTester />);

      // Run a test first to create results
      const healthButton = screen.getAllByRole('button', { name: /run test/i })[0];
      await user.click(healthButton);

      await waitFor(() => {
        expect(screen.getByText(/Test Results/)).toBeInTheDocument();
      });

      // Update URL
      const updateButton = screen.getByRole('button', { name: /update url/i });
      await user.click(updateButton);

      // Results should be cleared
      expect(screen.queryByText(/Test Results/)).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // Predefined Test Execution Tests
  // =========================================================================

  describe('Predefined Test Execution', () => {
    it('should run Health Check test when button clicked', async () => {
      const user = userEvent.setup();
      render(<ApiTester />);

      const runButtons = screen.getAllByRole('button', { name: /run test/i });
      await user.click(runButtons[0]); // Health Check

      await waitFor(() => {
        expect(apiService.testHealth).toHaveBeenCalled();
      });
    });

    it('should run API Info test when button clicked', async () => {
      const user = userEvent.setup();
      render(<ApiTester />);

      const runButtons = screen.getAllByRole('button', { name: /run test/i });
      await user.click(runButtons[1]); // API Info

      await waitFor(() => {
        expect(apiService.testInfo).toHaveBeenCalled();
      });
    });

    it('should display test results after running a test', async () => {
      const user = userEvent.setup();
      render(<ApiTester />);

      const runButton = screen.getAllByRole('button', { name: /run test/i })[0];
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByText(/Test Results/)).toBeInTheDocument();
        expect(screen.getByText('/health')).toBeInTheDocument();
        // Use getAllByText since GET appears in dropdown and badge
        const getBadges = screen.getAllByText('GET');
        expect(getBadges.length).toBeGreaterThan(0);
      });
    });

    it('should display success status icon for successful test', async () => {
      const user = userEvent.setup();
      render(<ApiTester />);

      const runButton = screen.getAllByRole('button', { name: /run test/i })[0];
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('✓')).toBeInTheDocument();
      });
    });

    it('should display duration in test results', async () => {
      const user = userEvent.setup();
      render(<ApiTester />);

      const runButton = screen.getAllByRole('button', { name: /run test/i })[0];
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('150ms')).toBeInTheDocument();
      });
    });

    it('should disable test buttons while test is running', async () => {
      const user = userEvent.setup();
      (apiService.testHealth as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockTestResult), 100))
      );

      render(<ApiTester />);

      const runButtons = screen.getAllByRole('button', { name: /run test/i });
      await user.click(runButtons[0]);

      // Buttons should be disabled immediately
      runButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });

      // Wait for test to complete
      await waitFor(() => {
        runButtons.forEach((button) => {
          expect(button).not.toBeDisabled();
        });
      });
    });

    it('should display error status for failed test', async () => {
      const user = userEvent.setup();
      (apiService.testHealth as ReturnType<typeof vi.fn>).mockResolvedValue(mockErrorResult);

      render(<ApiTester />);

      const runButton = screen.getAllByRole('button', { name: /run test/i })[0];
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('✗')).toBeInTheDocument();
        expect(screen.getByText(/Not Found/)).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // Run All Tests Functionality
  // =========================================================================

  describe('Run All Tests', () => {
    it('should have "Run All Tests" button', () => {
      render(<ApiTester />);

      expect(screen.getByRole('button', { name: /run all tests/i })).toBeInTheDocument();
    });

    it('should run all predefined tests sequentially', async () => {
      const user = userEvent.setup();
      render(<ApiTester />);

      const runAllButton = screen.getByRole('button', { name: /run all tests/i });
      await user.click(runAllButton);

      await waitFor(() => {
        expect(apiService.testHealth).toHaveBeenCalled();
        expect(apiService.testInfo).toHaveBeenCalled();
        expect(apiService.testListAgents).toHaveBeenCalled();
        expect(apiService.testAgentCapabilities).toHaveBeenCalled();
      });
    });

    it('should display "Running Tests..." during execution', async () => {
      const user = userEvent.setup();
      (apiService.testHealth as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockTestResult), 200))
      );

      render(<ApiTester />);

      const runAllButton = screen.getByRole('button', { name: /run all tests/i });
      await user.click(runAllButton);

      expect(screen.getByText('Running Tests...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText(/run all tests/i)).toBeInTheDocument();
      });
    });

    it('should display results for all tests', async () => {
      const user = userEvent.setup();
      render(<ApiTester />);

      const runAllButton = screen.getByRole('button', { name: /run all tests/i });
      await user.click(runAllButton);

      await waitFor(() => {
        expect(screen.getByText(/Test Results \(4\)/)).toBeInTheDocument();
      });
    });

    it('should clear previous results when running all tests', async () => {
      const user = userEvent.setup();
      render(<ApiTester />);

      // Run one test first
      const runButton = screen.getAllByRole('button', { name: /run test/i })[0];
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByText(/Test Results \(1\)/)).toBeInTheDocument();
      });

      // Run all tests
      const runAllButton = screen.getByRole('button', { name: /run all tests/i });
      await user.click(runAllButton);

      await waitFor(() => {
        expect(screen.getByText(/Test Results \(4\)/)).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // Custom Test Execution Tests
  // =========================================================================

  describe('Custom Test Execution', () => {
    it('should update custom endpoint input', async () => {
      const user = userEvent.setup();
      render(<ApiTester />);

      const endpointInput = screen.getByLabelText('Endpoint:') as HTMLInputElement;
      await user.clear(endpointInput);
      await user.type(endpointInput, '/custom/endpoint');

      expect(endpointInput.value).toBe('/custom/endpoint');
    });

    it('should update method dropdown', async () => {
      const user = userEvent.setup();
      render(<ApiTester />);

      const methodSelect = screen.getByLabelText('Method:') as HTMLSelectElement;
      await user.selectOptions(methodSelect, 'POST');

      expect(methodSelect.value).toBe('POST');
    });

    it('should show request body field when method is POST', async () => {
      const user = userEvent.setup();
      render(<ApiTester />);

      const methodSelect = screen.getByLabelText('Method:');
      await user.selectOptions(methodSelect, 'POST');

      expect(screen.getByLabelText('Request Body (JSON):')).toBeInTheDocument();
    });

    it('should hide request body field when method is GET', async () => {
      const user = userEvent.setup();
      render(<ApiTester />);

      const methodSelect = screen.getByLabelText('Method:');
      
      // Change to POST first (to show body field)
      await user.selectOptions(methodSelect, 'POST');
      expect(screen.getByLabelText('Request Body (JSON):')).toBeInTheDocument();

      // Change back to GET
      await user.selectOptions(methodSelect, 'GET');
      expect(screen.queryByLabelText('Request Body (JSON):')).not.toBeInTheDocument();
    });

    it('should run custom test with endpoint and method', async () => {
      const user = userEvent.setup();
      render(<ApiTester />);

      const endpointInput = screen.getByLabelText('Endpoint:');
      await user.clear(endpointInput);
      await user.type(endpointInput, '/status');

      const methodSelect = screen.getByLabelText('Method:');
      await user.selectOptions(methodSelect, 'GET');

      const runButton = screen.getByRole('button', { name: /run custom test/i });
      await user.click(runButton);

      await waitFor(() => {
        expect(apiService.testCustomEndpoint).toHaveBeenCalledWith('/status', 'GET', undefined);
      });
    });

    it('should run custom test with JSON body for POST request', async () => {
      const user = userEvent.setup();
      render(<ApiTester />);

      const methodSelect = screen.getByLabelText('Method:');
      await user.selectOptions(methodSelect, 'POST');

      const bodyInput = screen.getByLabelText('Request Body (JSON):') as HTMLTextAreaElement;
      // Use paste() instead of type() to avoid curly brace parsing issues
      await user.clear(bodyInput);
      await user.click(bodyInput);
      await user.paste('{"name": "test"}');

      const runButton = screen.getByRole('button', { name: /run custom test/i });
      await user.click(runButton);

      await waitFor(() => {
        expect(apiService.testCustomEndpoint).toHaveBeenCalledWith(
          '/health',
          'POST',
          { name: 'test' }
        );
      });
    });

    it('should handle invalid JSON in request body gracefully', async () => {
      const user = userEvent.setup();
      render(<ApiTester />);

      const methodSelect = screen.getByLabelText('Method:');
      await user.selectOptions(methodSelect, 'POST');

      const bodyInput = screen.getByLabelText('Request Body (JSON):') as HTMLTextAreaElement;
      // Use paste() to avoid curly brace parsing
      await user.clear(bodyInput);
      await user.click(bodyInput);
      await user.paste('invalid json{');

      const runButton = screen.getByRole('button', { name: /run custom test/i });
      await user.click(runButton);

      // Should not call testCustomEndpoint with invalid JSON
      expect(apiService.testCustomEndpoint).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // Clear Results Tests
  // =========================================================================

  describe('Clear Results', () => {
    it('should have "Clear Results" button', () => {
      render(<ApiTester />);

      expect(screen.getByRole('button', { name: /clear results/i })).toBeInTheDocument();
    });

    it('should disable "Clear Results" button when no results exist', () => {
      render(<ApiTester />);

      const clearButton = screen.getByRole('button', { name: /clear results/i });
      expect(clearButton).toBeDisabled();
    });

    it('should enable "Clear Results" button when results exist', async () => {
      const user = userEvent.setup();
      render(<ApiTester />);

      const runButton = screen.getAllByRole('button', { name: /run test/i })[0];
      await user.click(runButton);

      await waitFor(() => {
        const clearButton = screen.getByRole('button', { name: /clear results/i });
        expect(clearButton).not.toBeDisabled();
      });
    });

    it('should remove all test results when clicked', async () => {
      const user = userEvent.setup();
      render(<ApiTester />);

      // Run a test to create results
      const runButton = screen.getAllByRole('button', { name: /run test/i })[0];
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByText(/Test Results/)).toBeInTheDocument();
      });

      // Clear results
      const clearButton = screen.getByRole('button', { name: /clear results/i });
      await user.click(clearButton);

      expect(screen.queryByText(/Test Results/)).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // Result Display Tests
  // =========================================================================

  describe('Result Display', () => {
    it('should display result with response data details', async () => {
      const user = userEvent.setup();
      render(<ApiTester />);

      const runButton = screen.getAllByRole('button', { name: /run test/i })[0];
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('Response Data')).toBeInTheDocument();
      });
    });

    it('should display error message in result when test fails', async () => {
      const user = userEvent.setup();
      (apiService.testHealth as ReturnType<typeof vi.fn>).mockResolvedValue(mockErrorResult);

      render(<ApiTester />);

      const runButton = screen.getAllByRole('button', { name: /run test/i })[0];
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument();
        expect(screen.getByText(/Not Found/)).toBeInTheDocument();
      });
    });

    it('should expand response details when clicked', async () => {
      const user = userEvent.setup();
      render(<ApiTester />);

      const runButton = screen.getAllByRole('button', { name: /run test/i })[0];
      await user.click(runButton);

      await waitFor(() => {
        const details = screen.getByText('Response Data');
        expect(details).toBeInTheDocument();
      });

      const summary = screen.getByText('Response Data');
      await user.click(summary);

      // Response JSON should be visible
      expect(screen.getByText(/"status": "healthy"/)).toBeInTheDocument();
    });

    it('should display multiple test results in order', async () => {
      const user = userEvent.setup();
      const result1 = { ...mockTestResult, endpoint: '/health' };
      const result2 = { ...mockTestResult, endpoint: '/info' };

      (apiService.testHealth as ReturnType<typeof vi.fn>).mockResolvedValue(result1);
      (apiService.testInfo as ReturnType<typeof vi.fn>).mockResolvedValue(result2);

      render(<ApiTester />);

      // Run first test
      const runButtons = screen.getAllByRole('button', { name: /run test/i });
      await user.click(runButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('/health')).toBeInTheDocument();
      });

      // Run second test
      await user.click(runButtons[1]);

      await waitFor(() => {
        expect(screen.getByText('/info')).toBeInTheDocument();
        expect(screen.getByText(/Test Results \(2\)/)).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // Status Icon Tests
  // =========================================================================

  describe('Status Icons', () => {
    it('should display success icon (✓) for successful tests', async () => {
      const user = userEvent.setup();
      render(<ApiTester />);

      const runButton = screen.getAllByRole('button', { name: /run test/i })[0];
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('✓')).toBeInTheDocument();
      });
    });

    it('should display error icon (✗) for failed tests', async () => {
      const user = userEvent.setup();
      (apiService.testHealth as ReturnType<typeof vi.fn>).mockResolvedValue(mockErrorResult);

      render(<ApiTester />);

      const runButton = screen.getAllByRole('button', { name: /run test/i })[0];
      await user.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('✗')).toBeInTheDocument();
      });
    });

    it('should apply success class to successful result', async () => {
      const user = userEvent.setup();
      render(<ApiTester />);

      const runButton = screen.getAllByRole('button', { name: /run test/i })[0];
      await user.click(runButton);

      await waitFor(() => {
        const resultItem = screen.getByText('✓').closest('.result-item');
        expect(resultItem).toHaveClass('status-success');
      });
    });

    it('should apply error class to failed result', async () => {
      const user = userEvent.setup();
      (apiService.testHealth as ReturnType<typeof vi.fn>).mockResolvedValue(mockErrorResult);

      render(<ApiTester />);

      const runButton = screen.getAllByRole('button', { name: /run test/i })[0];
      await user.click(runButton);

      await waitFor(() => {
        const resultItem = screen.getByText('✗').closest('.result-item');
        expect(resultItem).toHaveClass('status-error');
      });
    });
  });

  // =========================================================================
  // Method Badge Tests
  // =========================================================================

  describe('HTTP Method Badges', () => {
    it('should display method badges in results', async () => {
      const user = userEvent.setup();
      render(<ApiTester />);

      const runButton = screen.getAllByRole('button', { name: /run test/i })[0];
      await user.click(runButton);

      await waitFor(() => {
        const badges = screen.getAllByText('GET');
        expect(badges.length).toBeGreaterThan(0);
      });
    });

    it('should display POST method badge for POST requests', async () => {
      const user = userEvent.setup();
      const postResult = { ...mockTestResult, method: 'POST' as const };
      (apiService.testCustomEndpoint as ReturnType<typeof vi.fn>).mockResolvedValue(postResult);

      render(<ApiTester />);

      const methodSelect = screen.getByLabelText('Method:');
      await user.selectOptions(methodSelect, 'POST');

      const runButton = screen.getByRole('button', { name: /run custom test/i });
      await user.click(runButton);

      await waitFor(() => {
        // Use getAllByText since POST appears in dropdown and badge
        const postBadges = screen.getAllByText('POST');
        expect(postBadges.length).toBeGreaterThan(1); // At least dropdown + badge
      });
    });
  });
});
