import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LobbyManagerService } from 'src/app/services/lobby-manager/lobby-manager.service';
import { TimerController } from 'src/app/services/timer-controller/timer-controller.service';
import jwt_decode from 'jwt-decode';
import { LoginService } from 'src/app/services/login-service/login.service';

@Component({
  selector: 'app-lobby-guest',
  templateUrl: './lobby-guest.page.html',
  styleUrls: ['./lobby-guest.page.scss'],
})
export class LobbyGuestPage implements OnInit, OnDestroy {
  lobby = { codice: null, admin_lobby: null, pubblica: false, min_giocatori: 0, max_giocatori: 0, nome: null, link: null, regolamento: null };
  giocatori = [];
  private timerPing;
  mostraInfoLobby = false;
  mostraInfoGioco = false;
  redirectPath: string;

  constructor(
    private errorManager: ErrorManagerService,
    private timerController: TimerController,
    private lobbyManager: LobbyManagerService,
    private alertCreator: AlertCreatorService,
    private loginService: LoginService,
    private router: Router
  ) {
    window.addEventListener('beforeunload', this.beforeUnloadListener);

    this.loginService.getUserType().then(
      tipoUtente => {
        if (tipoUtente) {
          if (tipoUtente == 'ADMIN') this.redirectPath = '/admin/dashboard';
          else this.redirectPath = '/player/dashboard';
        }
      }
    );
  }

  ngOnInit() {
    setTimeout(() => {
      this.ping();
    }, 0);
    this.timerPing = this.timerController.getTimer(() => { this.ping() }, 2000);
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeunload', this.beforeUnloadListener);
  }

  beforeUnloadListener = (event) => {
    event.preventDefault();
    return event.returnValue = "Sei sicuro di voler uscire dal sito?";
  };

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
          this.timerController.stopTimers(this.timerPing);
          this.router.navigateByUrl('/lobby-admin', { replaceUrl: true });
          this.alertCreator.createInfoAlert("Sei il nuovo admin", "Il vecchio admin ha abbandonato la partita e sei stato scelto per prendere il suo posto!");
        }
      },
      async (res) => {
        this.timerController.stopTimers(this.timerPing);
        this.router.navigateByUrl(this.redirectPath, { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'Impossibile caricare la lobby!');
      });
  }

  /**
   * Carica i Partecipanti alla Lobby.
   */
  private async loadGiocatori() {
    (await this.lobbyManager.getPartecipanti()).subscribe(
      async (res) => {
        this.giocatori = res['results'];
      },
      async (res) => {
        this.timerController.stopTimers(this.timerPing);
        this.router.navigateByUrl(this.redirectPath, { replaceUrl: true });
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
            this.timerController.stopTimers(this.timerPing);
            this.router.navigateByUrl(this.lobby.link, { replaceUrl: true });
          }
      },
      async (res) => {
        this.timerController.stopTimers(this.timerPing);
        this.router.navigateByUrl(this.redirectPath, { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'Impossibile caricare la lobby!');
      });
  }

  /**
   * Abbandona la Lobby.
   */
  async abbandonaLobby() {
    this.alertCreator.createConfirmationAlert('Sei sicuro di voler abbandonare la lobby?',
      async () => {
        this.timerController.stopTimers(this.timerPing);
        (await this.lobbyManager.abbandonaLobby()).subscribe(
          async (res) => {
            this.router.navigateByUrl(this.redirectPath, { replaceUrl: true });
          },
          async (res) => {
            this.timerPing = this.timerController.getTimer(() => { this.ping() }, 4000);
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
    (await this.lobbyManager.ping()).subscribe(
      async (res) => {
        this.loadInfoLobby();
        this.loadGiocatori();
        this.loadInfoPartita();
      },
      async (res) => {
        this.timerController.stopTimers(this.timerPing);
        this.router.navigateByUrl(this.redirectPath, { replaceUrl: true });
        this.errorManager.stampaErrore(res, 'Ping fallito');
      }
    );
  }

}