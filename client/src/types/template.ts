/**
 * Template type definitions
 */

export interface Template {
  id: string;
  name: string;
  description: string;
  schema: JSONSchema;
  markdown_template: string;
  artifact_type: 'pmp' | 'raid' | 'blueprint' | 'proposal' | 'report';
  version: string;
}

export interface JSONSchema {
  type: string;
  properties: Record<string, JSONSchemaProperty>;
  required?: string[];
  [key: string]: unknown;
}

export interface JSONSchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  title?: string;
  description?: string;
  enum?: string[];
  format?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  [key: string]: unknown;
}

export interface TemplateCreate {
  name: string;
  description: string;
  schema: JSONSchema;
  markdown_template: string;
  artifact_type: string;
  version?: string;
}

export interface TemplateUpdate {
  name?: string;
  description?: string;
  schema?: JSONSchema;
  markdown_template?: string;
  version?: string;
}
