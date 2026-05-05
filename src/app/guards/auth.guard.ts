import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const userRoles: string[] = auth.extractRoles(); 

  if (auth.isAuthenticated()) {
    const requiredRoles = route.data['roles'];
    if (!requiredRoles || requiredRoles.length === 0) return true;

    return requiredRoles.some((role: string) => userRoles.includes(role));
  }
  return router.createUrlTree(['/']);
};