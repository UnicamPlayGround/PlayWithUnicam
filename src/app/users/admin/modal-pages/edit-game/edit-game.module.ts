import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EditGamePageRoutingModule } from './edit-game-routing.module';
import { EditGamePage } from './edit-game.page';
import { EditorContainerComponent } from '../../components/editor-container/editor-container.component';
import { EditorDirective } from '../../components/editor-container/editor.directive';
import { GooseGameEditorComponent } from 'src/app/mgp_games/goose-game/components/goose-game-editor/goose-game-editor.component';
import { GameEditorService } from '../../services/game-editor/game-editor.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    EditGamePageRoutingModule
  ],
  providers: [GameEditorService],
  declarations: [EditGamePage, EditorContainerComponent, EditorDirective, GooseGameEditorComponent],
  // La lista dei componenti da istanziare dinamicamente.
  entryComponents: [GooseGameEditorComponent]
})
export class EditGamePageModule { }
