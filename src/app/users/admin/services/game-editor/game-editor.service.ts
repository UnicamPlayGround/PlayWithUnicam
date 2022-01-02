import { Injectable } from '@angular/core';
import { GooseGameEditorComponent } from 'src/app/mgp_games/goose-game/components/goose-game-editor/goose-game-editor.component';
import { MemoryGameEditorPage } from 'src/app/mgp_games/memory-game/components/memory-game-editor/memory-game-editor.page';
import { EditorItem } from '../../components/editor-container/editor-item';

@Injectable()
export class GameEditorService {

  /**
   * Ritorna l'EditorItem contenente l'opportuno editor component in base al config
   * del gioco passato in input.
   * @param config Il file di configurazione del gioco di cui si vuole ottenere l'editor.
   * @returns Un oggetto EditorItem contenente l'editor e il config.
   */
  getProperEditor(config) {
    switch (config.game) {
      case "goose-game":
        return new EditorItem(GooseGameEditorComponent, config);
      case "memory-game":
        return new EditorItem(MemoryGameEditorPage, config);
      default:
        return null;
    }
  }
}
