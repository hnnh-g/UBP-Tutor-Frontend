import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { UserPreferences, Language, TaskType } from '../models';
import { ApiService } from './api.service';
import { TranslationService } from './translation.service';
import { UIStateService } from './ui-state.service';
import { SnackbarService } from './snackbar.service';
import { firstValueFrom } from 'rxjs';

const DEFAULTS: UserPreferences = {
  language: 'en',
  theme: 'light',
  sidebarOpen: true,
  defaultTaskType: 'question',
};

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private api = inject(ApiService);
  private translation = inject(TranslationService);
  private uiState = inject(UIStateService);
  private snackbar = inject(SnackbarService);

  readonly preferences = signal<UserPreferences>({ ...DEFAULTS });
  readonly isLoading = signal(false);

  async load(): Promise<void> {
    try {
      const prefs = await firstValueFrom(this.api.getPreferences());
      this.preferences.set(prefs);
      this.applyPreferences(prefs);
    } catch {
      this.applyPreferences(DEFAULTS);
    }
  }

  async save(updates: Partial<UserPreferences>): Promise<void> {
    this.isLoading.set(true);
    try {
      const updated = await firstValueFrom(this.api.updatePreferences(updates));
      this.preferences.set(updated);
      this.applyPreferences(updated);
      this.snackbar.success(this.translation.t().snackbar.preferencesSaved);
    } catch {
      this.snackbar.error(this.translation.t().errors.server);
    } finally {
      this.isLoading.set(false);
    }
  }

  private applyPreferences(prefs: UserPreferences): void {
    this.translation.setLanguage(prefs.language);
    this.uiState.sidebarOpen.set(prefs.sidebarOpen);
    this.uiState.setTaskType(prefs.defaultTaskType);
  }
}
