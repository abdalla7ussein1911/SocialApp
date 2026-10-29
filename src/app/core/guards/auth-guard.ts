
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CheckPlateFormService } from '../services/check-plate-form.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const checkPlateFormService = inject(CheckPlateFormService);

  if (!checkPlateFormService.isBrowser()) {
    return true;
  }

  const token = localStorage.getItem('userToken');

  if (!token) {
    return router.createUrlTree(['/login']);
  }

  return true;
};
