import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GamesPageRoutingModule } from './games-routing.module';

import { GamesPage } from './games.page';
import { EditGamePageModule } from '../modal-pages/edit-game/edit-game.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    GamesPageRoutingModule,
    EditGamePageModule
  ],
  declarations: [GamesPage]
})
export class GamesPageModule { }
