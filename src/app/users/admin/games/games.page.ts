import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-games',
  templateUrl: './games.page.html',
  styleUrls: ['./games.page.scss'],
})
export class GamesPage implements OnInit {
  segment: string = "lista";
  games = [];

  giochi = [
    { name: 'Gioco 1', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' },
    { name: 'Gioco 2', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' },
    { name: 'Gioco 3', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' },
    { name: 'Gioco 4', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' },
    { name: 'Gioco 5', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' },
    { name: 'Gioco 6', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' },
    { name: 'Gioco 7', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' },
    { name: 'Gioco 8', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' },
    { name: 'Gioco 9', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' },
    { name: 'Gioco 10', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' },
    { name: 'Gioco 11', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' },
    { name: 'Gioco 12', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' },
    { name: 'Gioco 13', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' },
    { name: 'Gioco 14', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' },
    { name: 'Gioco 15', min_players: 2, max_players: 6, img: 'https://bit.ly/376IQJU' }
  ]

  constructor() {
    this.loadGames();
  }

  ngOnInit() {
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
  }

  loadGames(event?) {
    this.games = this.games.concat(this.giochi);
  }
}
