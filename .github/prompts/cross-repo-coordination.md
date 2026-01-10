# Cross-Repo Coordination Prompt Template

Use this prompt when coordinating changes between the client and backend API repos.

---

## Prompt

I need to coordinate changes between AI-Agent-Framework-Client and AI-Agent-Framework (backend API). Help me plan the coordination:

**Change Type**: [Select one]
- [ ] New Feature (requires new API endpoint)
- [ ] API Contract Change (modifying existing endpoint)
- [ ] Bug Fix (may affect both repos)
- [ ] Deprecation (removing API feature)

**Repos Affected**:
- [x] `blecx/AI-Agent-Framework-Client` (this repo)
- [x] `blecx/AI-Agent-Framework` (backend API)

## Backend API Changes Needed

**Endpoint(s)**: [List endpoints to add/modify/remove]
- [ ] `GET /api/[endpoint-path]` - [Description]
- [ ] `POST /api/[endpoint-path]` - [Description]
- [ ] `PUT /api/[endpoint-path]` - [Description]
- [ ] `DELETE /api/[endpoint-path]` - [Description]

**Request Format** (if adding/changing):
```json
{
  "field1": "type and description",
  "field2": "type and description"
}
```

**Response Format** (if adding/changing):
```json
{
  "field1": "type and description",
  "field2": "type and description"
}
```

**Error Handling**:
- Status codes: [List expected status codes: 200, 400, 404, 500, etc.]
- Error response format: [Describe error response structure]

## Client Changes Needed

**Files to Update**:
- `client/src/services/api.ts` - [Add/modify API method]
- `client/src/services/apiClient.ts` - [If base config changes]
- `client/src/components/[Component].tsx` - [Update UI to use new API]

**TypeScript Types**:
```typescript
// Add/modify types in api.ts
interface NewRequestType {
  // Define structure
}

interface NewResponseType {
  // Define structure
}
```

## Coordination Strategy

**Approach**: [Select one]

### Option A: Sequential (Preferred)
**Timeline:**
1. **Week 1**: Create backend issue in `blecx/AI-Agent-Framework`
   - Issue title: [Title]
   - Issue link: [To be created]
2. **Week 1-2**: Implement and merge backend PR
   - PR link: [To be created]
3. **Week 2**: Create client issue (this repo)
   - Issue title: [Title]
   - References backend issue/PR
4. **Week 2-3**: Implement and merge client PR
   - PR link: [To be created]

**Benefits**: No compatibility concerns, clean implementation

### Option B: Compatible Changes (Alternative)
**Timeline:**
1. **Week 1**: Create issues in both repos
   - Backend issue: [Link]
   - Client issue: [Link]
2. **Week 1-2**: Implement backend with backward compatibility
   - Old endpoint still works OR
   - New endpoint available alongside old endpoint
3. **Week 1-2**: Implement client with feature detection/fallback
   - Try new API, fall back to old if unavailable
4. **Week 2**: Merge both PRs
5. **Week 3**: Deprecate old API in future release

**Benefits**: Faster delivery, but more complex implementation

### Option C: Feature Flag (Advanced)
**Timeline:**
1. Deploy backend with new feature behind flag
2. Deploy client with feature detection
3. Enable feature flag when both deployed
4. Monitor and rollback if needed

**Benefits**: Safe rollout, easy rollback

## Compatibility Matrix

| Client Version | Backend Version | Compatible? | Notes |
|----------------|-----------------|-------------|-------|
| Current (v0.x) | Current (v0.x)  | ✅ Yes      | No changes |
| New (v0.x+1)   | Current (v0.x)  | [Yes/No]    | [Explain compatibility] |
| Current (v0.x) | New (v0.x+1)    | [Yes/No]    | [Explain compatibility] |
| New (v0.x+1)   | New (v0.x+1)    | ✅ Yes      | Both upgraded |

## Testing Plan

**Backend Testing**:
- [ ] Unit tests for new endpoints
- [ ] API docs updated (`http://localhost:8000/docs`)
- [ ] Tested with curl/Postman: [List test commands]

**Client Testing**:
- [ ] Test with old backend API (if backward compatible)
- [ ] Test with new backend API
- [ ] Error handling works if API unavailable
- [ ] Manual browser testing completed

**Integration Testing**:
- [ ] Full stack smoke test: `docker-compose.production.yml up -d`
- [ ] Verify all features work end-to-end
- [ ] Test error scenarios (API down, invalid responses)

## Communication Plan

**Backend Team**:
- [ ] Issue created in `blecx/AI-Agent-Framework`: [Link]
- [ ] Requirements documented clearly
- [ ] Timeline agreed upon
- [ ] Notify when backend PR is merged

**Documentation Updates**:
- [ ] Update API integration docs if needed
- [ ] Update QUICKSTART.md if setup changes
- [ ] Update docs/DEVELOPMENT.md if dev workflow changes

## Rollback Plan

**If issues arise after deployment**:
1. Client rollback: [Describe steps]
2. Backend rollback: [Describe steps]
3. Data migration rollback (if applicable): [Describe steps]

---

## Usage Instructions

1. Copy the prompt section above
2. Fill in the specific API changes needed
3. Choose coordination strategy (A, B, or C)
4. Create issues in appropriate order
5. Update the coordination plan as PRs are created/merged
6. Keep both issues linked with references
7. Test integration thoroughly before merging
