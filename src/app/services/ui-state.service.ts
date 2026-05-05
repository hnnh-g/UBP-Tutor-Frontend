import { Injectable, signal } from '@angular/core';
import { TaskType, UploadedFile } from '../models';

@Injectable({ providedIn: 'root' })
export class UIStateService {
  readonly currentTaskType = signal<TaskType>('free-question');
  readonly uploadedFile = signal<UploadedFile | null>(null);
  readonly sidebarOpen = signal(true);
  readonly helpPanelOpen = signal(false);
  readonly visualizationExpanded = signal(false);

  setTaskType(type: TaskType): void {
    this.currentTaskType.set(type);
  }

  setUploadedFile(file: UploadedFile | null): void {
    this.uploadedFile.set(file);
  }

  clearUploadedFile(): void {
    this.uploadedFile.set(null);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  toggleHelpPanel(): void {
    this.helpPanelOpen.update((v) => !v);
  }

  toggleVisualization(): void {
    this.visualizationExpanded.update((v) => !v);
  }
}
