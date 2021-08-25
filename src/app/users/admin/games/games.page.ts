import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';

@Component({
  selector: 'app-games',
  templateUrl: './games.page.html',
  styleUrls: ['./games.page.scss'],
})
export class GamesPage implements OnInit {
  segment: string = "lista";
  games = [];

  constructor(
    private http: HttpClient,
    private loginService: LoginService,
    private errorManager: ErrorManagerService
  ) {
    this.loadGames();
  }

  ngOnInit() {
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
  }

  async loadGames(event?) {
    const token_value = (await this.loginService.getToken()).value;
    const headers = { 'token': token_value };

    this.http.get('/games', { headers }).subscribe(
      async (res) => {
        this.games = this.games.concat(res['results']);
      },
      async (res) => {
        this.errorManager.stampaErrore(res, 'Impossibile caricare i giochi!');
      });
  }
}
