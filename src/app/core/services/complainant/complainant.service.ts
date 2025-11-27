import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@app/core/config/environment.config';
import { Complainant } from '@app/core/models/complainant/complainant.model';

@Injectable({
  providedIn: 'root',
})
export class ComplainantService {
  private _http = inject(HttpClient);

  /**
   * Get all complainants
   *
   * @returns Observable with list of complainants
   */
  getComplainants(): Observable<Complainant[]> {
    const url = `${environment.apiBaseUrl}/complainants`;
    return this._http.get<Complainant[]>(url);
  }
}


