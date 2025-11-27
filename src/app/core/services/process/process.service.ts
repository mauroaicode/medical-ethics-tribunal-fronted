import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '@app/core/config/environment.config';
import {ProcessFilter, ProcessResponse, CreateProcessRequest, Process, ProcessDetail} from '@app/core/models/process/process.model';

@Injectable({
  providedIn: 'root',
})
export class ProcessService {
  private _http = inject(HttpClient);

  /**
   * Get processes with filters and pagination
   *
   * @param filters - Filter options
   * @returns Observable with processes response
   */
  getProcesses(filters: ProcessFilter = {}): Observable<ProcessResponse> {
    let params = new HttpParams();

    if (filters.page) {
      params = params.set('page', filters.page.toString());
    }
    if (filters.per_page) {
      params = params.set('per_page', filters.per_page.toString());
    }

    if (filters.process_number) {
      params = params.set('process_number', filters.process_number);
    }
    if (filters.complainant_document_number) {
      params = params.set('complainant_document_number', filters.complainant_document_number);
    }
    if (filters.doctor_name) {
      params = params.set('doctor_name', filters.doctor_name);
    }
    if (filters.start_date_from) {
      params = params.set('start_date_from', filters.start_date_from);
    }
    if (filters.start_date_to) {
      params = params.set('start_date_to', filters.start_date_to);
    }
    // Keep backward compatibility with start_date
    if (filters.start_date && !filters.start_date_from && !filters.start_date_to) {
      params = params.set('start_date', filters.start_date);
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }

    const url = `${environment.apiBaseUrl}/processes`;

    return this._http.get<ProcessResponse>(url, { params }).pipe(
      map((response) => {
        const baseNumber = response.from ?? (response.current_page - 1) * response.per_page + 1;
        const mappedProcesses = response.data.map((process, index) => {
          const displayNumber = baseNumber + index;
          const mappedProcess = {
            ...process,
            display_number: displayNumber,
          };
          // Log if slug is missing
          if (!mappedProcess.slug) {
            console.warn('Process missing slug:', mappedProcess);
          }
          return mappedProcess;
        });

        return {
          ...response,
          data: mappedProcesses,
        };
      })
    );
  }

  /**
   * Create a new process
   *
   * @param processData - Process data to create
   * @returns Observable with created process
   */
  createProcess(processData: CreateProcessRequest): Observable<Process> {
    const url = `${environment.apiBaseUrl}/processes`;
    return this._http.post<Process>(url, processData);
  }

  /**
   * Get process detail by slug
   *
   * @param slug - Process slug
   * @returns Observable with process detail
   */
  getProcessBySlug(slug: string): Observable<ProcessDetail> {
    const url = `${environment.apiBaseUrl}/processes/${slug}`;
    return this._http.get<ProcessDetail>(url);
  }
}

