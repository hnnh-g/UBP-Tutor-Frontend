import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { SnackbarComponent } from './components/ui/snackbar/snackbar';
import { LoadingSpinnerComponent } from './components/ui/loading-spinner/loading-spinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SnackbarComponent, LoadingSpinnerComponent],
  template: `
    @if (auth.isLoading()) {
      <app-loading-spinner [overlay]="true" label="Initializing..." />
    } @else {
      <router-outlet />
    }
    <app-snackbar />
  `,
  styles: [':host { display: block; height: 100%; }'],
})
export class App {
  protected auth = inject(AuthService);
}
