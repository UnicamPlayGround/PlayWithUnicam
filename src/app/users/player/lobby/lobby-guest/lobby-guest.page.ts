import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LobbyManagerService } from 'src/app/services/lobby-manager/lobby-manager.service';
import { TimerServiceService } from 'src/app/services/timer-service/timer-service.service';

@Component({
  selector: 'app-lobby-guest',
  templateUrl: './lobby-guest.page.html',
  styleUrls: ['./lobby-guest.page.scss'],
})
export class LobbyGuestPage implements OnInit {
  segment: string = "impostazioni";
  lobby = { codice: null, admin_lobby: null, pubblica: false, min_giocatori: 0, max_giocatori: 0 };
  giocatori = [];
  private timerGiocatori;
  private timerPing;

  constructor(
    private errorManager: ErrorManagerService,
    private timerService: TimerServiceService,
    private lobbyManager: LobbyManagerService,
    private alertCreator: AlertCreatorService,
    private router: Router
  ) {
    this.loadInfoLobby();
    this.loadGiocatori();
    this.ping();
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

  async abbandonaLobby() {
    this.alertCreator.createConfirmationAlert('Sei sicuro di voler abbandonare la lobby?', () => {
      this.abbandona();
    });
  }

  async abbandona() {
    console.log('HAI ABBANDONATO');
    async () => {
      (await this.lobbyManager.abbandonaLobby()).subscribe(
        async (res) => {
          this.timerService.stopTimer(this.timerGiocatori);
          this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        },
        async (res) => {
          this.errorManager.stampaErrore(res, 'Abbandono fallito');
        }
      );
    }
  }

  async ping() {
    console.log("ping...");
    (await this.lobbyManager.ping()).subscribe(
      async (res) => { },
      async (res) => {
        this.timerService.stopTimer(this.timerPing);
        this.errorManager.stampaErrore(res, 'Ping fallito');
      }
    );
  }

}