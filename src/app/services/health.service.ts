import { Injectable, inject, signal, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SystemStatus, HealthResponse } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class HealthService implements OnDestroy {
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);

  readonly status = signal<SystemStatus>('ready');
  readonly message = signal<string>('');
  readonly rawHealth = signal<HealthResponse | null>(null);

  private pollInterval: ReturnType<typeof setInterval> | null = null;

  startPolling(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.checkHealth();
    this.pollInterval = setInterval(() => this.checkHealth(), 30_000);
  }

  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private mapStatus(backendStatus: string): SystemStatus {
    switch (backendStatus) {
      case 'healthy': return 'ready';
      case 'degraded': return 'generating';
      default: return 'error';
    }
  }

  private checkHealth(): void {
    this.api.getHealth().subscribe({
      next: (res) => {
        this.status.set(this.mapStatus(res.status));
        this.message.set(res.message ?? '');
        this.rawHealth.set(res);
      },
      error: () => {
        this.status.set('error');
        this.message.set('Health check failed');
      },
    });
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}
