import {
  Component,
  inject,
  ViewChild,
  ElementRef,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../services/chat.service';
import { TranslationService } from '../../../services/translation.service';
import { MessageBubbleComponent } from '../message-bubble/message-bubble';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule, MessageBubbleComponent],
  templateUrl: './message-list.html',
  styleUrl: './message-list.scss',
})
export class MessageListComponent {
  protected chat = inject(ChatService);
  protected translation = inject(TranslationService);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef<HTMLDivElement>;

  constructor() {
    effect(() => {
      const msgs = this.chat.messages();
      if (msgs.length > 0) {
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  private scrollToBottom(): void {
    try {
      const el = this.scrollContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
