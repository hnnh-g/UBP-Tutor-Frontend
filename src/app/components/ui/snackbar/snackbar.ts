import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnackbarService } from '../../../services/snackbar.service';
import { SnackbarMessage } from '../../../models';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snackbar.html',
  styleUrl: './snackbar.scss',
})
export class SnackbarComponent {
  protected snackbar = inject(SnackbarService);

  trackById(_: number, msg: SnackbarMessage): string {
    return msg.id;
  }

  iconFor(type: SnackbarMessage['type']): string {
    const icons: Record<SnackbarMessage['type'], string> = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    };
    return icons[type];
  }

  colorFor(type: SnackbarMessage['type']): string {
    const colors: Record<SnackbarMessage['type'], string> = {
      success: 'bg-green-600',
      error: 'bg-red-600',
      warning: 'bg-amber-500',
      info: 'bg-brand-600',
    };
    return colors[type];
  }
}
