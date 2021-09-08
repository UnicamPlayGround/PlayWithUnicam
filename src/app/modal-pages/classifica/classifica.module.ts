import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClassificaPageRoutingModule } from './classifica-routing.module';

import { ClassificaPage } from './classifica.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClassificaPageRoutingModule
  ],
  declarations: [ClassificaPage]
})
export class ClassificaPageModule {}
