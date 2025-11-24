import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '@app/core/auth/auth.service';
import { ROLE_ROUTE_MAP, ROUTES_ADMIN } from '@app/core/constants/router.constant';
import type { RoleName } from '@app/core/constants/router.constant';

/**
 * Redirect Guard
 * Handles root path redirect based on authentication status
 */
export const redirectGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    const token = authService.accessToken;
    const user = authService.currentUser;

    if (token && user) {
      const userRoles = user?.roles ?? [];

      for (const role of userRoles) {
        const roleName = role.value as RoleName;
        const routePath = ROLE_ROUTE_MAP[roleName];

        if (routePath) {
          await router.navigate([routePath], { replaceUrl: true });
          return false;
        }
      }

      await router.navigate([ROUTES_ADMIN.DASHBOARD], { replaceUrl: true });
      return false;
    }

    await router.navigate(['/sign-in'], { replaceUrl: true });
    return false;
  } catch (error) {
    console.error('Error in redirectGuard:', error);
    await router.navigate(['/sign-in'], { replaceUrl: true });
    return false;
  }
};

