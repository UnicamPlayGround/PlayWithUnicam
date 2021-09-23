import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthAdminGuard } from './guards/auth-admin/auth-admin.guard';
import { AuthGiocatoriGuard } from './guards/auth-giocatori/auth-giocatori.guard';
import { AuthUtentiGuard } from './guards/auth-utenti/auth-utenti.guard';

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
    loadChildren: () => import('./users/player/dashboard/dashboard.module').then(m => m.DashboardPageModule),
    canLoad: [AuthGiocatoriGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./users/admin/menu/menu.module').then(m => m.MenuPageModule),
    canLoad: [AuthAdminGuard]
  },
  {
    path: 'lobby-admin',
    loadChildren: () => import('./users/player/lobby/lobby-admin/lobby-admin.module').then(m => m.LobbyAdminPageModule),
    canLoad: [AuthGiocatoriGuard]
  },
  {
    path: 'lobby-guest',
    loadChildren: () => import('./users/player/lobby/lobby-guest/lobby-guest.module').then(m => m.LobbyGuestPageModule),
    canLoad: [AuthGiocatoriGuard]
  },
  {
    path: 'account',
    loadChildren: () => import('./users/account/account.module').then(m => m.AccountPageModule),
    canLoad: [AuthUtentiGuard]
  },
  {
    path: 'goose-game',
    loadChildren: () => import('./mgp_games/goose-game/goose-game.module').then(m => m.GooseGamePageModule),
    canLoad: [AuthGiocatoriGuard]
  },
  {
    path: 'lobby/join',
    loadChildren: () => import('./authentication/login-by-link/login-by-link.module').then(m => m.LoginByLinkPageModule)
  },
  {
    path: 'modal-login',
    loadChildren: () => import('./authentication/modal-login/modal-login.module').then(m => m.ModalLoginPageModule)
  },
  {
    path: 'editor',
    loadChildren: () => import('./mgp_games/goose-game/editor/editor.module').then(m => m.EditorPageModule),
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
