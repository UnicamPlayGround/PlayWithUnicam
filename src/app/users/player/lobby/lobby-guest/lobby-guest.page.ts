import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LobbyManagerService } from 'src/app/services/lobby-manager/lobby-manager.service';
import { TimerServiceService } from 'src/app/services/timer-service/timer-service.service';
import jwt_decode from 'jwt-decode';
import { LoginService } from 'src/app/services/login-service/login.service';

@Component({
  selector: 'app-lobby-guest',
  templateUrl: './lobby-guest.page.html',
  styleUrls: ['./lobby-guest.page.scss'],
})
export class LobbyGuestPage implements OnInit {
  segment: string = "impostazioni";
  lobby = { codice: null, admin_lobby: null, pubblica: false, min_giocatori: 0, max_giocatori: 0 };
  giocatori = [];
  private timerInfoLobby;
  private timerGiocatori;
  private timerPing;

  constructor(
    private errorManager: ErrorManagerService,
    private timerService: TimerServiceService,
    private lobbyManager: LobbyManagerService,
    private alertCreator: AlertCreatorService,
    private loginService: LoginService,
    private router: Router
  ) {
    this.loadInfoLobby();
    this.loadGiocatori();
    this.ping();
    this.timerInfoLobby = timerService.getTimer(() => { this.loadInfoLobby() }, 5000);
    this.timerGiocatori = timerService.getTimer(() => { this.loadGiocatori() }, 5000);
    this.timerPing = timerService.getTimer(() => { this.ping() }, 4000);

    window.addEventListener('beforeunload', (event) => {
      event.returnValue = '';
    });
  }

  ngOnInit() {
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
  }

  //TODO commentare
  async loadInfoLobby() {
    (await this.lobbyManager.loadInfoLobby()).subscribe(
      async (res) => {
        this.lobby = res['results'][0];
        console.log(this.lobby);
        const decodedToken: any = jwt_decode((await this.loginService.getToken()).value);

        if (decodedToken.username === this.lobby.admin_lobby) {
          this.timerService.stopTimers(this.timerInfoLobby, this.timerGiocatori, this.timerPing);
          this.router.navigateByUrl('/lobby-admin', { replaceUrl: true });
          this.alertCreator.createInfoAlert("Sei il nuovo admin", "Il vecchio admin ha abbandonato la partita e sei stato scelto per prendere il suo posto!");
        }
      },
      async (res) => {
        this.timerService.stopTimers(this.timerInfoLobby, this.timerGiocatori, this.timerPing);
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
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
        this.timerService.stopTimers(this.timerInfoLobby, this.timerGiocatori, this.timerPing);
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'Impossibile caricare la Lobby!');
      });
  }

  async abbandonaLobby() {
    this.alertCreator.createConfirmationAlert('Sei sicuro di voler abbandonare la lobby?',
      async () => {
        (await this.lobbyManager.abbandonaLobby()).subscribe(
          async (res) => {
            this.timerService.stopTimers(this.timerInfoLobby, this.timerGiocatori, this.timerPing);
            this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
          },
          async (res) => {
            this.errorManager.stampaErrore(res, 'Abbandono fallito');
          }
        );
      });
  }

  async ping() {
    console.log("ping...");
    (await this.lobbyManager.ping()).subscribe(
      async (res) => { },
      async (res) => {
        this.timerService.stopTimers(this.timerInfoLobby, this.timerGiocatori, this.timerPing);
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'Ping fallito');
      }
    );
  }

}