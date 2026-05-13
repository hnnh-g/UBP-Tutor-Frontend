import { Injectable, inject, signal, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from './api.service';
import { StatusResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class StatusService implements OnDestroy {
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);

  readonly data = signal<StatusResponse | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  private pollInterval: ReturnType<typeof setInterval> | null = null;

  startPolling(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.fetchStatus();
    this.pollInterval = setInterval(() => this.fetchStatus(), 30_000);
  }

  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private fetchStatus(): void {
    this.api.getStatus().subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
        this.error.set(null);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Could not fetch status');
      },
    });
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}
