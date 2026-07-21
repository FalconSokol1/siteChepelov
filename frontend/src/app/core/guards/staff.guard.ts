import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, of, catchError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const staffGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn) {
    return router.createUrlTree(['/manage/login']);
  }

  const user = auth.user();
  if (user?.is_staff) {
    return true;
  }

  return auth.loadMe().pipe(
    map((me) => {
      if (me.is_staff) {
        return true;
      }
      auth.forceLogout();
      return router.createUrlTree(['/manage/login'], {
        queryParams: { error: 'staff' },
      });
    }),
    catchError(() => of(router.createUrlTree(['/manage/login'])))
  );
};

export const guestStaffGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn && auth.user()?.is_staff) {
    return router.createUrlTree(['/manage']);
  }
  return true;
};
