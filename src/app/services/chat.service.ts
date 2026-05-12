import { Injectable, inject, signal } from '@angular/core';
import { Message, ChatRequest, DiagramData } from '../models';
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
}

  sendMessage(text: string): void {
    if (!text.trim() || this.isStreaming()) return;

    const taskType = this.uiState.currentTaskType();

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
      taskType,
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
      taskType,
      isStreaming: true,
    };
    this.messages.update((msgs) => [...msgs, tutorMessage]);
    this.isStreaming.set(true);

    const request: ChatRequest = {
      message: text.trim(),
      task_type: taskType,
      session_id: this.conversationId() ?? undefined,
      metadata: {
        language: this.translation.language(),
        uploadedFile: userMessage.uploadedFile,
      },
    };

    if (request.task_type === 'model_generation') {
        this.api.sendMessage(request).subscribe({
        next: (response) => {
          // Use structured diagramData if backend provides it, otherwise extract from content string
          if (response.diagramData) {
            this.currentDiagram.set(response.diagramData);
          } else {
            this.extractDiagram(response.content);
          }
          // Show diagram as a fenced code block in chat; wrap raw content if not already fenced
          const chatContent = this.wrapDiagramContent(response.content);
          this.messages.update((msgs) =>
            msgs.map((m) =>
              m.id === tutorMsgId
                ? { ...m, content: chatContent, isStreaming: false }
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
          this.extractDiagram(accumulatedContent);
          this.messages.update((msgs) =>
            msgs.map((m) =>
              m.id === tutorMsgId ? { ...m, content: accumulatedContent, isStreaming: false } : m,
            ),
          );
          this.isStreaming.set(false);
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

  private extractDiagram(content: string): boolean {
    const trimmed = content.trim();

    // Fenced code blocks (explicit diagram type)
    const pumlFenced = content.match(/```(?:plantuml|uml)\n([\s\S]+?)```/);
    const bpmnFenced = content.match(/```(?:bpmn|xml)\n([\s\S]+?)```/);
    const pnmlFenced = content.match(/```(?:pnml|petri-net)\n([\s\S]+?)```/);

    if (pumlFenced) {
      this.currentDiagram.set({ type: 'uml', content: pumlFenced[1] });
      return true;
    }
    if (bpmnFenced && this.looksLikeBpmn(bpmnFenced[1])) {
      this.currentDiagram.set({ type: 'bpmn', content: bpmnFenced[1] });
      return true;
    }
    if (pnmlFenced) {
      this.currentDiagram.set({ type: 'petri-net', content: pnmlFenced[1] });
      return true;
    }

    // Raw diagram content (no fences)
    if (trimmed.startsWith('@startuml')) {
      this.currentDiagram.set({ type: 'uml', content: trimmed });
      return true;
    }
    if (trimmed.startsWith('<pnml') || trimmed.includes('\n<pnml')) {
      this.currentDiagram.set({ type: 'petri-net', content: trimmed });
      return true;
    }
    if (this.looksLikeBpmn(trimmed)) {
      this.currentDiagram.set({ type: 'bpmn', content: trimmed });
      return true;
    }

    return false;
  }

  private looksLikeBpmn(text: string): boolean {
    return text.includes('<definitions') ||
           text.includes('<bpmn:definitions') ||
           (text.startsWith('<?xml') && text.includes('bpmn'));
  }

  private wrapDiagramContent(content: string): string {
    const trimmed = content.trim();
    // Already has fenced blocks — return as-is so formatContent renders them
    if (/^```[\w]/.test(trimmed)) return content;
    // Wrap raw diagram content in an appropriate fence
    if (trimmed.startsWith('@startuml')) return '```plantuml\n' + trimmed + '\n```';
    if (this.looksLikeBpmn(trimmed)) return '```xml\n' + trimmed + '\n```';
    if (trimmed.startsWith('<pnml') || trimmed.includes('\n<pnml'))
      return '```xml\n' + trimmed + '\n```';
    return content;
  }
}
