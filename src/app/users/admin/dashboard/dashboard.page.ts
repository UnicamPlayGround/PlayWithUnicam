import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Game } from 'src/app/components/game';
import { GameManagerService } from '../services/game-manager.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  list: Game[] = [];

  constructor(
    private router: Router,
    private gameManager: GameManagerService) { }

  ngOnInit() {
    this.list.push(new Game(1, "Memory single version", "NORMALE", 1, 4, "yooo"));
    this.list.push(new Game(2, "Gioco dell'Oca", "TURNI", 1, 4, "yeeee"));
    this.list.push(new Game(3, "Memory Multi", "NORMALE", 1, 4, "yaaaa"));
    this.list.push(new Game(4, "aaaaaa", "TURNI", 1, 4, "yuuuu"));
    this.list.push(new Game(5, "bbbbbb", "NORMALE", 1, 4, "yiiii"));
    this.list.push(new Game(6, "cccccc", "TURNI", 1, 4, "yxxxxx"));
  }

  editGame(game: Game) {
    this.gameManager.gameEdited = game;
    this.router.navigateByUrl("admin/edit-game");
  }
}
