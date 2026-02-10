/**
 * Unit tests for ProposalApiClient
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  ProposalApiClient,
  type Proposal,
  type ProposalCreate,
} from '../../../services/ProposalApiClient';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

type MockAxiosInstance = {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

describe('ProposalApiClient', () => {
  let client: ProposalApiClient;
  let mockAxiosInstance: MockAxiosInstance;

  const mockProposal: Proposal = {
    id: 'prop-001',
    project_key: 'PROJ-001',
    target_artifact: 'artifacts/pmp.md',
    change_type: 'update',
    diff: '--- a/pmp.md\n+++ b/pmp.md\n@@ -1 +1 @@\n-Old\n+New',
    rationale: 'Updated requirements',
    status: 'pending',
    author: 'user@example.com',
    created_at: '2026-02-10T10:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>);
    client = new ProposalApiClient('http://localhost:8000');
  });

  // =========================================================================
  // createProposal Tests
  // =========================================================================

  describe('createProposal', () => {
    it('should create proposal successfully', async () => {
      const proposalCreate: ProposalCreate = {
        id: 'prop-001',
        target_artifact: 'artifacts/pmp.md',
        change_type: 'update',
        diff: '--- a/pmp.md\n+++ b/pmp.md\n@@ -1 +1 @@\n-Old\n+New',
        rationale: 'Updated requirements',
        author: 'user@example.com',
      };

      mockAxiosInstance.post.mockResolvedValue({ data: mockProposal });

      const result = await client.createProposal('PROJ-001', proposalCreate);

      expect(result).toEqual(mockProposal);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/v1/projects/PROJ-001/proposals',
        proposalCreate
      );
    });

    it('should create proposal without author (defaults to system)', async () => {
      const proposalCreate: ProposalCreate = {
        id: 'prop-002',
        target_artifact: 'artifacts/raid.md',
        change_type: 'create',
        diff: '+New content',
        rationale: 'Initial creation',
      };

      const createdProposal = { ...mockProposal, author: 'system' };
      mockAxiosInstance.post.mockResolvedValue({ data: createdProposal });

      const result = await client.createProposal('PROJ-001', proposalCreate);

      expect(result.author).toBe('system');
    });

    it('should handle 400 validation error', async () => {
      const error = new Error('Invalid proposal data');
      (error as unknown as { response: { status: number; data: { detail: string } } }).response = { status: 400, data: { detail: 'Missing required fields' } };
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(
        client.createProposal('PROJ-001', {} as ProposalCreate)
      ).rejects.toThrow();
    });

    it('should handle duplicate proposal ID error', async () => {
      const error = new Error('Proposal ID already exists');
      (error as unknown as { response: { status: number } }).response = { status: 409 };
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(
        client.createProposal('PROJ-001', {
          id: 'prop-001',
          target_artifact: 'test.md',
          change_type: 'update',
          diff: 'diff',
          rationale: 'test',
        })
      ).rejects.toThrow();
    });
  });

  //=========================================================================
  // listProposals Tests
  // =========================================================================

  describe('listProposals', () => {
    it('should list all proposals without filters', async () => {
      const proposals = [mockProposal, { ...mockProposal, id: 'prop-002' }];
      mockAxiosInstance.get.mockResolvedValue({ data: proposals });

      const result = await client.listProposals('PROJ-001');

      expect(result).toEqual(proposals);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/api/v1/projects/PROJ-001/proposals',
        { params: {} }
      );
    });

    it('should list proposals with status filter', async () => {
      const pendingProposals = [mockProposal];
      mockAxiosInstance.get.mockResolvedValue({ data: pendingProposals });

      const result = await client.listProposals('PROJ-001', 'pending');

      expect(result).toEqual(pendingProposals);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/api/v1/projects/PROJ-001/proposals',
        { params: { status_filter: 'pending' } }
      );
    });

    it('should list proposals with change type filter', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [mockProposal] });

      await client.listProposals('PROJ-001', undefined, 'update');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/api/v1/projects/PROJ-001/proposals',
        { params: { change_type: 'update' } }
      );
    });

    it('should list proposals with both filters', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [mockProposal] });

      await client.listProposals('PROJ-001', 'pending', 'update');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/api/v1/projects/PROJ-001/proposals',
        { params: { status_filter: 'pending', change_type: 'update' } }
      );
    });

    it('should return empty array when no proposals exist', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      const result = await client.listProposals('PROJ-EMPTY');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  // =========================================================================
  // getProposal Tests
  // =========================================================================

  describe('getProposal', () => {
    it('should get proposal by ID successfully', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockProposal });

      const result = await client.getProposal('PROJ-001', 'prop-001');

      expect(result).toEqual(mockProposal);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/api/v1/projects/PROJ-001/proposals/prop-001'
      );
    });

    it('should handle 404 proposal not found', async () => {
      const error = new Error('Proposal not found');
      (error as unknown as { response: { status: number } }).response = { status: 404 };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(client.getProposal('PROJ-001', 'invalid-id')).rejects.toThrow();
    });
  });

  // =========================================================================
  // applyProposal Tests
  // =========================================================================

  describe('applyProposal', () => {
    it('should apply proposal successfully', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: {} });

      await client.applyProposal('PROJ-001', 'prop-001');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/v1/projects/PROJ-001/proposals/prop-001/apply'
      );
    });

    it('should handle already applied proposal error', async () => {
      const error = new Error('Proposal already applied');
      (error as unknown as { response: { status: number } }).response = { status: 409 };
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(client.applyProposal('PROJ-001', 'prop-001')).rejects.toThrow();
    });

    it('should handle missing proposal error', async () => {
      const error = new Error('Proposal not found');
      (error as unknown as { response: { status: number } }).response = { status: 404 };
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(client.applyProposal('PROJ-001', 'invalid')).rejects.toThrow();
    });
  });

  // =========================================================================
  // rejectProposal Tests
  // =========================================================================

  describe('rejectProposal', () => {
    it('should reject proposal successfully with reason', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: {} });

      await client.rejectProposal('PROJ-001', 'prop-001', 'Not needed');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/v1/projects/PROJ-001/proposals/prop-001/reject',
        { reason: 'Not needed' }
      );
    });

    it('should reject proposal without reason', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: {} });

      await client.rejectProposal('PROJ-001', 'prop-001');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/v1/projects/PROJ-001/proposals/prop-001/reject',
        { reason: undefined }
      );
    });

    it('should handle already rejected proposal error', async () => {
      const error = new Error('Proposal already rejected');
      (error as unknown as { response: { status: number } }).response = { status: 409 };
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(
        client.rejectProposal('PROJ-001', 'prop-001', 'Duplicate action')
      ).rejects.toThrow();
    });
  });
});
