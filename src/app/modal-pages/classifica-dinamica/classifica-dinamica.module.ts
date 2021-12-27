import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClassificaDinamicaPageRoutingModule } from './classifica-dinamica-routing.module';

import { ClassificaDinamicaPage } from './classifica-dinamica.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClassificaDinamicaPageRoutingModule
  ],
  declarations: [ClassificaDinamicaPage]
})
export class ClassificaDinamicaPageModule {}
