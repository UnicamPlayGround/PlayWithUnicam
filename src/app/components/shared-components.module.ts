import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ProgressBarTimerComponent } from './timer-components/progress-bar-timer/progress-bar-timer.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ProgressBarTimerComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ],
  exports: [
    ProgressBarTimerComponent,
  ]
})
export class SharedComponentsModule { }