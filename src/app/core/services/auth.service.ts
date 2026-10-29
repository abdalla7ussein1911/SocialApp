
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { User } from '../interfaces/user.interface';
import { CheckPlateFormService } from './check-plate-form.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly checkPlateFormService = inject(CheckPlateFormService);
  private readonly router = inject(Router);

  userData = signal<User | null>(null);

  register(data: object): Observable<any> {
    return this.http.post(
      `${environment.baseURL}/users/signup`,
      data
    );
  }

  login(data: object): Observable<any> {
    return this.http.post(
      `${environment.baseURL}/users/signin`,
      data
    );
  }

  setUserData(data: User): void {
    this.userData.set(data);
  }

  loadUserData(): void {
    if (!this.checkPlateFormService.isBrowser()) {
      return;
    }

    const token = localStorage.getItem('userToken');
    const storedUser = localStorage.getItem('userData');

    if (!token) {
      this.userData.set(null);
      return;
    }

    if (storedUser) {
      try {
        this.userData.set(JSON.parse(storedUser) as User);
      } catch {
        localStorage.removeItem('userData');
        this.userData.set(null);
      }
    }
  }

  changePassword(data: {
    password: string;
    newPassword: string;
  }): Observable<any> {
    const token = this.checkPlateFormService.isBrowser()
      ? localStorage.getItem('userToken')
      : null;

    return this.http.patch(
      `${environment.baseURL}/users/change-password`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token ?? ''}`
        }
      }
    );
  }

  logout(): void {
    if (this.checkPlateFormService.isBrowser()) {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
    }

    this.userData.set(null);
    this.router.navigate(['/login']);
  }
}
