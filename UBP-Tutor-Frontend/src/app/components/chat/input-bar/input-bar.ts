import {
  Component,
  inject,
  signal,
  computed,
  ViewChild,
  ElementRef,
  effect,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../services/chat.service';
import { UIStateService } from '../../../services/ui-state.service';
import { TranslationService } from '../../../services/translation.service';
import { SnackbarService } from '../../../services/snackbar.service';
import {
  TASK_TYPE_OPTIONS,
  ACCEPTED_FILE_TYPES,
  MAX_FILE_SIZE_BYTES,
  UploadedFile,
  detectTaskType,
} from '../../../models';

@Component({
  selector: 'app-input-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input-bar.html',
  styleUrl: './input-bar.scss',
})
export class InputBarComponent implements OnInit, OnDestroy {
  protected chat = inject(ChatService);
  protected uiState = inject(UIStateService);
  protected translation = inject(TranslationService);
  private snackbar = inject(SnackbarService);

  protected taskTypeOptions = TASK_TYPE_OPTIONS;
  protected inputText = signal('');
  protected currentPlaceholderIndex = signal(0);

  @ViewChild('textarea') private textarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('fileInput') private fileInput!: ElementRef<HTMLInputElement>;

  private placeholderTimer: ReturnType<typeof setInterval> | null = null;

  protected currentPlaceholder = computed(() => {
    const task = this.uiState.currentTaskType();
    const opts = this.taskTypeOptions.find((o) => o.value === task);
    if (!opts) return this.translation.t().tutor.placeholder;
    return opts.placeholders[this.currentPlaceholderIndex() % opts.placeholders.length];
  });

  protected canSend = computed(
    () => this.inputText().trim().length > 0 && !this.chat.isStreaming(),
  );

  constructor() {
    effect(() => {
      const text = this.inputText();
      const detected = detectTaskType(text);
      if (detected) this.uiState.setTaskType(detected);
    });
  }

  ngOnInit(): void {
    this.placeholderTimer = setInterval(() => {
      this.currentPlaceholderIndex.update((i) => i + 1);
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.placeholderTimer) clearInterval(this.placeholderTimer);
  }

  send(): void {
    if (!this.canSend()) return;
    this.chat.sendMessage(this.inputText());
    this.inputText.set('');
    this.autoResize();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.inputText.set(target.value);
    this.autoResize();
  }

  private autoResize(): void {
    const el = this.textarea?.nativeElement;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }

  triggerFileUpload(): void {
    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_FILE_TYPES.includes(ext)) {
      this.snackbar.error(this.translation.t().errors.fileType);
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      this.snackbar.error(this.translation.t().errors.fileSize);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const uploaded: UploadedFile = {
        name: file.name,
        size: file.size,
        type: ext,
        content: e.target?.result as string,
      };
      this.uiState.setUploadedFile(uploaded);
      this.snackbar.success(this.translation.t().snackbar.uploadSuccess);
    };
    reader.readAsText(file);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
