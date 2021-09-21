import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginByLinkPageRoutingModule } from './login-by-link-routing.module';

import { LoginByLinkPage } from './login-by-link.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    LoginByLinkPageRoutingModule
  ],
  declarations: [LoginByLinkPage]
})
export class LoginByLinkPageModule {}
