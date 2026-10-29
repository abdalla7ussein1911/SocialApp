
import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CheckPlateFormService {
  private platFormId = inject(PLATFORM_ID);

  isBrowser(): boolean {
    return isPlatformBrowser(this.platFormId);
  }
}
