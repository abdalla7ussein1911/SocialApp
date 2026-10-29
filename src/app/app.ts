
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('SocialApp');

  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    this.authService.loadUserData();
  }
}
