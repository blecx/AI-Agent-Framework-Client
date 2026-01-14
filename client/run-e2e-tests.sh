#!/bin/bash
# Run E2E tests locally with automatic backend setup
# Usage: ./run-e2e-tests.sh [playwright args...]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLIENT_DIR="$SCRIPT_DIR"

echo "=== AI-Agent-Framework Client E2E Test Runner ==="
echo ""

# Change to client directory
cd "$CLIENT_DIR"

# Step 1: Check if dependencies are installed
if [ ! -d "node_modules" ] || [ ! -d "node_modules/@playwright" ]; then
  echo "📦 Installing dependencies..."
  npm ci
  echo ""
fi

# Step 2: Check if Playwright browsers are installed
if ! npx playwright --version > /dev/null 2>&1; then
  echo "🌐 Installing Playwright browsers..."
  npx playwright install --with-deps chromium
  echo ""
fi

# Step 3: Setup backend
echo "🔧 Setting up backend API..."
if ! ./e2e/setup-backend.sh; then
  echo ""
  echo "❌ Failed to setup backend. Please start it manually:"
  echo "   cd ../AI-Agent-Framework && docker compose up -d"
  echo "   OR"
  echo "   cd ../AI-Agent-Framework && source venv/bin/activate && uvicorn main:app --reload"
  exit 1
fi
echo ""

# Step 4: Run E2E tests
echo "🧪 Running E2E tests..."
echo ""

# Pass any additional arguments to Playwright
if [ $# -eq 0 ]; then
  # No arguments - run all tests
  npx playwright test
else
  # Pass arguments through
  npx playwright test "$@"
fi

TEST_EXIT_CODE=$?

echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo "✅ All E2E tests passed!"
else
  echo "❌ Some E2E tests failed. See output above for details."
  echo ""
  echo "View detailed report:"
  echo "   npx playwright show-report"
fi

exit $TEST_EXIT_CODE
