#!/bin/bash
# Script to complete Issue #24 merge and closure

set -e

echo "========================================="
echo "Issue #24 - Merge and Close Workflow"
echo "========================================="
echo ""

# Navigate to client repository
cd /home/sw/work/AI-Agent-Framework/_external/AI-Agent-Framework-Client

echo "✅ Step 1: Verify PR status..."
gh pr view 60 --json number,title,state,mergeable,mergeStateStatus

echo ""
echo "⚠️  MANUAL ACTION REQUIRED:"
echo ""
echo "The PR is blocked by branch protection requiring approval."
echo "Please choose one of these options:"
echo ""
echo "Option A: Approve via GitHub Web UI"
echo "  1. Visit: https://github.com/blecx/AI-Agent-Framework-Client/pull/60"
echo "  2. Click 'Files changed' tab"
echo "  3. Click 'Review changes' button (top right)"
echo "  4. Select 'Approve' and click 'Submit review'"
echo "  5. Return to this terminal and press Enter"
echo ""
echo "Option B: Temporarily disable branch protection"
echo "  1. Visit: https://github.com/blecx/AI-Agent-Framework-Client/settings/branches"
echo "  2. Find 'main' branch protection rule"
echo "  3. Click 'Edit' and uncheck 'Require approvals'"
echo "  4. Save changes"
echo "  5. Return to this terminal and press Enter"
echo "  6. Remember to re-enable protection after merge!"
echo ""

read -p "Press Enter after completing approval (or Ctrl+C to cancel)..."

echo ""
echo "✅ Step 2: Attempting merge..."
gh pr merge 60 --squash --delete-branch \
  --subject "[Issue #24] API Service Layer Infrastructure" \
  --body "Complete implementation with 25/25 tests passing. Includes API client with retry logic, service modules for projects/RAID/workflow/audit/governance/health, comprehensive TypeScript types, and full documentation."

echo ""
echo "✅ Step 3: Getting merge commit SHA..."
git checkout main
git pull origin main
COMMIT_SHA=$(git log -1 --format="%H")
COMMIT_SHA_SHORT=$(git log -1 --format="%h")

echo "Merge commit: $COMMIT_SHA"
echo "Short SHA: $COMMIT_SHA_SHORT"

echo ""
echo "✅ Step 4: Updating closing message with commit SHA..."
sed -i "s/\[PENDING - Add after merge\]/$COMMIT_SHA_SHORT/" issue-24-closing-message.md

echo ""
echo "✅ Step 5: Closing Issue #24..."
gh issue close 24 --comment "$(cat issue-24-closing-message.md)"

echo ""
echo "✅ Step 6: Recording completion..."
echo ""
echo "⚠️  MANUAL ACTION: Please record the actual hours spent:"
echo "cd /home/sw/work/AI-Agent-Framework/_external/AI-Agent-Framework-Client"
echo "./scripts/record-completion.py 24 <HOURS> \"API Service Layer implementation with retry logic, comprehensive types, and full test coverage. Required 4 CI iterations to fix test file, TypeScript errors, and vitest config. All 25 tests passing.\""
echo ""
echo "✅ Step 7: Select next issue..."
echo "cd /home/sw/work/AI-Agent-Framework/_external/AI-Agent-Framework-Client"
echo "./next-issue"
echo ""

echo "========================================="
echo "✅ Issue #24 workflow complete!"
echo "========================================="
echo ""
echo "Summary:"
echo "- PR #60 merged: https://github.com/blecx/AI-Agent-Framework-Client/pull/60"
echo "- Commit SHA: $COMMIT_SHA_SHORT"
echo "- Issue #24 closed with comprehensive message"
echo "- Unblocked: Issues #25, #27, #28, #30, #31"
echo ""
echo "Next: Run './next-issue' to select Issue #25"
