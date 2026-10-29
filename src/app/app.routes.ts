import { Routes } from '@angular/router';
import { AuthComponent } from './layout/auth/auth.component';
import { MainComponent } from './layout/main/main.component';
import { authGuard } from './core/guards/auth-guard';


export const routes: Routes = [
  {path:'', redirectTo:'register',pathMatch:"full"},
  {
    path: '', component: AuthComponent, children: [
      { path: 'login', loadComponent: () => import('./core/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./core/register/register.component').then(m => m.RegisterComponent) },
      { path: 'forget', loadComponent: () => import('./core/forgetpassword/forgetpassword.component').then(m => m.ForgetpasswordComponent) },
    ]
  },

  {
    path: '', component: MainComponent, children: [
      { path: 'feed',canActivate:[authGuard] ,loadComponent: () => import('./features/feed/feed.component').then(m => m.FeedComponent) },
      {path: 'post-details/:id',canActivate: [authGuard],loadComponent: () =>import('./shared/post/post-details/post-details.component').then(m => m.PostDetailsComponent)},
      { path: 'profile',canActivate:[authGuard] , loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'notification',canActivate:[authGuard] , loadComponent: () => import('./features/notification/notification.component').then(m => m.NotificationComponent) },
      { path: 'change-password',canActivate: [authGuard],loadComponent: () =>import('./features/change-password/change-password.component').then(m => m.ChangePasswordComponent)},
      { path: 'notfound', loadComponent: () => import('./features/notfound/notfound.component').then(m => m.NotfoundComponent) }
    ]
  },

  {
    path:'**', loadComponent:()=>import('./features/notfound/notfound.component').then(m=>m.NotfoundComponent)
  }
];
