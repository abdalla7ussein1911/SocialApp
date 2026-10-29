import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private readonly HttpClient: HttpClient = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  getAllPosts(): Observable<any> {
    const token = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('userToken')
      : null;

    return this.HttpClient.get(`${environment.baseURL}/posts`, {
      headers: {
        AUTHORIZATION: 'Bearer ' + (token ?? ''),
      },
    });
  }

  toggleLike(postId: string): Observable<any> {
    const token = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('userToken')
      : null;

    return this.HttpClient.put(
      `${environment.baseURL}/posts/${postId}/like`,
      {},
      {
        headers: {
          Authorization: 'Bearer ' + (token ?? ''),
        },
      }
    );
  }

  createPost(data: FormData): Observable<any> {
    const token = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('userToken')
      : null;

    return this.HttpClient.post(
      `${environment.baseURL}/posts`,
      data,
      {
        headers: {
          Authorization: 'Bearer ' + (token ?? ''),
        },
      }
    );
  }

  toggleBookmark(postId: string): Observable<any> {
    const token = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('userToken')
      : null;

    return this.HttpClient.put(
      `${environment.baseURL}/posts/${postId}/bookmark`,
      {},
      {
        headers: {
          Authorization: 'Bearer ' + (token ?? ''),
        },
      }
    );
  }

  deletePost(postId: string): Observable<any> {
    const token = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('userToken')
      : null;

    return this.HttpClient.delete(
      `${environment.baseURL}/posts/${postId}`,
      {
        headers: {
          Authorization: 'Bearer ' + (token ?? ''),
        },
      }
    );
  }

  updatePost(
    postId: string,
    data: { body?: string; privacy?: string }
  ): Observable<any> {
    const token = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('userToken')
      : null;

    return this.HttpClient.put(
      `${environment.baseURL}/posts/${postId}`,
      data,
      {
        headers: {
          Authorization: 'Bearer ' + (token ?? ''),
        },
      }
    );
  }

getSavedPosts(page: number = 1, limit: number = 20): Observable<any> {
  const token = isPlatformBrowser(this.platformId)
    ? localStorage.getItem('userToken')
    : null;

  return this.HttpClient.get(
    `${environment.baseURL}/users/bookmarks?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: 'Bearer ' + (token ?? ''),
      },
    }
  );
}

}
