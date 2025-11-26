import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@app/core/config/environment.config';
import { Template, TemplateFilter, SyncTemplatesResponse } from '@app/core/models/template/template.model';

@Injectable({
  providedIn: 'root',
})
export class TemplateService {
  private _http = inject(HttpClient);

  /**
   * Get templates with optional name filter
   *
   * @param filters - Filter options
   * @returns Observable with templates array
   */
  getTemplates(filters: TemplateFilter = {}): Observable<Template[]> {
    let params = new HttpParams();

    if (filters.name) {
      params = params.set('name', filters.name);
    }

    const url = `${environment.apiBaseUrl}/templates`;

    return this._http.get<Template[]>(url, { params });
  }

  /**
   * Sync templates from Google Drive
   *
   * @returns Observable with sync response
   */
  syncTemplates(): Observable<SyncTemplatesResponse> {
    const url = `${environment.apiBaseUrl}/templates/sync`;
    return this._http.post<SyncTemplatesResponse>(url, {});
  }
}

