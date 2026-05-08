import { Component, inject, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { PreferencesService } from './services/preferences.service';
import { SnackbarComponent } from './components/ui/snackbar/snackbar';
import { LoadingSpinnerComponent } from './components/ui/loading-spinner/loading-spinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SnackbarComponent, LoadingSpinnerComponent],
  template: `
    @if (auth.isLoading()) {
      <app-loading-spinner />
    } @else {
      <router-outlet />
      <app-snackbar />
    }
  `,
})
export class AppComponent {
  protected auth = inject(AuthService);
  private prefs = inject(PreferencesService);

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated()) {
        this.prefs.load();
      }
    });
  }
}
