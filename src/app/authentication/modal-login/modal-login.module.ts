import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalLoginPageRoutingModule } from './modal-login-routing.module';

import { ModalLoginPage } from './modal-login.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalLoginPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [ModalLoginPage]
})
export class ModalLoginPageModule {}
