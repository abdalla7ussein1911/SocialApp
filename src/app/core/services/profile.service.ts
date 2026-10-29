import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private getHeaders(): HttpHeaders {
    const token = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('userToken')
      : null;

    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }


  getMyProfile(): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return new Observable((subscriber) => {
        subscriber.complete();
      });
    }

    const token = localStorage.getItem('userToken');

    if (!token) {
      return throwError(
        () => new Error('Authentication token not found. Please log in again.')
      );
    }

    return this.http.get(
      `${environment.baseURL}/users/profile-data`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  getUserProfile(userId: string): Observable<any> {
    return this.http.get(
      `${environment.baseURL}/users/${userId}/profile`,
      { headers: this.getHeaders() }
    );
  }

  uploadProfilePhoto(data: FormData): Observable<any> {
    return this.http.put(
      `${environment.baseURL}/users/upload-photo`,
      data,
      { headers: this.getHeaders() }
    );
  }
}
