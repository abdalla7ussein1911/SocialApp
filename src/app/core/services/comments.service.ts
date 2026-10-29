
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  private readonly httpClient = inject(HttpClient);

  private readonly commentsCache = new Map<
    string,
    Observable<any>
  >();

  private getHeaders() {
    return {
      authorization:
        'Bearer ' +
        (typeof localStorage !== 'undefined'
          ? localStorage.getItem('userToken') ?? ''
          : ''),
    };
  }

  getPostComments(
    postId: string,
    limit: number = 10
  ): Observable<any> {
    const cacheKey = `${postId}-${limit}`;
    const cachedRequest = this.commentsCache.get(cacheKey);

    if (cachedRequest) {
      return cachedRequest;
    }

    const request = this.httpClient
      .get(
        `${environment.baseURL}/posts/${postId}/comments?page=1&limit=${limit}`,
        { headers: this.getHeaders() }
      )
      .pipe(shareReplay(1));

    this.commentsCache.set(cacheKey, request);

    return request;
  }

  addComment(postId: string, content: string): Observable<any> {
    return this.httpClient.post(
      `${environment.baseURL}/posts/${postId}/comments`,
      { content },
      { headers: this.getHeaders() }
    );
  }

  getCommentReplies(
    postId: string,
    commentId: string,
    limit: number = 10
  ): Observable<any> {
    return this.httpClient.get(
      `${environment.baseURL}/posts/${postId}/comments/${commentId}/replies?page=1&limit=${limit}`,
      { headers: this.getHeaders() }
    );
  }

  addReply(
    postId: string,
    commentId: string,
    content: string
  ): Observable<any> {
    return this.httpClient.post(
      `${environment.baseURL}/posts/${postId}/comments/${commentId}/replies`,
      { content },
      { headers: this.getHeaders() }
    );
  }

  toggleCommentLike(
    postId: string,
    commentId: string
  ): Observable<any> {
    return this.httpClient.put(
      `${environment.baseURL}/posts/${postId}/comments/${commentId}/like`,
      {},
      { headers: this.getHeaders() }
    );
  }

  updateComment(
    postId: string,
    commentId: string,
    content: string
  ): Observable<any> {
    this.clearCommentsCache(postId);

    return this.httpClient.put(
      `${environment.baseURL}/posts/${postId}/comments/${commentId}`,
      { content },
      { headers: this.getHeaders() }
    );
  }

  deleteComment(
    postId: string,
    commentId: string
  ): Observable<any> {
    this.clearCommentsCache(postId);

    return this.httpClient.delete(
      `${environment.baseURL}/posts/${postId}/comments/${commentId}`,
      { headers: this.getHeaders() }
    );
  }

  private clearCommentsCache(postId: string): void {
    for (const key of this.commentsCache.keys()) {
      if (key.startsWith(`${postId}-`)) {
        this.commentsCache.delete(key);
      }
    }
  }

}
