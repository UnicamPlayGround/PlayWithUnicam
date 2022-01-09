import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenuPage } from './menu.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/admin/dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    component: MenuPage,
    children: [
      { path: 'dashboard', loadChildren: () => import('../../player/dashboard/dashboard.module').then(m => m.DashboardPageModule) },
      { path: 'users', loadChildren: () => import('../users/users.module').then(m => m.UsersPageModule) },
      { path: 'account', loadChildren: () => import('../../account/account.module').then(m => m.AccountPageModule) },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuPageRoutingModule { }
