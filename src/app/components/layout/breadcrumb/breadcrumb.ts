import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { TranslationService } from '../../../services/translation.service';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

interface Crumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.scss',
})
export class BreadcrumbComponent {
  protected translation = inject(TranslationService);
  private router = inject(Router);

  protected crumbs = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.buildCrumbs()),
    ),
    { initialValue: this.buildCrumbs() },
  );

  private buildCrumbs(): Crumb[] {
    const t = this.translation.t().breadcrumb;
    const url = this.router.url.split('?')[0];
    const crumbs: Crumb[] = [{ label: t.home, url: '/' }];
    if (url.startsWith('/tutor')) crumbs.push({ label: t.tutor, url: '/tutor' });
    else if (url.startsWith('/settings')) crumbs.push({ label: t.settings, url: '/settings' });
    else if (url.startsWith('/help')) crumbs.push({ label: t.help, url: '/help' });
    else if (url.startsWith('/admin')) crumbs.push({ label: t.admin, url: '/admin' });
    return crumbs;
  }
}
