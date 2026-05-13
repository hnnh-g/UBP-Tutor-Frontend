import { Injectable, inject, signal, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from './api.service';
import { AdminUserResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AdminUsersService implements OnDestroy {
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);

  readonly data = signal<AdminUserResponse | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  private pollInterval: ReturnType<typeof setInterval> | null = null;

  startPolling(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.fetch();
    this.pollInterval = setInterval(() => this.fetch(), 60_000);
  }

  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private fetch(): void {
    this.api.getAdminUsers().subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
        this.error.set(null);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Could not fetch user data');
      },
    });
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}
