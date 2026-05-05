import { Injectable, signal } from '@angular/core';
import { SnackbarMessage, SnackbarType } from '../models';

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  readonly messages = signal<SnackbarMessage[]>([]);

  show(message: string, type: SnackbarType = 'info', duration = 4000): void {
    const id = crypto.randomUUID();
    this.messages.update((msgs) => [...msgs, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error', 6000);
  }

  warning(message: string): void {
    this.show(message, 'warning');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  dismiss(id: string): void {
    this.messages.update((msgs) => msgs.filter((m) => m.id !== id));
  }

  dismissAll(): void {
    this.messages.set([]);
  }
}
