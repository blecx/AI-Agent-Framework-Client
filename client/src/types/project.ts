/**
 * Project Domain Types and Validation Schemas
 * Provides type-safe definitions and runtime validation using Zod
 */

import { z } from 'zod';
import { ValidationError } from '../services/errors';

/**
 * Zod Schemas for Runtime Validation
 */

export const GitRepoInfoSchema = z.object({
  url: z.string().url(),
  branch: z.string(),
  lastCommit: z.string().optional(),
  status: z.enum(['clean', 'dirty', 'unknown']).optional(),
});

export const DocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  content: z.string(),
  lastModified: z.string().datetime(),
});

export const ProjectSchema = z.object({
  key: z.string().min(1).max(20).regex(/^[A-Z0-9-]+$/, 'Project key must be uppercase alphanumeric with hyphens'),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  documents: z.array(DocumentSchema).optional(),
  gitRepo: GitRepoInfoSchema.optional(),
});

export const ProjectListSchema = z.array(ProjectSchema);

/**
 * TypeScript Types (Inferred from Zod Schemas)
 */

export type GitRepoInfo = z.infer<typeof GitRepoInfoSchema>;
export type Document = z.infer<typeof DocumentSchema>;
export type Project = z.infer<typeof ProjectSchema>;

/**
 * Request/Response Types
 */

export interface CreateProjectRequest {
  key: string;
  name: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
}

export const CreateProjectRequestSchema = z.object({
  key: ProjectSchema.shape.key,
  name: ProjectSchema.shape.name,
  description: ProjectSchema.shape.description,
});

export const UpdateProjectRequestSchema = z.object({
  name: ProjectSchema.shape.name.optional(),
  description: ProjectSchema.shape.description.optional(),
});

/**
 * Validation Helper Functions
 */

export function validateProject(data: unknown): Project {
  try {
    return ProjectSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Project validation failed', error.issues);
    }
    throw error;
  }
}

export function validateProjectList(data: unknown): Project[] {
  try {
    return ProjectListSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Project list validation failed', error.issues);
    }
    throw error;
  }
}

export function validateCreateProjectRequest(data: unknown): CreateProjectRequest {
  try {
    return CreateProjectRequestSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Create project request validation failed', error.issues);
    }
    throw error;
  }
}

export function validateUpdateProjectRequest(data: unknown): UpdateProjectRequest {
  try {
    return UpdateProjectRequestSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Update project request validation failed', error.issues);
    }
    throw error;
  }
}
