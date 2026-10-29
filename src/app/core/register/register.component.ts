import { Component, inject, signal } from '@angular/core';
import {AbstractControl,FormControl,FormGroup,ReactiveFormsModule,Validators} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isLoading = signal<boolean>(false);
  message = '';
  isSuccess = false;

  registerform = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-Z\s]+$/)
    ]),

    username: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50)
    ]),

    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),

    dataOfbirth: new FormControl('', [
      Validators.required
    ]),

    gender: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(male|female)$/)
    ]),

    password: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)
    ]),

    repassword: new FormControl('', [
      Validators.required
    ])
  }, {
    validators: this.confirmPassword
  });

  confirmPassword(fg: AbstractControl) {
    const passwordValue = fg.get('password')?.value;
    const repasswordValue = fg.get('repassword')?.value;

    if (passwordValue !== repasswordValue) {
      return { mismatched: true };
    }

    return null;
  }

  registerFormSubmit(): void {
    if (this.registerform.invalid || this.isLoading()) {
      this.registerform.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.message = '';
    this.isSuccess = false;

    const form = this.registerform.getRawValue();

    const userData = {
      name: form.name,
      username: form.username,
      email: form.email,
      dateOfBirth: form.dataOfbirth,
      gender: form.gender,
      password: form.password,
      rePassword: form.repassword
    };

    this.authService.register(userData).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);

        if (res.success) {
          this.isSuccess = true;
          this.message = res.message || 'Registration successful!';
          this.router.navigate(['/login']);
          return;
        }

        this.isSuccess = false;
        this.message = res.message || 'Registration failed.';
      },

      error: (err: any) => {
        this.isLoading.set(false);
        this.isSuccess = false;

        this.message =
          err.error?.message || 'Registration failed. Please try again.';

        console.log('Registration error:', err);
      }
    });
  }
}

