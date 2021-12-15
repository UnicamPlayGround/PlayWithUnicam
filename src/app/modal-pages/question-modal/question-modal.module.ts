import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuestionModalPageRoutingModule } from './question-modal-routing.module';

import { QuestionModalPage, SafePipe } from './question-modal.page';
import { SharedComponentsModule } from 'src/app/components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuestionModalPageRoutingModule,
    SharedComponentsModule
  ],
  declarations: [QuestionModalPage, SafePipe],
})
export class QuestionModalPageModule { }
