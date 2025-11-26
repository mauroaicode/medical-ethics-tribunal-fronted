/**
 * Process Status Types (keys used for filtering)
 */
export type ProcessStatus = 'borrador' | 'in_progress' | 'closed';

/**
 * Process Status Mapping (translated text to key)
 */
export const PROCESS_STATUS_MAP: Record<string, ProcessStatus> = {
  'Borrador': 'borrador',
  'En Curso': 'in_progress',
  'Cerrado': 'closed',
};

/**
 * Process Status Reverse Mapping (key to translated text)
 */
export const PROCESS_STATUS_REVERSE_MAP: Record<ProcessStatus, string> = {
  'borrador': 'Borrador',
  'in_progress': 'En Curso',
  'closed': 'Cerrado',
};

/**
 * Process Model
 */
export interface Process {
  id: number;
  name: string;
  process_number: string;
  status: string;
  start_date?: string;
  proceedings_count?: number;
  complainant_name?: string;
  complainant_last_name?: string;
  complainant_document_number?: string;
  doctor_name?: string;
  doctor_last_name?: string;
  display_number: number;
}

/**
 * Process Filter Options
 */
export interface ProcessFilter {
  process_number?: string;
  complainant_document_number?: string;
  doctor_name?: string;
  doctor_id?: number;
  start_date?: string;
  start_date_from?: string;
  start_date_to?: string;
  status?: ProcessStatus;
  page?: number;
  per_page?: number;
}

/**
 * Laravel Pagination Link
 */
export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

/**
 * Process Response from API (Laravel Pagination)
 */
export interface ProcessResponse {
  current_page: number;
  data: Process[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

/**
 * Process Response Meta (simplified for component usage)
 */
export interface ProcessResponseMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

/**
 * Create Process Request
 */
export interface CreateProcessRequest {
  complainant_id: number;
  doctor_id: number;
  magistrate_instructor_id: number;
  magistrate_ponente_id: number;
  name: string;
  start_date: string;
  description: string;
}

