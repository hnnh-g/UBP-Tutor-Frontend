import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './help.html',
  styleUrl: './help.scss',
})
export class HelpPage {
  protected translation = inject(TranslationService);
  protected auth = inject(AuthService);

  protected activeSection = signal<string>('taskTypes');

  sections = [
    { id: 'taskTypes', icon: '○' },
    { id: 'uml', icon: '⬢' },
    { id: 'bpmn', icon: '⬡' },
    { id: 'petriNet', icon: '◉' },
    { id: 'fileUpload', icon: '↑' },
  ];

  readonly pumlExample = `@startuml\nclass Student {\n  +String name\n  +enroll()\n}\nclass Course {\n  +String title\n}\nStudent --> Course : enrolls in\n@enduml`;

  getSectionLabel(id: string): string {
    return (this.translation.t().help.sections as Record<string, string>)[id] ?? id;
  }

  getTaskTypeName(key: string): string {
    return (this.translation.t().taskType as Record<string, string>)[key] ?? key;
  }

  getTaskTypeHelp(key: string): string {
    return (this.translation.t().help.taskTypes as Record<string, string>)[key] ?? key;
  }
}
