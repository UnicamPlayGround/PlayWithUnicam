import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuestionModalPage } from './question-modal.page';

const routes: Routes = [
  {
    path: '',
    component: QuestionModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuestionModalPageRoutingModule {}
