import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./authentication/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./authentication/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'registration',
    loadChildren: () => import('./authentication/registration/registration.module').then(m => m.RegistrationPageModule)
  },
  {
    path: 'player/dashboard',
    loadChildren: () => import('./users/player/dashboard/dashboard.module').then(m => m.DashboardPageModule)
    //TODO: mettere authguard
  },
  {
    path: 'admin',
    loadChildren: () => import('./users/admin/menu/menu.module').then(m => m.MenuPageModule)
    //TODO: mettere authguard
  },
  {
    path: 'lobby',
    loadChildren: () => import('./users/player/lobby/lobby-home/lobby-home.module').then(m => m.LobbyHomePageModule)
  },  {
    path: 'lobby-guest',
    loadChildren: () => import('./users/player/lobby/lobby-guest/lobby-guest.module').then( m => m.LobbyGuestPageModule)
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
