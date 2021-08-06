import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreaLobbyPageRoutingModule } from './crea-lobby-routing.module';

import { CreaLobbyPage } from './crea-lobby.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreaLobbyPageRoutingModule
  ],
  declarations: [CreaLobbyPage]
})
export class CreaLobbyPageModule { }
