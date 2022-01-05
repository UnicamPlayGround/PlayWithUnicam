import { Injectable } from '@angular/core';
import { Game } from 'src/app/components/game';
import { GameType } from 'src/app/components/game-type';
import { GooseGameEditorComponent } from 'src/app/PlayWithUnicam-Games/goose-game/components/goose-game-editor/goose-game-editor.component';
import { MemoryGameEditorPage } from 'src/app/PlayWithUnicam-Games/memory-game/components/memory-game-editor/memory-game-editor.page';
import { EditorItem } from '../../components/editor-container/editor-item';

@Injectable()
export class GameEditorService {

  private games: Game[] = [
    new Game("Gioco dell'Oca", GameType.TURNI, 1, 6, "/goose-game", GooseGameEditorComponent),
    new Game("Memory MULTI", GameType.NORMALE, 1, 10, "/memory-game", MemoryGameEditorPage),
    new Game("Memory SINGLE", GameType.NORMALE, 1, 1, "/memory", MemoryGameEditorPage)
  ];

  /**
   * Ritorna l'EditorItem contenente l'opportuno editor component in base al config
   * del gioco passato in input.
   * @param config Il file di configurazione del gioco di cui si vuole ottenere l'editor.
   * @returns Un oggetto EditorItem contenente l'editor e il config.
   */
  getProperEditor(config: any) {
    var game = this.games.find(game => game.getName() == config.game_name)
    if (game) return new EditorItem(game.getEditor(), config);
    else return null;
  }

  /**
   * Ritorna la lista dei giochi attualmente sviluppati.
   * @returns l'array dei giochi
   */
  getGames() {
    return this.games;
  }
}
