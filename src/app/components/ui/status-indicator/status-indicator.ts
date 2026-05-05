import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HealthService } from '../../../services/health.service';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-status-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-indicator.html',
  styleUrl: './status-indicator.scss',
})
export class StatusIndicatorComponent {
  protected health = inject(HealthService);
  protected translation = inject(TranslationService);

  get dotClass(): string {
    const s = this.health.status();
    if (s === 'ready') return 'bg-green-500';
    if (s === 'generating') return 'bg-amber-400 animate-pulse';
    return 'bg-red-500';
  }

  get label(): string {
    const t = this.translation.t().status;
    const s = this.health.status();
    if (s === 'ready') return t.ready;
    if (s === 'generating') return t.generating;
    return t.error;
  }
}
