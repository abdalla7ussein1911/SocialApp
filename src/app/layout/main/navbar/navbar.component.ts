import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FlowbiteService } from '../../../core/services/flowbite.service';
import { AuthService } from '../../../core/services/auth.service';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  private readonly flowbiteService = inject(FlowbiteService);
  private readonly authService = inject(AuthService);

  userData = this.authService.userData;

  ngOnInit(): void {
    this.authService.loadUserData();

    this.flowbiteService.loadFlowbite(() => {
      initFlowbite();
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
