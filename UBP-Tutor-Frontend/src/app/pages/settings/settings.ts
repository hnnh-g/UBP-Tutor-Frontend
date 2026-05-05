import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';
import { PreferencesService } from '../../services/preferences.service';
import { UIStateService } from '../../services/ui-state.service';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar';
import { BreadcrumbComponent } from '../../components/layout/breadcrumb/breadcrumb';
import { Language, TaskType, TASK_TYPE_OPTIONS } from '../../models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent, BreadcrumbComponent],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class SettingsPage implements OnInit {
  protected auth = inject(AuthService);
  protected translation = inject(TranslationService);
  protected preferences = inject(PreferencesService);
  protected uiState = inject(UIStateService);

  protected taskTypeOptions = TASK_TYPE_OPTIONS;
  protected selectedLanguage = signal<Language>('en');
  protected selectedTaskType = signal<TaskType>('free-question');

  ngOnInit(): void {
    this.preferences.load().then(() => {
      this.selectedLanguage.set(this.preferences.preferences().language);
      this.selectedTaskType.set(this.preferences.preferences().defaultTaskType);
    });
  }

  getRoleLabel(role: string): string {
    return (this.translation.t().roles as Record<string, string>)[role] ?? role;
  }

  async save(): Promise<void> {
    await this.preferences.save({
      language: this.selectedLanguage(),
      defaultTaskType: this.selectedTaskType(),
    });
  }
}
