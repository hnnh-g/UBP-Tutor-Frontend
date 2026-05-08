import { Injectable, inject, signal } from '@angular/core';
import { Message, ChatRequest, DiagramData, detectTaskType } from '../models';
import { ApiService } from './api.service';
import { UIStateService } from './ui-state.service';
import { SnackbarService } from './snackbar.service';
import { TranslationService } from './translation.service';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private api = inject(ApiService);
  private uiState = inject(UIStateService);
  private snackbar = inject(SnackbarService);
  private translation = inject(TranslationService);

  readonly messages = signal<Message[]>([]);
  readonly isStreaming = signal(false);
  readonly currentDiagram = signal<DiagramData | null>(null);
  readonly conversationId = signal<string | null>(null);

  private streamSub: Subscription | null = null;
  private cancelFn: (() => void) | null = null;

  constructor() {
  fetch('/assets/example-diagrams/petri-net.pnml')
    .then(r => r.text())
    .then(xml => this.currentDiagram.set({ type: 'petri-net', content: xml }));
}

  sendMessage(text: string): void {
    if (!text.trim() || this.isStreaming()) return;

    const detectedType = detectTaskType(text);
    if (detectedType) this.uiState.setTaskType(detectedType);

    console.log(detectedType);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
      taskType: this.uiState.currentTaskType(),
      uploadedFile: this.uiState.uploadedFile() ?? undefined,
    };

    this.messages.update((msgs) => [...msgs, userMessage]);
    this.uiState.clearUploadedFile();

    const tutorMsgId = crypto.randomUUID();
    const tutorMessage: Message = {
      id: tutorMsgId,
      role: 'tutor',
      content: '',
      timestamp: new Date(),
      taskType: this.uiState.currentTaskType(),
      isStreaming: true,
    };
    this.messages.update((msgs) => [...msgs, tutorMessage]);
    this.isStreaming.set(true);

    const request: ChatRequest = {
      message: text.trim(),
      task_type: this.uiState.currentTaskType(),
      session_id: this.conversationId() ?? undefined,
      metadata: {
        language: this.translation.language(),
        uploadedFile: userMessage.uploadedFile,
      },
    };

    if (request.task_type === 'model_generation') {
        this.api.sendMessage(request).subscribe({
        next: (response) => {
          this.messages.update((msgs) =>
            msgs.map((m) =>
              m.id === tutorMsgId
                ? { ...m, content: response.content, isStreaming: false }
                : m,
            ),
          );
          this.isStreaming.set(false);
        },
        error: () => {
          this.messages.update((msgs) =>
            msgs.map((m) =>
              m.id === tutorMsgId
                ? { ...m, content: 'An error occurred. Please try again.', isStreaming: false }
                : m,
            ),
          );
          this.isStreaming.set(false);
        },
      });
    }
    else {
      let accumulatedContent = '';

      this.streamSub = this.api.streamMessage(request).subscribe({
        next: (chunk) => {
          accumulatedContent += chunk;
          this.messages.update((msgs) =>
            msgs.map((m) =>
              m.id === tutorMsgId ? { ...m, content: accumulatedContent } : m,
            ),
          );
        },
        error: (err) => {
          this.messages.update((msgs) =>
            msgs.map((m) =>
              m.id === tutorMsgId
                ? { ...m, content: 'An error occurred. Please try again.', isStreaming: false }
                : m,
            ),
          );
          this.isStreaming.set(false);
        },
        complete: () => {
          this.messages.update((msgs) =>
            msgs.map((m) =>
              m.id === tutorMsgId ? { ...m, isStreaming: false } : m,
            ),
          );
          this.isStreaming.set(false);
          this.extractDiagram(accumulatedContent);
        },
      });
    }
  }

  cancelGeneration(): void {
    this.streamSub?.unsubscribe();
    this.streamSub = null;
    this.messages.update((msgs) =>
      msgs.map((m) =>
        m.isStreaming ? { ...m, isStreaming: false } : m,
      ),
    );
    this.isStreaming.set(false);
    this.snackbar.info(this.translation.t().errors.cancelled);
  }

  clearHistory(): void {
    this.messages.set([]);
    this.currentDiagram.set(null);
    this.conversationId.set(null);
    this.isStreaming.set(false);
    this.streamSub?.unsubscribe();
  }

  private extractDiagram(content: string): void {
    const bpmnMatch = content.match(/```bpmn\n([\s\S]+?)```/);
    const pumlMatch = content.match(/```(?:plantuml|uml)\n([\s\S]+?)```/);
    const pnmlMatch = content.match(/```(?:pnml|petri-net)\n([\s\S]+?)```/);

    if (bpmnMatch) {
      this.currentDiagram.set({ type: 'bpmn', content: bpmnMatch[1] });
    } else if (pumlMatch) {
      this.currentDiagram.set({ type: 'uml', content: pumlMatch[1] });
    } else if (pnmlMatch) {
      this.currentDiagram.set({ type: 'petri-net', content: pnmlMatch[1] });
    }
  }
}
