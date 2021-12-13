import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuestionModalPageRoutingModule } from './question-modal-routing.module';

import { QuestionModalPage, SafePipe } from './question-modal.page';
import { TimerComponent } from 'src/app/components/timer/timer.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuestionModalPageRoutingModule
  ],
  declarations: [QuestionModalPage, SafePipe, TimerComponent]
})
export class QuestionModalPageModule { }
