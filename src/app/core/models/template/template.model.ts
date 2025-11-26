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

