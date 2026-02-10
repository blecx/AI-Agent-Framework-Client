/**
 * API Type Definitions
 * TypeScript interfaces matching the FastAPI backend models
 */

import { z } from 'zod';

// ==================== Project Types ====================

export interface ProjectCreate {
  key: string;
  name: string;
  description?: string;
}

export interface ProjectInfo {
  key: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  state?: string;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
}

export interface ProjectState {
  project_key: string;
  current_state: string;
  history: Array<{
    state: string;
    timestamp: string;
    note?: string;
  }>;
}

// ==================== Project Zod Schemas ====================

export const ProjectCreateSchema = z.object({
  key: z.string().min(1, 'Project key is required'),
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
});

export const ProjectInfoSchema = z.object({
  key: z.string(),
  name: z.string(),
  description: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  state: z.string().optional(),
});

export const ProjectUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

const StateHistoryItemSchema = z.object({
  state: z.string(),
  timestamp: z.string(),
  note: z.string().optional(),
});

export const ProjectStateSchema = z.object({
  project_key: z.string(),
  current_state: z.string(),
  history: z.array(StateHistoryItemSchema),
});

// ==================== RAID Types ====================

export enum RAIDType {
  RISK = 'Risk',
  ASSUMPTION = 'Assumption',
  ISSUE = 'Issue',
  DEPENDENCY = 'Dependency',
}

export enum RAIDStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  CLOSED = 'Closed',
  RESOLVED = 'Resolved',
  MONITORED = 'Monitored',
}

export enum RAIDPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

export enum RAIDImpactLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  VERY_HIGH = 'Very High',
}

export enum RAIDLikelihood {
  RARE = 'Rare',
  UNLIKELY = 'Unlikely',
  POSSIBLE = 'Possible',
  LIKELY = 'Likely',
  ALMOST_CERTAIN = 'Almost Certain',
}

export interface RAIDItem {
  id: string;
  project_key: string;
  type: RAIDType;
  title: string;
  description: string;
  status: RAIDStatus;
  priority: RAIDPriority;
  owner?: string;
  due_date?: string;
  impact?: RAIDImpactLevel;
  likelihood?: RAIDLikelihood;
  mitigation?: string;
  created_at: string;
  updated_at: string;
}

export interface RAIDItemCreate {
  type: RAIDType;
  title: string;
  description: string;
  status?: RAIDStatus;
  priority?: RAIDPriority;
  owner?: string;
  due_date?: string;
  impact?: RAIDImpactLevel;
  likelihood?: RAIDLikelihood;
  mitigation?: string;
}

export interface RAIDItemUpdate {
  title?: string;
  description?: string;
  status?: RAIDStatus;
  priority?: RAIDPriority;
  owner?: string;
  due_date?: string;
  impact?: RAIDImpactLevel;
  likelihood?: RAIDLikelihood;
  mitigation?: string;
}

export interface RAIDItemList {
  items: RAIDItem[];
  total: number;
}

// ==================== Workflow Types ====================

export enum WorkflowStateEnum {
  INITIATING = 'Initiating',
  PLANNING = 'Planning',
  EXECUTING = 'Executing',
  MONITORING = 'Monitoring',
  CLOSING = 'Closing',
  CLOSED = 'Closed',
}

export interface WorkflowState {
  project_key: string;
  current_state: WorkflowStateEnum;
  allowed_transitions: WorkflowStateEnum[];
  updated_at: string;
}

export interface WorkflowTransitionRequest {
  new_state: WorkflowStateEnum;
  note?: string;
}

export interface WorkflowTransitionResponse {
  project_key: string;
  previous_state: WorkflowStateEnum;
  current_state: WorkflowStateEnum;
  note?: string;
  transitioned_at: string;
}

export interface AllowedTransitions {
  project_key: string;
  current_state: WorkflowStateEnum;
  allowed_transitions: WorkflowStateEnum[];
}

// ==================== Audit Event Types ====================

export interface AuditEvent {
  event_id: string;
  timestamp: string;
  event_type: string;
  actor: string;
  project_key: string;
  correlation_id?: string;
  payload_summary: string;
}

export interface AuditEventQuery {
  event_type?: string;
  actor?: string;
  since?: string;
  until?: string;
  limit?: number;
  offset?: number;
}

export interface AuditEventList {
  events: AuditEvent[];
  total: number;
}

// ==================== Governance Types ====================

export interface GovernanceMetadata {
  project_key: string;
  sponsor?: string;
  project_manager?: string;
  budget?: number;
  currency?: string;
  target_completion?: string;
  business_case?: string;
  created_at: string;
  updated_at: string;
}

export interface GovernanceMetadataCreate {
  sponsor?: string;
  project_manager?: string;
  budget?: number;
  currency?: string;
  target_completion?: string;
  business_case?: string;
}

export interface GovernanceMetadataUpdate {
  sponsor?: string;
  project_manager?: string;
  budget?: number;
  currency?: string;
  target_completion?: string;
  business_case?: string;
}

// ==================== Decision Types ====================

export interface Decision {
  id: string;
  project_key: string;
  title: string;
  description: string;
  decision_date: string;
  decision_makers: string[];
  rationale?: string;
  impacts?: string;
  created_at: string;
  updated_at: string;
}

export interface DecisionCreate {
  title: string;
  description: string;
  decision_date: string;
  decision_makers: string[];
  rationale?: string;
  impacts?: string;
}

export interface DecisionUpdate {
  title?: string;
  description?: string;
  decision_date?: string;
  decision_makers?: string[];
  rationale?: string;
  impacts?: string;
}

export interface DecisionList {
  decisions: Decision[];
  total: number;
}

// ==================== Error Types ====================

export interface ApiError {
  detail: string;
  status?: number;
  timestamp?: string;
}

export interface ValidationError {
  loc: string[];
  msg: string;
  type: string;
}

// ==================== Audit Types ====================

export enum AuditSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export interface AuditIssue {
  rule: string;
  severity: AuditSeverity;
  message: string;
  artifact: string;
  item_id?: string;
  field?: string;
}

export interface AuditResult {
  issues: AuditIssue[];
  completeness_score: number;
  rule_violations: Record<string, number>;
  total_issues: number;
  timestamp?: string;
}

// ==================== Common Response Types ====================

export interface HealthResponse {
  status: string;
  docs_path?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  status: number;
}
