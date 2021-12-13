import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Game } from 'src/app/components/game';
import { GameManagerService } from '../services/game-manager.service';

@Component({
  selector: 'app-edit-game',
  templateUrl: './edit-game.page.html',
  styleUrls: ['./edit-game.page.scss'],
})
export class EditGamePage implements OnInit {
  segment: string = "info";
  gameName: String = "Memory";
  active: boolean = false;
  regulation: String;
  game: Game = new Game(-1, "", "", -1, -1, "");

  constructor(
    private router: Router,
    private gameManager: GameManagerService
  ) { }

  ngOnInit() {
    if (this.gameManager.gameEdited) {
      this.game = this.gameManager.gameEdited;
    } else
      this.router.navigateByUrl("/admin", { replaceUrl: true })
  }

  print() {
    console.log(this.gameName);
    console.log(this.active);
    console.log(this.regulation);
  }
}
