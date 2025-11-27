/**
 * Template Model
 */
export interface Template {
  id: number;
  name: string;
  created_at: string;
  description: string | null;
  google_drive_id: string;
  google_drive_file_id: string;
  web_view_link: string | null;
}

/**
 * Template Document Model
 */
export interface TemplateDocument {
  id: number;
  name: string;
  created_at: string;
  description: string | null;
  google_drive_id: string;
  google_drive_file_id: string;
  web_view_link: string | null;
}

/**
 * Template Filter Options
 */
export interface TemplateFilter {
  name?: string;
}

/**
 * Sync Templates Response
 */
export interface SyncTemplatesResponse {
  message: string;
  templates: Template[];
}

/**
 * Process Template Model (template assigned to a process)
 */
export interface ProcessTemplate {
  id: number;
  process_id: number;
  template_id: number;
  file_name: string;
  google_drive_file_id: string;
  google_docs_name: string;
  document_url: string;
  template: {
    id: number;
    name: string;
    description: string | null;
  };
}

/**
 * Assign Template to Process Request
 */
export interface AssignTemplateRequest {
  process_id: number;
  template_id: number;
}

