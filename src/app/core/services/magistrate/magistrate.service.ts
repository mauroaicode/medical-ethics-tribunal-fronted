import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@app/core/config/environment.config';
import { Magistrate } from '@app/core/models/magistrate/magistrate.model';

@Injectable({
  providedIn: 'root',
})
export class MagistrateService {
  private _http = inject(HttpClient);

  /**
   * Get all magistrates
   *
   * @returns Observable with list of magistrates
   */
  getMagistrates(): Observable<Magistrate[]> {
    const url = `${environment.apiBaseUrl}/magistrates`;
    return this._http.get<Magistrate[]>(url);
  }
}

