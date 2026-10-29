
import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SuggestedFriendsService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  getSuggestions(): Observable<any> {
    const isBrowser = isPlatformBrowser(this.platformId);

    if (!isBrowser) {
      return new Observable((subscriber) => subscriber.complete());
    }

    const token = localStorage.getItem('userToken');

    return this.http.get(
      `${environment.baseURL}/users/suggestions?limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token ?? ''}`,
        },
      }
    );
  }

  followUser(userId: string): Observable<any> {
    const token = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('userToken')
      : null;

    return this.http.put(
      `${environment.baseURL}/users/${userId}/follow`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token ?? ''}`,
        },
      }
    );
  }

}
