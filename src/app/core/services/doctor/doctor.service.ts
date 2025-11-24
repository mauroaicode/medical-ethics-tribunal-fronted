import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@app/core/config/environment.config';
import { Doctor } from '@app/core/models/doctor/doctor.model';

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  private _http = inject(HttpClient);

  /**
   * Get active doctors
   *
   * @returns Observable with list of active doctors
   */
  getActiveDoctors(): Observable<Doctor[]> {
    const url = `${environment.apiBaseUrl}/doctors/active`;
    return this._http.get<Doctor[]>(url);
  }
}

