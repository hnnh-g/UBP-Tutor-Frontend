import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';
import { HealthService } from '../../services/health.service';
import { StatusService } from '../../services/status.service';
import { AdminUsersService } from '../../services/admin-users.service';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar';
import { BreadcrumbComponent } from '../../components/layout/breadcrumb/breadcrumb';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, SidebarComponent, BreadcrumbComponent],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class AdminPage implements OnInit, OnDestroy {
  protected auth = inject(AuthService);
  protected translation = inject(TranslationService);
  protected health = inject(HealthService);
  protected statusSvc = inject(StatusService);
  protected adminUsers = inject(AdminUsersService);

  ngOnInit(): void {
    this.health.startPolling();
    this.statusSvc.startPolling();
    this.adminUsers.startPolling();
  }

  ngOnDestroy(): void {
    this.health.stopPolling();
    this.statusSvc.stopPolling();
    this.adminUsers.stopPolling();
  }

  protected componentEntries(): { name: string; reachable: boolean; detail?: string }[] {
    const components = this.statusSvc.data()?.components ?? this.health.rawHealth()?.components ?? {};
    return Object.entries(components).map(([name, c]) => ({ name, ...c }));
  }

  protected formatLastLogin(ms?: string): string {
    if (!ms) return 'Never';
    const date = new Date(parseInt(ms, 10));
    return isNaN(date.getTime()) ? 'Unknown' : date.toLocaleString();
  }

  protected rolesDistribution(): { role: string; count: number }[] {
    const dist = this.adminUsers.data()?.roles_distribution ?? {};
    return Object.entries(dist).map(([role, count]) => ({ role, count }));
  }

  protected translateRole(role: string): string {
    const roles = this.translation.t().roles;
    const key = role.toLowerCase() as keyof typeof roles;
    return roles[key] ?? role;
  }

  protected translateTaskType(task: string): string {
    const taskType = this.translation.t().taskType;
    const key = task as keyof typeof taskType;
    return taskType[key] ?? task;
  }
}
