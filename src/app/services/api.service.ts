import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  AdminUserResponse,
  ChatRequest,
  ChatResponse,
  HealthResponse,
  StatusResponse,
  UserPreferences,
} from '../models';
import { AuthService } from './auth.service';
import { SnackbarService } from './snackbar.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private snackbar = inject(SnackbarService);

  private get apiUrl(): string {
    return environment.apiUrl;
  }

  getHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.apiUrl}/health`).pipe(
      catchError(() => of({ status: 'unhealthy', message: 'Cannot reach backend' })),
    );
  }

  getStatus(): Observable<StatusResponse> {
    return this.http.get<StatusResponse>(`${this.apiUrl}/status`).pipe(
      catchError((err) => this.handleError(err)),
    );
  }

  getAdminUsers(): Observable<AdminUserResponse> {
    return this.http.get<AdminUserResponse>(`${this.apiUrl}/admin/users`).pipe(
      catchError((err) => this.handleError(err)),
    );
  }

  sendMessage(request: ChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/chat`, request).pipe(
      catchError((err) => this.handleError(err)),
    );
  }

  getPreferences(): Observable<UserPreferences> {
    return this.http.get<UserPreferences>(`${this.apiUrl}/user/preferences`).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  updatePreferences(prefs: Partial<UserPreferences>): Observable<UserPreferences> {
    return this.http
      .patch<UserPreferences>(`${this.apiUrl}/user/preferences`, prefs)
      .pipe(catchError((err) => this.handleError(err)));
  }

  streamMessage(request: ChatRequest): Observable<string> {
    return new Observable<string>((observer) => {
      const controller = new AbortController();

      this.auth.getToken().then((token) => {
        fetch(`${this.apiUrl}/chat/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(request),
          signal: controller.signal,
        })
          .then(async (response) => {
            if (!response.ok || !response.body) {
              throw new Error('Streaming request failed');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
              const { value, done } = await reader.read();

              if (done) {
                observer.complete();
                break;
              }

              buffer += decoder.decode(value, { stream: true });

              const events = buffer.split('\n\n');
              buffer = events.pop() ?? '';

              for (const rawEvent of events) {
                const line = rawEvent
                  .split('\n')
                  .find((line) => line.startsWith('data: '));

                if (!line) continue;

                const parsed = JSON.parse(line.replace('data: ', '').trim());

                if (parsed.event === 'token') {
                  observer.next(parsed.data);
                }

                if (parsed.event === 'done') {
                  observer.complete();
                  return;
                }

                if (parsed.event === 'error') {
                  observer.error(parsed.message);
                  return;
                }
              }
            }
          })
          .catch((error) => {
            if (error.name === 'AbortError') return;
            observer.error(error);
          });
      });

      // Teardown: abort the in-flight fetch so the backend receives a disconnect
      return () => controller.abort();
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 401) {
      this.auth.logout();
      return throwError(() => error);
    }
    if (error.status === 0) {
      this.snackbar.error('Network error. Please check your connection.');
    } else {
      this.snackbar.error(`Server error (${error.status}). Please try again.`);
    }
    return throwError(() => error);
  }
}
