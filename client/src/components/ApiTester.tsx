import { useState } from 'react';
import apiService, { type TestResult } from '../services/api';
import { useToast } from '../hooks/useToast';
import './ApiTester.css';

interface TestConfig {
  name: string;
  description: string;
  testFn: () => Promise<TestResult>;
}

export default function ApiTester() {
  const toast = useToast();
  const [apiUrl, setApiUrl] = useState(apiService.getBaseUrl());
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [customEndpoint, setCustomEndpoint] = useState('/health');
  const [customMethod, setCustomMethod] = useState('GET');
  const [customBody, setCustomBody] = useState('');

  const predefinedTests: TestConfig[] = [
    {
      name: 'Health Check',
      description: 'Test API health status',
      testFn: () => apiService.testHealth(),
    },
    {
      name: 'API Info',
      description: 'Get API version and information',
      testFn: () => apiService.testInfo(),
    },
    {
      name: 'List Agents',
      description: 'Retrieve all available agents',
      testFn: () => apiService.testListAgents(),
    },
    {
      name: 'Agent Capabilities',
      description: 'Get capabilities of default agent',
      testFn: () => apiService.testAgentCapabilities(),
    },
  ];

  const updateApiUrl = () => {
    apiService.setBaseUrl(apiUrl);
    setTestResults([]);
  };

  const runSingleTest = async (test: TestConfig) => {
    setIsRunning(true);
    try {
      const result = await test.testFn();
      setTestResults((prev) => [...prev, result]);
    } catch (error) {
      console.error('Test error:', error);
      toast.showError('Test execution failed');
    }
    setIsRunning(false);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    for (const test of predefinedTests) {
      const result = await test.testFn();
      setTestResults((prev) => [...prev, result]);
      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    
    setIsRunning(false);
  };

  const runCustomTest = async () => {
    setIsRunning(true);
    try {
      let body = undefined;
      if (customBody && customMethod !== 'GET') {
        try {
          body = JSON.parse(customBody);
        } catch {
          toast.showError('Invalid JSON in request body');
          setIsRunning(false);
          return;
        }
      }
      
      const result = await apiService.testCustomEndpoint(
        customEndpoint,
        customMethod,
        body
      );
      setTestResults((prev) => [...prev, result]);
    } catch (error) {
      console.error('Custom test error:', error);
      toast.showError('Custom test execution failed');
    }
    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'pending':
        return '⏳';
      default:
        return '?';
    }
  };

  const getStatusClass = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'status-success';
      case 'error':
        return 'status-error';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  };

  return (
    <div className="api-tester">
      <header className="header">
        <h1>AI Agent Framework API Tester</h1>
        <p className="subtitle">Test API endpoints without workflows</p>
      </header>

      <div className="config-section">
        <h2>Configuration</h2>
        <div className="input-group">
          <label htmlFor="apiUrl">API Base URL:</label>
          <input
            id="apiUrl"
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="http://localhost:8000/api"
          />
          <button onClick={updateApiUrl} className="btn-secondary">
            Update URL
          </button>
        </div>
      </div>

      <div className="test-section">
        <h2>Predefined Tests</h2>
        <div className="test-grid">
          {predefinedTests.map((test, idx) => (
            <div key={idx} className="test-card">
              <h3>{test.name}</h3>
              <p>{test.description}</p>
              <button
                onClick={() => runSingleTest(test)}
                disabled={isRunning}
                className="btn-primary"
              >
                Run Test
              </button>
            </div>
          ))}
        </div>
        <div className="test-actions">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="btn-primary btn-large"
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </button>
          <button
            onClick={clearResults}
            disabled={isRunning || testResults.length === 0}
            className="btn-secondary"
          >
            Clear Results
          </button>
        </div>
      </div>

      <div className="custom-test-section">
        <h2>Custom Test</h2>
        <div className="custom-test-form">
          <div className="input-group">
            <label htmlFor="customEndpoint">Endpoint:</label>
            <input
              id="customEndpoint"
              type="text"
              value={customEndpoint}
              onChange={(e) => setCustomEndpoint(e.target.value)}
              placeholder="/health"
            />
          </div>
          <div className="input-group">
            <label htmlFor="customMethod">Method:</label>
            <select
              id="customMethod"
              value={customMethod}
              onChange={(e) => setCustomMethod(e.target.value)}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>
          {customMethod !== 'GET' && (
            <div className="input-group">
              <label htmlFor="customBody">Request Body (JSON):</label>
              <textarea
                id="customBody"
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                placeholder='{"key": "value"}'
                rows={4}
              />
            </div>
          )}
          <button
            onClick={runCustomTest}
            disabled={isRunning}
            className="btn-primary"
          >
            Run Custom Test
          </button>
        </div>
      </div>

      {testResults.length > 0 && (
        <div className="results-section">
          <h2>Test Results ({testResults.length})</h2>
          <div className="results-list">
            {testResults.map((result, idx) => (
              <div key={idx} className={`result-item ${getStatusClass(result.status)}`}>
                <div className="result-header">
                  <span className="status-icon">{getStatusIcon(result.status)}</span>
                  <span className="method-badge">{result.method}</span>
                  <span className="endpoint">{result.endpoint}</span>
                  {result.duration !== undefined && (
                    <span className="duration">{result.duration}ms</span>
                  )}
                </div>
                {result.error && (
                  <div className="result-error">
                    <strong>Error:</strong> {result.error}
                  </div>
                )}
                {result.response !== undefined && (
                  <details className="result-details">
                    <summary>Response Data</summary>
                    <pre>{JSON.stringify(result.response, null, 2)}</pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
