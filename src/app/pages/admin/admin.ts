import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';
import { HealthService } from '../../services/health.service';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar';
import { BreadcrumbComponent } from '../../components/layout/breadcrumb/breadcrumb';
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, SidebarComponent, BreadcrumbComponent],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class AdminPage {
  protected auth = inject(AuthService);
  protected translation = inject(TranslationService);
  protected health = inject(HealthService);

  protected mockUsers = [
    { username: 'student123', email: 'student@ovgu.de', role: 'student', active: true },
    { username: 'prof.mueller', email: 'teacher@ovgu.de', role: 'teacher', active: true },
    { username: 'admin', email: 'admin@ovgu.de', role: 'admin', active: true },
    { username: 'student456', email: 'student2@ovgu.de', role: 'student', active: false },
  ];
}
