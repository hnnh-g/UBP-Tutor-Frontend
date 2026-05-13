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

  private pendingSub: Subscription | null = null;

  sendMessage(text: string): void {
    if (!text.trim() || this.isStreaming()) return;

    this.currentDiagram.set(null);

    const taskType = this.uiState.currentTaskType();
    const uploadedFile = this.uiState.uploadedFile();

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
      taskType,
      uploadedFile: uploadedFile ?? undefined,
    };

    this.messages.update((msgs) => [...msgs, userMessage]);
    this.uiState.clearUploadedFile();

    const tutorMsgId = crypto.randomUUID();
    this.messages.update((msgs) => [
      ...msgs,
      { id: tutorMsgId, role: 'tutor', content: '', timestamp: new Date(), taskType, isStreaming: true },
    ]);
    this.isStreaming.set(true);

    // Append file content to the prompt so the backend LLM can see it
    let backendMessage = text.trim();
    if (uploadedFile?.content) {
      backendMessage = `${text.trim()}\n\n[Attached file: ${uploadedFile.name}]\n\`\`\`\n${uploadedFile.content}\n\`\`\``;
    }

    const request: ChatRequest = {
      message: backendMessage,
      task_type: taskType,
      session_id: this.conversationId() ?? undefined,
      metadata: { language: this.translation.language() },
    };

    if (taskType === 'model_generation') {
      this.pendingSub = this.api.sendMessage(request).subscribe({
        next: (response) => {
          const diagramFound = response.diagramData
            ? (this.currentDiagram.set(response.diagramData), true)
            : this.extractDiagram(response.content);

          if (!diagramFound) {
            // Model responded but produced no diagram
            this.messages.update((msgs) =>
              msgs.map((m) =>
                m.id === tutorMsgId
                  ? { ...m, content: this.translation.t().errors.diagramFailed, isStreaming: false, isError: true }
                  : m,
              ),
            );
          } else {
            const chatContent = this.wrapDiagramContent(response.content);
            this.messages.update((msgs) =>
              msgs.map((m) =>
                m.id === tutorMsgId ? { ...m, content: chatContent, isStreaming: false } : m,
              ),
            );
          }
          this.isStreaming.set(false);
        },
        error: () => {
          this.setErrorMessage(tutorMsgId);
        },
      });
    } else {
      let accumulatedContent = '';

      this.pendingSub = this.api.streamMessage(request).subscribe({
        next: (chunk) => {
          accumulatedContent += chunk;
          this.messages.update((msgs) =>
            msgs.map((m) => (m.id === tutorMsgId ? { ...m, content: accumulatedContent } : m)),
          );
        },
        error: () => {
          this.setErrorMessage(tutorMsgId);
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
    this.pendingSub?.unsubscribe();
    this.pendingSub = null;
    this.messages.update((msgs) => msgs.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m)));
    this.isStreaming.set(false);
    this.snackbar.info(this.translation.t().errors.cancelled);
  }

  clearHistory(): void {
    this.pendingSub?.unsubscribe();
    this.pendingSub = null;
    this.messages.set([]);
    this.currentDiagram.set(null);
    this.conversationId.set(null);
    this.isStreaming.set(false);
  }

  private setErrorMessage(tutorMsgId: string): void {
    this.messages.update((msgs) =>
      msgs.map((m) =>
        m.id === tutorMsgId
          ? { ...m, content: this.translation.t().errors.generationFailed, isStreaming: false, isError: true }
          : m,
      ),
    );
    this.isStreaming.set(false);
  }

  private extractDiagram(content: string): boolean {
    const trimmed = content.trim();

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
    return (
      text.includes('<definitions') ||
      text.includes('<bpmn:definitions') ||
      (text.startsWith('<?xml') && text.includes('bpmn'))
    );
  }

  private wrapDiagramContent(content: string): string {
    const trimmed = content.trim();
    if (/^```[\w]/.test(trimmed)) return content;
    if (trimmed.startsWith('@startuml')) return '```plantuml\n' + trimmed + '\n```';
    if (this.looksLikeBpmn(trimmed)) return '```xml\n' + trimmed + '\n```';
    if (trimmed.startsWith('<pnml') || trimmed.includes('\n<pnml'))
      return '```xml\n' + trimmed + '\n```';
    return content;
  }
}
