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
  lobby = { codice: null, admin_lobby: null, pubblica: false, min_giocatori: 0, max_giocatori: 0, nome: null, link: null, regolamento: null };
  giocatori = [];
  // private timerInfoLobby;
  // private timerGiocatori;
  private timerPing;
  // private timerPartita;
  mostraInfoLobby = false;
  mostraInfoGioco = false;

  constructor(
    private errorManager: ErrorManagerService,
    private timerService: TimerServiceService,
    private lobbyManager: LobbyManagerService,
    private alertCreator: AlertCreatorService,
    private loginService: LoginService,
    private router: Router
  ) {
    this.ping();
    this.timerPing = timerService.getTimer(() => { this.ping() }, 4000);

    window.addEventListener('beforeunload', (event) => {
      //TODO vedere per Firefox
      event.returnValue = '';
    });
  }

  ngOnInit() {
  }

  /**
   * Cambia il valore di 'mostraInfoLobby' che determina l'espansione della relativa card
   */
  espandiInfoLobby() {
    this.mostraInfoLobby = !this.mostraInfoLobby;
  }

  /**
   * Cambia il valore di 'mostraInfoGioco' che determina l'espansione della relativa card
   */
  espandiInfoGioco() {
    this.mostraInfoGioco = !this.mostraInfoGioco;
  }

  /**
   * Carica le Informazioni della Lobby; se il vecchio admin abbandona la Lobby e 
   * l'Utente corrente viene scelto come nuovo
   * Admin, allora viene reinderizzato alla pagina "/lobby-admin".
   */
  private async loadInfoLobby() {
    (await this.lobbyManager.loadInfoLobby()).subscribe(
      async (res) => {
        this.lobby = res['results'][0];
        const decodedToken: any = jwt_decode((await this.loginService.getToken()).value);

        if (decodedToken.username === this.lobby.admin_lobby) {
          this.timerService.stopTimers(this.timerPing);
          this.router.navigateByUrl('/lobby-admin', { replaceUrl: true });
          this.alertCreator.createInfoAlert("Sei il nuovo admin", "Il vecchio admin ha abbandonato la partita e sei stato scelto per prendere il suo posto!");
        }
      },
      async (res) => {
        this.timerService.stopTimers(this.timerPing);
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'Impossibile caricare la lobby!');
      });
  }

  /**
   * Carica i Partecipanti alla Lobby.
   */
  private async loadGiocatori() {
    console.log("sto caricando i giocatori...");

    (await this.lobbyManager.getPartecipanti()).subscribe(
      async (res) => {
        this.giocatori = res['results'];
        console.log(this.giocatori);
      },
      async (res) => {
        this.timerService.stopTimers(this.timerPing);
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'Impossibile caricare la lobby!');
      });
  }

  /**
   * Carica le Informazioni della Partita, appena l'Admin avvia la partita 
   * il Giocatore viene reinderizzato alla Pagina del Gioco.
   */
  private async loadInfoPartita() {
    (await this.lobbyManager.loadInfoPartita()).subscribe(
      async (res) => {
        var partita = res['results'];
        if (partita)
          if (!partita.terminata) {
            this.timerService.stopTimers(this.timerPing);
            this.router.navigateByUrl(this.lobby.link, { replaceUrl: true });
          }
      },
      async (res) => {
        this.timerService.stopTimers(this.timerPing);
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'Impossibile caricare la lobby!');
      });
  }

  /**
   * Abbandona la Lobby.
   */
  async abbandonaLobby() {
    this.alertCreator.createConfirmationAlert('Sei sicuro di voler abbandonare la lobby?',
      async () => {
        this.timerService.stopTimers(this.timerPing);
        (await this.lobbyManager.abbandonaLobby()).subscribe(
          async (res) => {
            this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
          },
          async (res) => {
            this.timerPing = this.timerService.getTimer(() => { this.ping() }, 4000);
            this.errorManager.stampaErrore(res, 'Abbandono fallito');
          }
        );
      });
  }

  /**
   * Esegue l'operazione di Ping per segnalare al Server
   * che è ancora presente all'interno della Lobby.
   */
  private async ping() {
    console.log("ping...");
    (await this.lobbyManager.ping()).subscribe(
      async (res) => {
        this.loadInfoLobby();
        this.loadGiocatori();
        this.loadInfoPartita();
      },
      async (res) => {
        this.timerService.stopTimers(this.timerPing);
        this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'Ping fallito');
      }
    );
  }

}