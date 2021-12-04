import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FadeHeaderDirective } from './fade-header.directive';
import { HideHeaderDirective } from './hide-header.directive';



@NgModule({
  declarations: [
    FadeHeaderDirective,
    HideHeaderDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    FadeHeaderDirective,
    HideHeaderDirective
  ]
})
export class SharedDirectivesModule { }
