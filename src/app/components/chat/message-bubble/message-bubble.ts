import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../../models';
import { TypingIndicatorComponent } from '../typing-indicator/typing-indicator';

@Component({
  selector: 'app-message-bubble',
  standalone: true,
  imports: [CommonModule, TypingIndicatorComponent],
  templateUrl: './message-bubble.html',
  styleUrl: './message-bubble.scss',
})
export class MessageBubbleComponent {
  @Input({ required: true }) message!: Message;

  get isUser(): boolean {
    return this.message.role === 'user';
  }

  get isError(): boolean {
    return !!this.message.isError;
  }

  get taskIcon(): string {
    const icons: Record<string, string> = {
      model_generation: '✦',
      summary: '◈',
      question_generation: '∆',
      model_evaluation: '◎',
      question: '○',
      answer_evaluation: '✪',
    };
    return this.message.taskType ? (icons[this.message.taskType] ?? '○') : '○';
  }

  get formattedTime(): string {
    return this.message.timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatContent(content: string): string {
    const escapeHtml = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const codeBlock = (code: string) =>
      `<pre class="bg-slate-900 text-slate-100 p-3 rounded-lg my-2 overflow-y-auto max-h-80 text-sm font-mono whitespace-pre-wrap break-all"><code>${escapeHtml(code)}</code></pre>`;

    // Unfenced diagram source (e.g. BPMN / PNML XML or PlantUML pasted for evaluation)
    if (!content.includes('```')) {
      const fence = (m: string) => '```\n' + m + '\n```';
      content = /^@startuml/m.test(content)
        ? content.replace(/^@startuml[\s\S]*?(^@enduml[^\n]*$|$(?![\s\S]))/m, fence)
        : content.replace(/^[ \t]*<(?:\?xml|[\w:-]+[\s>/])[\s\S]*>[ \t]*$/m, fence);
    }

    // Split on fenced code blocks so newlines and HTML chars inside them are preserved
    return content
      .split(/(```[\w]*\n?[\s\S]+?```)/g)
      .map((part, i) => {
        if (i % 2 === 1) {
          return codeBlock(part.replace(/^```[\w]*\n?/, '').replace(/```$/, ''));
        }
        return escapeHtml(part)
          .replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*([\s\S]+?)\*/g, '<em>$1</em>')
          .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
          .replace(/\n/g, '<br>');
      })
      .join('');
  }
}
