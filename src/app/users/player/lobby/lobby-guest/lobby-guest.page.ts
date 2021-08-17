import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LobbyManagerService } from 'src/app/services/lobby-manager/lobby-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import { TimerServiceService } from 'src/app/services/timer-service/timer-service.service';

@Component({
  selector: 'app-lobby-guest',
  templateUrl: './lobby-guest.page.html',
  styleUrls: ['./lobby-guest.page.scss'],
})
export class LobbyGuestPage implements OnInit {
  segment: string = "impostazioni";
  lobby = { codice: null, pubblica: false, min_giocatori: 0, max_giocatori: 0 };
  giocatori = [];
  private timerGiocatori;

  constructor(
    private http: HttpClient,
    private loginService: LoginService,
    private errorManager: ErrorManagerService,
    private timerService: TimerServiceService,
    private lobbyManager: LobbyManagerService
  ) {
    this.loadInfoLobby();
    this.loadGiocatori();
    this.timerGiocatori = timerService.getTimer(() => { this.loadGiocatori() }, 5000);
  }

  ngOnInit() {
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
  }

  //TODO commentare
  async loadInfoLobby() {
    const token_value = (await this.loginService.getToken()).value;
    const headers = { 'token': token_value };

    this.http.get('/lobby/info', { headers }).subscribe(
      async (res) => {
        this.lobby = res['results'][0];
        console.log(this.lobby);
      },
      async (res) => {
        this.timerService.stopTimer(this.timerGiocatori);
        this.errorManager.stampaErrore(res, 'Impossibile caricare la Lobby!');
      });
  }

  async loadGiocatori() {
    console.log("sto caricando i giocatori...");

    (await this.lobbyManager.getPartecipanti()).subscribe(
      async (res) => {
        this.giocatori = res['results'];
        console.log(this.giocatori);
      },
      async (res) => {
        this.timerService.stopTimer(this.timerGiocatori);
        this.errorManager.stampaErrore(res, 'Impossibile caricare la Lobby!');
      });
  }

}