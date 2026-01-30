/**
 * RAID type definitions matching the AI-Agent-Framework backend models.
 *
 * Source of truth: AI-Agent-Framework `apps/api/models.py` (RAIDType/RAIDStatus/RAIDPriority/RAIDImpactLevel/RAIDLikelihood/RAIDItem).
 */

/** RAID item type. */
export const RAIDType = {
  RISK: 'risk',
  ASSUMPTION: 'assumption',
  ISSUE: 'issue',
  DEPENDENCY: 'dependency',
} as const;

export type RAIDType = (typeof RAIDType)[keyof typeof RAIDType];

/** RAID item status. */
export const RAIDStatus = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  MITIGATED: 'mitigated',
  CLOSED: 'closed',
  ACCEPTED: 'accepted',
} as const;

export type RAIDStatus = (typeof RAIDStatus)[keyof typeof RAIDStatus];

/** RAID item priority/severity. */
export const RAIDPriority = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export type RAIDPriority = (typeof RAIDPriority)[keyof typeof RAIDPriority];

/** Impact level (primarily for risks). */
export const RAIDImpactLevel = {
  VERY_HIGH: 'very_high',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  VERY_LOW: 'very_low',
} as const;

export type RAIDImpactLevel =
  (typeof RAIDImpactLevel)[keyof typeof RAIDImpactLevel];

/** Likelihood level (primarily for risks). */
export const RAIDLikelihood = {
  VERY_LIKELY: 'very_likely',
  LIKELY: 'likely',
  POSSIBLE: 'possible',
  UNLIKELY: 'unlikely',
  VERY_UNLIKELY: 'very_unlikely',
} as const;

export type RAIDLikelihood =
  (typeof RAIDLikelihood)[keyof typeof RAIDLikelihood];

/**
 * RAID register item.
 *
 * Note: field names use snake_case to match the backend JSON contract.
 */
export interface RAIDItem {
  /** Unique RAID item ID */
  id: string;
  /** RAID item type */
  type: RAIDType;
  /** RAID item title */
  title: string;
  /** Detailed description */
  description: string;
  /** Current status */
  status: RAIDStatus;
  /** Owner/assignee */
  owner: string;
  /** Priority/severity */
  priority: RAIDPriority;
  /** Impact level (primarily for risks) */
  impact: RAIDImpactLevel | null;
  /** Likelihood (primarily for risks) */
  likelihood: RAIDLikelihood | null;
  /** Mitigation or response plan */
  mitigation_plan: string;
  /** Next actions to take */
  next_actions: string[];
  /** Linked governance decision IDs */
  linked_decisions: string[];
  /** Linked change request IDs */
  linked_change_requests: string[];
  /** Creation timestamp (ISO format) */
  created_at: string;
  /** Last update timestamp (ISO format) */
  updated_at: string;
  /** User who created */
  created_by: string;
  /** User who last updated */
  updated_by: string;
  /** Target date for resolution */
  target_resolution_date: string | null;
}

/** Request payload for creating a RAID item. */
export interface RAIDItemCreate {
  type: RAIDType;
  title: string;
  description: string;
  status?: RAIDStatus;
  owner: string;
  priority?: RAIDPriority;
  impact?: RAIDImpactLevel | null;
  likelihood?: RAIDLikelihood | null;
  mitigation_plan?: string;
  next_actions?: string[];
  linked_decisions?: string[];
  linked_change_requests?: string[];
  created_by?: string;
  target_resolution_date?: string | null;
}

/** Request payload for updating a RAID item. */
export interface RAIDItemUpdate {
  title?: string;
  description?: string;
  status?: RAIDStatus;
  owner?: string;
  priority?: RAIDPriority;
  impact?: RAIDImpactLevel | null;
  likelihood?: RAIDLikelihood | null;
  mitigation_plan?: string;
  next_actions?: string[];
  linked_decisions?: string[];
  linked_change_requests?: string[];
  updated_by?: string;
  target_resolution_date?: string | null;
}

/** Response wrapper for listing RAID items. */
export interface RAIDItemList {
  items: RAIDItem[];
  total: number;
  filtered_by?: Record<string, unknown> | null;
}
