import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FadeHeaderDirective } from './fade-header.directive';



@NgModule({
  declarations: [
    FadeHeaderDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    FadeHeaderDirective
  ],
})
export class SharedDirectivesModule { }
