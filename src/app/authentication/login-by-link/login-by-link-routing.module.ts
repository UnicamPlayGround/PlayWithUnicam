import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginByLinkPage } from './login-by-link.page';

const routes: Routes = [
  {
    path: '',
    component: LoginByLinkPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginByLinkPageRoutingModule {}
