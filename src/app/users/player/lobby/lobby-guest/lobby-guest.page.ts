import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';

@Component({
  selector: 'app-lobby-guest',
  templateUrl: './lobby-guest.page.html',
  styleUrls: ['./lobby-guest.page.scss'],
})
export class LobbyGuestPage implements OnInit {
  segment: string = "impostazioni";
  lobby = { codice: null, pubblica: false, min_giocatori: 0, max_giocatori: 0 };
  giocatori = [];

  constructor(
    private http: HttpClient,
    private loginService: LoginService,
    private errorManager: ErrorManagerService
  ) {
    this.loadInfoLobby();
    this.loadGiocatori();
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
        //TODO
        // this.reloadManager.completaReload(event);
      },
      async (res) => {
        //TODO:gestione stampa errore
        this.errorManager.stampaErrore(res, 'Impossibile caricare la Lobby!');
        // this.reloadManager.completaReload(event);
      });
  }

  async loadGiocatori() {
    const token_value = (await this.loginService.getToken()).value;
    const headers = { 'token': token_value };

    this.http.get('/lobby/giocatori', { headers }).subscribe(
      async (res) => {
        this.giocatori = res['results'];
        console.log(this.giocatori);
        //TODO
        // this.reloadManager.completaReload(event);
      },
      async (res) => {
        //TODO:gestione stampa errore
        this.errorManager.stampaErrore(res, 'Impossibile caricare la Lobby!');
        // this.reloadManager.completaReload(event);
      });
  }

}