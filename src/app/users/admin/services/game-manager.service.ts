import { Injectable } from '@angular/core';
import { Game } from 'src/app/components/game';

@Injectable({
  providedIn: 'root'
})
export class GameManagerService {
  games: Game[];
  gameEdited: Game;

  constructor() { }

  /**
   * Crea un nuovo gioco aggiungendolo al DB tramite chiamata REST.
   */
  createGame(newGame: Game) {
    //TODO:
  }

  /**
   * Elimina un gioco esistente dal DB tramite chiamata REST.
   */
  deleteGame(game: Game) {
    //TODO:
  }

  /**
   * Modifica un gioco esistente nel DB tramite chiamata REST.
   */
  editGame(game: Game) {
    //TODO:
  }
}
