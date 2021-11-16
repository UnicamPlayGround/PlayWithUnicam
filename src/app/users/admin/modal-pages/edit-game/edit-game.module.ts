import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EditGamePageRoutingModule } from './edit-game-routing.module';
import { EditGamePage } from './edit-game.page';
import { EditorContainerComponent } from '../../components/editor-container/editor-container.component';
import { EditorDirective } from '../../components/editor-container/editor.directive';
import { GameEditorService } from '../../services/game-editor/game-editor.service';
import { NoEditorWarningComponent } from '../../components/no-editor-warning/no-editor-warning.component';
import { GamesComponentsModule } from 'src/app/mgp_games/games-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    EditGamePageRoutingModule,
    GamesComponentsModule,
  ],
  providers: [GameEditorService],
  declarations: [
    EditGamePage,
    EditorContainerComponent,
    EditorDirective,
    NoEditorWarningComponent,
  ]
})
export class EditGamePageModule { }
