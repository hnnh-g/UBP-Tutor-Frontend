import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, throwError, from } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  ChatRequest,
  ChatResponse,
  HealthResponse,
  UserPreferences,
} from '../models';
import { AuthService } from './auth.service';
import { SnackbarService } from './snackbar.service';

const MOCK_HEALTH: HealthResponse = { status: 'ready', message: 'System operational' };
const MOCK_PREFERENCES: UserPreferences = {
  language: 'en',
  theme: 'light',
  sidebarOpen: true,
  defaultTaskType: 'question',
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private snackbar = inject(SnackbarService);
  private platformId = inject(PLATFORM_ID);

  private get apiUrl(): string {
    return environment.apiUrl;
  }

  getHealth(): Observable<HealthResponse> {
    if (environment.useMockAuth) return of(MOCK_HEALTH);
    return this.http.get<HealthResponse>(`${this.apiUrl}/health`).pipe(
      catchError(() => of({ status: 'error' as const, message: 'Cannot reach backend' })),
    );
  }

  sendMessage(request: ChatRequest): Observable<ChatResponse> {
    if (environment.useMockAuth) return of(this.mockChatResponse(request));
    return this.http.post<ChatResponse>(`${this.apiUrl}/chat`, request).pipe(
      catchError((err) => this.handleError(err)),
    );
  }

  getPreferences(): Observable<UserPreferences> {
    if (environment.useMockAuth) return of(MOCK_PREFERENCES);
    return this.http.get<UserPreferences>(`${this.apiUrl}/user/preferences`).pipe(
      catchError(() => of(MOCK_PREFERENCES)),
    );
  }

  updatePreferences(prefs: Partial<UserPreferences>): Observable<UserPreferences> {
    if (environment.useMockAuth) return of({ ...MOCK_PREFERENCES, ...prefs });
    return this.http
      .patch<UserPreferences>(`${this.apiUrl}/user/preferences`, prefs)
      .pipe(catchError((err) => this.handleError(err)));
  }

  streamMessage(request: ChatRequest): Observable<string> {
    if (!isPlatformBrowser(this.platformId)) return of('');
    if (environment.useMockAuth) return this.mockStream(request);
    return from(this.doFetchStream(request));
  }

  private async *iterStream(request: ChatRequest): AsyncGenerator<string> {
    const token = await this.auth.getToken();
    const response = await fetch(`${this.apiUrl}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const reader = response.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split('\n')) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data && data !== '[DONE]') yield data;
        }
      }
    }
  }

  private doFetchStream(request: ChatRequest): Promise<string> {
    return Promise.resolve('');
  }

  private mockStream(request: ChatRequest): Observable<string> {
    return new Observable((observer) => {
      const response = this.mockChatResponse(request);
      const words = response.content.split(' ');
      let i = 0;
      const timer = setInterval(() => {
        if (i < words.length) {
          observer.next(words[i] + ' ');
          i++;
        } else {
          clearInterval(timer);
          observer.complete();
        }
      }, 60);
      return () => clearInterval(timer);
    });
  }

  private mockChatResponse(request: ChatRequest): ChatResponse {
    const responses: Record<string, string> = {
      generation: `I'll generate a ${request.message.includes('BPMN') ? 'BPMN' : request.message.includes('UML') ? 'UML' : 'Petri net'} diagram based on your description.\n\n**Generated model:**\n\nHere is a model that represents the process you described. The diagram includes the main elements and their relationships.\n\n\`\`\`plantuml\n@startuml\nactor User\nUser -> System : Request\nSystem --> User : Response\n@enduml\n\`\`\``,
      explanation: `Let me explain this model for you.\n\n**Model Explanation:**\n\nThis diagram illustrates a typical workflow with the following key components:\n\n1. **Start Event** — Initiates the process\n2. **Tasks** — Represent work steps\n3. **Gateways** — Control the flow\n4. **End Event** — Completes the process\n\nThe flow follows a sequential pattern with decision points.`,
      evaluation: `I've evaluated your model. Here are my findings:\n\n**✓ Strengths:**\n- Clear structure and layout\n- Correct use of notation\n- Good naming conventions\n\n**⚠ Suggestions:**\n- Consider adding error handling paths\n- The gateway at step 3 could be more explicit\n- Add documentation for complex transitions`,
      'question': `Great question! Here's a comprehensive answer:\n\nUML, BPMN, and Petri nets are all modeling languages but serve different purposes:\n\n- **UML** focuses on software system structure and behavior\n- **BPMN** is designed for business process modeling\n- **Petri nets** are mathematical tools for concurrent system analysis\n\nChoose based on your modeling goal and audience.`,
    };

    const content = responses[request.taskType] || responses['question'];
    return {
      id: crypto.randomUUID(),
      content,
      taskType: request.taskType,
      conversationId: crypto.randomUUID(),
    };
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
