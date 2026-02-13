# RAID Test Files Status

## Summary
RAIDList.test.tsx and RAIDDetail.test.tsx are **Work In Progress** and require significant updates to match the actual component implementations.

## Current Status (as of 2026-02-13 21:51 UTC)

### ✅ ApplyPanel.test.tsx
- **Status:** ✅ PASSING (29/29 tests)
- **Committed:** Yes (commit e60b8b3)

### ⚠️ RAIDDetail.test.tsx  
- **Status:** ⚠️ IMPROVED (5/48 tests passing, 89.6% failure rate)
- **Committed:** No (in progress)
- **Fixed:**
  - ✅ Import statements (default→named export)
  - ✅ Mock paths (./RAIDBadge→./raid/RAIDBadge)
  - ✅ Toast mock (useToast→showToast)
  - ✅ isOpen props removed (all 48 occurrences)
  - ✅ Mock data field names (camelCase→snake_case)
  - ✅ Mock data enum values (UPPERCASE→lowercase)
  - ✅ Added all required fields (mitigation_plan, linked_*, created_by, updated_by)
- **Remaining Issues (~40 failing tests):**
  - Test selectors don't match DOM (looking for data-testid that don't exist)
  - Need to use className-based selectors or add data-testid to component

### ⚠️ RAIDList.test.tsx
- **Status:** ⚠️ IMPROVED (6/28 tests passing, 78.6% failure rate - was 85.7%)
- **Committed:** No (in progress)
- **Fixed:**
  - ✅ Mock data field names (camelCase→snake_case)
  - ✅ Mock data enum values (UPPERCASE→lowercase)
  - ✅ Added all required fields
  - ✅ API response structure (array→{items, total})
  - ✅ Loading state assertion (text→skeleton check)
  - ✅ Empty state text (updated to match EmptyState component)
  - ✅ Fixed undefined→null for target_resolution_date
- **Remaining Issues (~22 failing tests):**
  - Test selectors looking for data-testid that don't exist
  - Need className-based selectors or add data-testid to  component

## Required Fixes

### RAIDDetail.test.tsx Priority Fixes

**1. Fix mock data structure** (HIGH PRIORITY)
```typescript
// Current (WRONG):
const mockRiskItem = {
  type: 'RISK',           // Should be: 'risk'
  status: 'OPEN',         // Should be: 'open'
  priority: 'HIGH',       // Should be: 'high'
  nextActions: [...],     // Should be: next_actions
  targetResolutionDate,   // Should be: target_resolution_date
  createdAt,              // Should be: created_at
  updatedAt,              // Should be: updated_at
};

// Correct structure:
const mockRiskItem: RAIDItem = {
  type: 'risk',
  status: 'open',
  priority: 'high',
  next_actions: ['...'],
  target_resolution_date: '2026-03-01',
  created_at: '2026-02-01T10:00:00Z',
  updated_at: '2026-02-01T10:00:00Z',
  // ... missing required fields: mitigation_plan, linked_decisions, 
  // linked_change_requests, created_by, updated_by
};
```

**2. Remove `isOpen` prop** (~50 occurrences)
```typescript
// Current (WRONG):
<RAIDDetail item={mockItem} projectKey="TEST-123" isOpen={true} onClose={vi.fn()} />

// Correct:
<RAIDDetail item={mockItem} projectKey="TEST-123" onClose={vi.fn()} />
```

**3. Fix test selectors**
```typescript
// Current (WRONG):
screen.getByTestId('modal-overlay')

// Correct:
screen.getByClassName('raid-detail-overlay')
```

### RAIDList.test.tsx Priority Fixes

**1. Fix loading state assertion**
```typescript
// Current (WRONG):
expect(screen.getByText('Loading RAID items...')).toBeInTheDocument();

// Correct:
const skeletonRows = screen.getAllByRole('row').filter(
  row => row.getAttribute('aria-busy') === 'true'
);
expect(skeletonRows.length).toBeGreaterThan(0);
```

**2. Fix empty state assertion**
```typescript
// Current (WRONG):
expect(screen.getByText(/No RAID items yet. Create your first/i))

// Correct:
expect(screen.getByText(/No RAID items yet/i)).toBeInTheDocument();
expect(screen.getByText(/Track Risks, Assumptions, Issues, and Dependencies/i))
```

**3. Fix mock data structure** (same as RAIDDetail)

**4. Fix API response structure**
```typescript
// Current (possibly WRONG):
apiClient.listRAIDItems.mockResolvedValue({
  success: true,
  data: [mockRiskItem],  // Array directly
});

// Check if should be:
apiClient.listRAIDItems.mockResolvedValue({
  success: true,
  data: {
    items: [mockRiskItem],  // RAIDItemList structure
    total: 1,
  },
});
```

## Estimated Effort

- **RAIDDetail.test.tsx:** 2-3 hours
  - Update all mock data: 1 hour
  - Remove isOpen props: 30 min
  - Fix selectors and assertions: 1-1.5 hours

- **RAIDList.test.tsx:** 1.5-2 hours
  - Update mock data: 30 min
  - Fix loading/empty state assertions: 30 min
  - Fix remaining assertions: 30-60 min

**Total:** 3.5-5 hours of focused work

## Recommendations

1. **Option A (Quick Win):** Remove/comment out failing tests, keep only the 9 passing tests
2. **Option B (Full Fix):** Allocate time to properly fix all test data and assertions
3. **Option C (Fresh Start):** Rewrite tests from scratch using the actual components as reference

## Next Steps

1. Decide on approach (A, B, or C)
2. If Option B or C: Create separate issue for test fixes (Issue #147 Phase 2c)
3. Update this document when tests are fixed
4. Run full test suite to verify

## Related

- Issue #147: Testing Initiative (Phase 2b/3)
- PR #149: ApiTester and DiffViewer tests (PASSED)
- Commit e60b8b3: ApplyPanel tests (PASSED)
