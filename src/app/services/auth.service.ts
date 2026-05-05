import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { User, Role } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  private keycloak: any = null;

  readonly isAuthenticated = signal(false);
  readonly isInitialized = signal(false);
  readonly isLoading = signal(true);
  readonly currentUser = signal<User | null>(null);

  async initialize(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading.set(false);
      this.isInitialized.set(true);
      return;
    }

    try {
      const Keycloak = (await import('keycloak-js')).default;
      this.keycloak = new Keycloak({
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId,
      });

      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
        pkceMethod: 'S256',
      });

      this.isAuthenticated.set(authenticated);

      if (authenticated) {
        await this.loadUserProfile();
        this.setupTokenRefresh();
      }
    } catch (error) {
      console.error('Keycloak initialization failed:', error);
      this.isAuthenticated.set(false);
    } finally {
      this.isLoading.set(false);
      this.isInitialized.set(true);
    }
  }

  private async loadUserProfile(): Promise<void> {
    if (!this.keycloak) return;
    try {
      const profile = await this.keycloak.loadUserProfile();
      const tokenParsed = this.keycloak.tokenParsed as Record<string, any>;
      this.currentUser.set({
        id: tokenParsed?.['sub'] || '',
        username: profile.username || '',
        email: profile.email || '',
        firstName: profile.firstName,
        lastName: profile.lastName,
        roles: this.extractRoles(),
      });
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }

  public extractRoles(): Role[] {
    const tokenParsed = this.keycloak.tokenParsed as Record<string, any>;
    const realmRoles: string[] = tokenParsed['realm_access']?.roles ?? [];
    const clientRoles: string[] =
      tokenParsed['resource_access']?.[environment.keycloak.clientId]?.roles ?? [];
    const all = [...realmRoles, ...clientRoles];
    const roles: Role[] = [];
    if (all.includes('ADMIN')) roles.push('ADMIN');
    if (all.includes('TEACHER')) roles.push('TEACHER');
    if (all.includes('STUDENT')) roles.push('STUDENT');
    return roles;
  }

  private setupTokenRefresh(): void {
    if (!this.keycloak) return;
    setInterval(async () => {
      try {
        await this.keycloak.updateToken(60);
      } catch {
        this.logout();
      }
    }, 60_000);
  }

  async login(): Promise<void> {
    await this.keycloak?.login({ redirectUri: window.location.origin + '/tutor' });
  }

  async logout(): Promise<void> {
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    if (environment.useMockAuth) {
      sessionStorage.removeItem('mock_auth');
      this.router.navigate(['/']);
      return;
    }
    await this.keycloak?.logout({ redirectUri: window.location.origin + '/' });
  }

  async getToken(): Promise<string | null> {
    if (environment.useMockAuth) return 'mock-token';
    if (!this.keycloak?.authenticated) return null;
    try {
      await this.keycloak.updateToken(30);
      return this.keycloak.token ?? null;
    } catch {
      return null;
    }
  }

  hasRole(role: Role): boolean {
    return this.currentUser()?.roles.includes(role) ?? false;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }
}
