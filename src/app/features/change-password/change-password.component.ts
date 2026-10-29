
import { Component, inject, signal } from '@angular/core';
import {FormControl,FormGroup,ReactiveFormsModule,Validators,} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent {
  private readonly authService = inject(AuthService);

  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  passwordForm = new FormGroup({
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    newPassword: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/
        ),
      ],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  submitChangePassword(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { password, newPassword, confirmPassword } =
      this.passwordForm.getRawValue();

    if (newPassword !== confirmPassword) {
      this.errorMessage.set(
        'New password and confirmation do not match.'
      );
      return;
    }

    if (password === newPassword) {
      this.errorMessage.set(
        'The new password must be different from the current password.'
      );
      return;
    }

    this.isLoading.set(true);

    this.authService.changePassword({
      password,
      newPassword,
    }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.successMessage.set(
          response?.message || 'Password changed successfully.'
        );
        this.passwordForm.reset();
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error?.error?.message ||
          'Failed to change password. Check your current password and try again.'
        );
      },
    });
  }
}
