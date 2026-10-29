
import { Component, inject, signal } from '@angular/core';
import {FormControl,FormGroup,ReactiveFormsModule,Validators} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/interfaces/user.interface';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  message = '';
  isSuccess = false;

  loginForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required
    ])
  });

  test(): void {
    if (this.loginForm.invalid || this.isLoading()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.message = '';
    this.isSuccess = false;

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);

        if (res.success && res.data?.token && res.data?.user) {
          const user: User = res.data.user;

          localStorage.setItem('userToken', res.data.token);
          localStorage.setItem('userData', JSON.stringify(user));
          this.authService.setUserData(user);
          this.router.navigate(['feed']);

          this.isSuccess = true;
          this.message = res.message || 'Login successful!';


        } else {
          this.message = res.message || 'Login failed. Please try again.';
        }
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.isSuccess = false;
        this.message =
          err.error?.message || 'Login failed. Please try again.';
      }
    });
  }
}

